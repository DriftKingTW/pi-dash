<template>
  <div class="flex h-full flex-col overflow-hidden">
    <div class="min-h-0 flex-1 overflow-y-auto px-3 py-1">
      <div
        v-for="(row, index) in rows"
        :key="row.key"
        class="sns-row flex items-center gap-3 py-2"
        :class="{
          'is-loading': row.status === 'loading',
          'is-error': row.status === 'error',
          'is-updated': row.updated,
          'border-t border-line': index > 0,
        }"
      >
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full"
          :class="row.logo === 'pixiv' ? 'bg-white' : ''"
        >
          <!-- Fills the avatar the way the Fanbox logo does. The original
               drew this at 48px inside a 40px circle, so the glyph ran to the
               edges rather than sitting in the middle of it. -->
          <svg
            v-if="row.logo === 'pixiv'"
            class="h-full w-full"
            viewBox="0 0 24 24"
            :fill="PIXIV_BLUE"
          >
            <path :d="pixivPath" />
          </svg>
          <img v-else :src="fanboxLogo" alt="Fanbox Logo" class="h-full w-full object-cover" />
        </div>

        <div class="min-w-0 flex-1">
          <div class="truncate text-sm">{{ row.title }}</div>
          <div class="truncate text-xs text-ink-dim">
            <template v-if="row.hasValue">
              <span class="stat-value">{{ row.valueText }}</span>
              <span class="stat-diff">
                (<span v-if="row.totalText">{{ row.totalText }} </span
                ><span :class="row.diff >= 0 ? 'text-ok' : 'text-crit'">{{
                  row.diffText
                }}</span
                >)
              </span>
            </template>
            <span v-else :class="row.status === 'error' ? 'text-crit' : 'text-ink-faint'">
              {{ row.placeholder }}
            </span>
          </div>
        </div>

        <div class="w-5 shrink-0 text-center">
          <span
            v-if="row.status === 'loading'"
            class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-transparent"
            :style="{ borderTopColor: PIXIV_BLUE, borderRightColor: PIXIV_BLUE }"
          />
          <i v-else-if="row.status === 'error'" class="mdi mdi-alert-circle text-crit" />
          <i v-else-if="row.updated" class="mdi mdi-check-circle text-ok" />
        </div>
      </div>
    </div>

    <div class="flex shrink-0 items-center gap-2 px-3 pt-1 pb-2 text-xs">
      <span class="min-w-0 flex-1 truncate" :class="footer.textClass">
        <i :class="['mdi', footer.icon, footer.iconClass, 'mr-1']" />
        {{ footer.text }}
      </span>
      <button
        class="glass-chip flex h-8 items-center gap-1.5 px-3 active:bg-white/20"
        @dblclick="resetDiff"
        @click="showDblClickHint"
      >
        <i class="mdi mdi-television-shimmer" /> Reset
      </button>
      <button
        class="glass-chip flex h-8 items-center gap-1.5 px-3 active:bg-white/20 disabled:opacity-40"
        :disabled="loading"
        @click="refresh"
      >
        <i class="mdi mdi-refresh" :class="{ 'animate-spin': loading }" /> Reload
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from "vue";
import axios from "axios";
import { siPixiv } from "simple-icons";

import fanboxLogo from "@/assets/images/pixivfanbox.png";
import { useUiStore } from "@/stores/ui";

// The pixiv statistics route scrapes with a headless browser and takes ~14s on
// the Pi, well past the global axios default. Safe to wait: this runs hourly.
const PIXIV_TIMEOUT = 60000;

const REFRESH_INTERVAL = 60 * 60 * 1000; // 60 minutes
// A scrape that fails shouldn't leave the block stale for a whole hour
const RETRY_INTERVAL = 5 * 60 * 1000; // 5 minutes

// pixiv blue, shared by every "this is being fetched" cue
const PIXIV_BLUE = `#${siPixiv.hex}`;
const pixivPath = siPixiv.path;

const COUNT_DURATION = 900; // time spent counting a number up to its new reading
const FLASH_DURATION = 1600; // how long the "just updated" check stays on a row

// One row each, fetched in order. Every row carries its own status, so a scrape
// that dies takes down its row only and says so.
const SOURCES = [
  {
    key: "pixivMain", logo: "pixiv", label: "pixiv / driftkingtw",
    path: "/pixiv/statistics?user=driftkingtw", timeout: PIXIV_TIMEOUT,
    unit: "Followers", valueField: "followerCount", diffField: "followerCount",
    baselineKey: "pixivMainFollowersCount",
  },
  {
    key: "pixivSub", logo: "pixiv", label: "pixiv / dkaze",
    path: "/pixiv/statistics?user=dkaze", timeout: PIXIV_TIMEOUT,
    unit: "Followers", valueField: "followerCount", diffField: "followerCount",
    baselineKey: "pixivSubFollowersCount",
  },
  {
    key: "fanbox", logo: "fanbox", label: "Fanbox / dkaze",
    path: "/pixiv/statistics/fanbox?user=dkaze",
    unit: "Fans", valueField: "fans", diffField: "pledge",
    baselineKey: "fanboxPledgeNumber", currency: "¥",
  },
];

const bySource = (value) =>
  SOURCES.reduce((acc, source) => {
    acc[source.key] = value(source);
    return acc;
  }, {});

// The numbers a row animates: its headline count, plus the pledge on Fanbox
const countedFields = (source) => [...new Set([source.valueField, source.diffField])];

const ui = useUiStore();
const loading = ref(true);
const lastUpdate = ref(null);
const nextAttempt = ref(null);

const stats = reactive(bySource(() => ({})));
const status = reactive(bySource(() => "loading"));
const updated = reactive(bySource(() => false));
const baselines = reactive(bySource((s) => Number(localStorage.getItem(s.baselineKey))));
const display = reactive(
  bySource((source) =>
    countedFields(source).reduce((acc, field) => {
      acc[field] = null;
      return acc;
    }, {})
  )
);

const frames = {};
const flashTimers = {};
let timer = null;

function numberWithCommas(x) {
  if (x === undefined || x === null || isNaN(x)) return "—";
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Counting up to the new reading instead of swapping it in is the only way an
// hourly update registers on a screen you walk past
function countTo(key, field, value) {
  const id = `${key}.${field}`;
  // The scraper hands some counts back as strings, and a row only shows a
  // number once it has one to show
  const to = Number(value);

  cancelAnimationFrame(frames[id]);

  if (!Number.isFinite(to)) {
    display[key][field] = null;
    return;
  }

  // A first reading counts up from zero, later ones from what's on screen
  const from = Number.isFinite(display[key][field]) ? display[key][field] : 0;

  if (from === to) {
    display[key][field] = to;
    return;
  }

  const start = performance.now();
  const step = (now) => {
    const progress = Math.min((now - start) / COUNT_DURATION, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    display[key][field] = Math.round(from + (to - from) * eased);
    if (progress < 1) frames[id] = requestAnimationFrame(step);
  };

  frames[id] = requestAnimationFrame(step);
}

function flash(key) {
  clearTimeout(flashTimers[key]);
  updated[key] = true;
  flashTimers[key] = setTimeout(() => {
    updated[key] = false;
  }, FLASH_DURATION);
}

async function load(source) {
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}${source.path}`,
      source.timeout ? { timeout: source.timeout } : {}
    );

    // The server answers a failed scrape with an empty object, and holding on
    // to the last good numbers beats blanking the block back to 'Loading...'
    // until the next round
    if (!res.data.name) throw new Error(`empty ${source.key} response`);

    stats[source.key] = { ...res.data };

    if (
      localStorage.getItem(source.baselineKey) === null &&
      !isNaN(res.data[source.diffField])
    ) {
      localStorage.setItem(source.baselineKey, res.data[source.diffField]);
    }

    baselines[source.key] = Number(localStorage.getItem(source.baselineKey));
    countedFields(source).forEach((field) => countTo(source.key, field, res.data[field]));

    status[source.key] = "ok";
    flash(source.key);
    return true;
  } catch (e) {
    console.log(e);
    status[source.key] = "error";
    return false;
  }
}

async function loadAll() {
  loading.value = true;
  SOURCES.forEach((source) => {
    status[source.key] = "loading";
    updated[source.key] = false;
  });

  let succeeded = true;
  for (const source of SOURCES) {
    if (!(await load(source))) succeeded = false;
  }

  loading.value = false;

  // Only a clean pass moves the timestamp, so it tells you how fresh the
  // numbers on screen actually are
  if (succeeded) lastUpdate.value = new Date();
  return succeeded;
}

async function refresh() {
  const succeeded = await loadAll();
  const wait = succeeded ? REFRESH_INTERVAL : RETRY_INTERVAL;

  clearTimeout(timer);
  nextAttempt.value = new Date(Date.now() + wait);
  timer = setTimeout(refresh, wait);
}

function resetDiff() {
  SOURCES.forEach((source) => {
    const value = stats[source.key][source.diffField];
    if (!isNaN(value)) localStorage.setItem(source.baselineKey, value);
  });
  ui.triggerSnackbar({ status: "success", text: "Status has been reset." });
  refresh();
}

function showDblClickHint() {
  ui.triggerSnackbar({ status: "info", text: "Double click to reset status." });
}

const rows = computed(() =>
  SOURCES.map((source) => {
    const rowStatus = status[source.key];
    const shown = display[source.key];
    const value = shown[source.valueField];
    const total = shown[source.diffField];
    const currency = source.currency || "";
    const hasValue = Number.isFinite(value);
    const diff = Number.isFinite(total) ? total - baselines[source.key] : null;

    return {
      key: source.key,
      logo: source.logo,
      status: rowStatus,
      updated: updated[source.key],
      // A row that failed before it ever loaded has no name to show, and the
      // old 'Loading...' there read as though it were still working
      title:
        stats[source.key].name ||
        (rowStatus === "loading" ? "Loading..." : source.label),
      hasValue,
      valueText: hasValue ? `${numberWithCommas(value)} ${source.unit}` : "",
      // Fanbox counts fans but tracks the pledge, so it shows both
      totalText:
        source.diffField !== source.valueField && Number.isFinite(total)
          ? `${numberWithCommas(total)}${currency}`
          : "",
      diff,
      // The sign keeps the space it has always had after it: '(+ 137)'
      diffText:
        diff === null
          ? ""
          : `${diff >= 0 ? "+" : "-"} ${numberWithCommas(Math.abs(diff))}${currency}`,
      placeholder:
        rowStatus === "error"
          ? "Update failed"
          : rowStatus === "loading"
            ? "Fetching…"
            : "No data",
    };
  })
);

const failed = computed(() => SOURCES.some((s) => status[s.key] === "error"));

const retryAt = computed(() =>
  nextAttempt.value
    ? nextAttempt.value.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : ""
);

const footer = computed(() => {
  if (loading.value) {
    return {
      icon: "mdi-sync",
      iconClass: "text-[#0096fa]",
      textClass: "text-[#0096fa] pulsing",
      text: "Updating…",
    };
  }

  // A stale timestamp alone never explained itself, so a failed round says so
  // and names the time it tries again
  if (failed.value) {
    return {
      icon: "mdi-alert-circle",
      iconClass: "text-crit",
      textClass: "text-crit",
      text: `Update failed · retry ${retryAt.value}`,
    };
  }

  return {
    icon: "mdi-clock-outline",
    iconClass: "text-ink-faint",
    textClass: "text-ink-faint",
    text: lastUpdate.value ? lastUpdate.value.toLocaleString() : "",
  };
});

onMounted(refresh);

onUnmounted(() => {
  clearTimeout(timer);
  Object.values(flashTimers).forEach(clearTimeout);
  Object.values(frames).forEach(cancelAnimationFrame);
});
</script>

<style scoped>
.sns-row {
  position: relative;
  overflow: hidden;
}

/* The rows are fetched one after another, so a shimmer on each says which
   numbers are still in flight */
.sns-row.is-loading::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.07) 50%,
    transparent 100%
  );
  animation: sweep 1.6s ease-in-out infinite;
}

@keyframes sweep {
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
}

.sns-row.is-loading .stat-value,
.sns-row.is-loading .stat-diff,
.sns-row.is-error .stat-value,
.sns-row.is-error .stat-diff {
  opacity: 0.45;
}

/* pixiv blue, faded out over the row that just landed */
.sns-row.is-updated {
  animation: settle 1.6s ease-out;
}

@keyframes settle {
  from { background-color: rgba(0, 150, 250, 0.22); }
  to { background-color: transparent; }
}

.sns-row.is-error {
  box-shadow: inset 3px 0 0 var(--color-crit);
}

.stat-value,
.stat-diff {
  transition: opacity 0.4s ease;
}

.pulsing {
  animation: pulse 1.4s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}
</style>
