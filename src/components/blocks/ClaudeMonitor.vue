<template>
  <div class="panel flex flex-col overflow-hidden" :class="{ 'opacity-45': isStale }">
    <!-- Title row, the space the kettle button used to take at the bottom -->
    <div class="flex shrink-0 items-center gap-2 px-4 pt-4">
      <span class="text-sm font-semibold">Claude Code</span>
      <div class="flex-1" />
      <span class="flex items-center gap-1.5 text-[11px] text-ink-faint">
        <span
          class="h-1.5 w-1.5 rounded-full"
          :class="isStale ? 'bg-warn' : 'bg-ok'"
        />
        {{ isStale ? "Stale" : "Live" }}
      </span>
    </div>

    <!-- The card is 482x271 on the kiosk: wide and short. Two columns use that
         far better than one stacked one, and give the mark room to be more
         than an icon. -->
    <div class="flex min-h-0 flex-1 items-center gap-4 px-4 pb-4">
      <div class="flex w-[150px] shrink-0 flex-col items-center justify-center">
        <ClaudeRobot :size="120" :color="ACCENT" :asleep="!isSessionLive" />
        <div class="mt-2 max-w-[150px] truncate text-xs text-ink-faint">
          {{ sessionLabel }}
        </div>
      </div>

      <div class="min-w-0 flex-1">
        <template v-if="claude.loaded">
          <div v-for="w in claudeWindows" :key="w.label" class="mb-2">
            <div class="mb-1 flex justify-between text-xs">
              <span class="font-medium">{{ w.label }}</span>
              <span class="text-ink-faint">{{ w.resetsIn }}</span>
            </div>
            <div class="h-[18px] overflow-hidden rounded-full bg-surface-2">
              <div
                class="flex h-full items-center justify-center rounded-full transition-[width] duration-500"
                :class="w.colorClass"
                :style="{ width: Math.max(w.percent, 12) + '%' }"
              >
                <span class="text-[11px] font-bold">{{ w.percent }}%</span>
              </div>
            </div>
          </div>

          <div class="mt-3 flex items-baseline justify-between">
            <span class="text-base font-bold" :class="isStale ? '' : 'text-accent'">
              {{ claude.cost }}
            </span>
            <span class="text-xs text-ink-faint">
              {{ claude.tokens }} · {{ claude.messages }} msg
            </span>
          </div>

          <!-- Seven days of spend, scaled to the busiest day so the shape of
               the week reads even when the totals are small. -->
          <div class="mt-1 flex h-[76px] items-end gap-[3px]">
            <div
              v-for="(day, index) in week"
              :key="day.date"
              class="min-h-[2px] flex-1 rounded-sm transition-[height] duration-500"
              :class="index === week.length - 1 ? 'bg-accent' : 'bg-white/20'"
              :style="{ height: day.height + '%' }"
              :title="`${day.date}  ${day.label}`"
            />
          </div>

          <!-- The numbers outlive the machine that produced them: the server
               keeps serving the last reading while the Mac is asleep. Say so,
               rather than letting hours-old percentages pass as current. -->
          <div v-if="isStale" class="mt-1 text-xs text-warn">
            <i class="mdi mdi-alert-outline mr-1" />{{ staleLabel }}
          </div>
        </template>

        <div v-else class="text-xs text-ink-faint">
          {{ claude.error || "Loading Claude usage…" }}
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import axios from "axios";

import ClaudeRobot from "@/components/ClaudeRobot.vue";

const ACCENT = "#c4825e";
const POLL_INTERVAL_MS = 30000;
// Past this the percentages are shown as untrustworthy. A 5-hour window is
// long enough that a reading from earlier in the day says very little about
// what is left now.
const STALE_AFTER_S = 900;
// The status line only reports while a session is rendering it, so a recent
// reading is the closest thing to "Claude is running right now".
const SESSION_LIVE_WITHIN_S = 300;

let polling = true;

const claude = ref({
  loaded: false,
  error: "",
  fiveHour: null,
  sevenDay: null,
  model: "",
  project: "",
  cost: "",
  tokens: "",
  messages: 0,
  week: [],
  ageSeconds: 0,
});

function formatCost(dollars) {
  if (typeof dollars !== "number") return "—";
  return dollars >= 10 ? `$${dollars.toFixed(1)}` : `$${dollars.toFixed(2)}`;
}

function formatTokens(tokens) {
  if (typeof tokens !== "number") return "—";
  if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
  if (tokens >= 1000) return `${Math.round(tokens / 1000)}K`;
  return String(tokens);
}

function formatDuration(resetsAt) {
  if (!resetsAt) return "";
  const seconds = resetsAt - Math.floor(Date.now() / 1000);
  if (seconds <= 0) return "resets now";
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function describeWindow(label, window) {
  if (!window) return null;
  const percent = Math.round(window.pct);
  return {
    label,
    percent,
    // Same thresholds the T-QT desk monitor uses, so the two agree.
    colorClass: percent >= 80 ? "bg-crit" : percent >= 50 ? "bg-warn" : "bg-ok",
    resetsIn: formatDuration(window.reset),
  };
}

function applyUsage(data) {
  const limits = data.limits || {};
  const session = data.session || {};
  const today = data.today || {};
  // The reading is as old as the numbers were when the bridge built them, plus
  // however long the server has been serving them from its cache.
  const cached = (data.bridge && data.bridge.cachedSeconds) || 0;
  const age = typeof data.age === "number" ? data.age : 0;

  claude.value = {
    loaded: true,
    error: "",
    fiveHour: limits.h5 || null,
    sevenDay: limits.d7 || null,
    model: session.model || "",
    project: session.cwd || "",
    cost: formatCost(today.cost),
    tokens: formatTokens(today.tok),
    messages: today.msgs || 0,
    week: Array.isArray(data.week) ? data.week : [],
    ageSeconds: age + cached,
  };
}

async function fetchClaudeUsage() {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/claude`, {
      timeout: 10000,
    });
    applyUsage(res.data);
  } catch {
    // A failed poll must not wipe a reading that is already on screen; it only
    // becomes an error state when there has never been one.
    if (!claude.value.loaded) claude.value.error = "Claude usage unavailable";
  }
}

const claudeWindows = computed(() =>
  [
    describeWindow("5H", claude.value.fiveHour),
    describeWindow("7D", claude.value.sevenDay),
  ].filter(Boolean)
);

const week = computed(() => {
  const days = claude.value.week;
  const peak = days.reduce((max, day) => Math.max(max, day.cost || 0), 0);
  return days.map((day) => ({
    date: day.d,
    label: formatCost(day.cost),
    // A day with any spend at all keeps a visible stub, so an idle day and a
    // nearly-idle one do not look the same.
    height:
      peak > 0 ? Math.max(day.cost > 0 ? 8 : 2, (day.cost / peak) * 100) : 2,
  }));
});

const isSessionLive = computed(
  () => claude.value.loaded && claude.value.ageSeconds <= SESSION_LIVE_WITHIN_S
);

const sessionLabel = computed(() => {
  if (!claude.value.loaded) return "…";
  if (!isSessionLive.value) return "idle";
  const parts = [claude.value.model, claude.value.project].filter(Boolean);
  return parts.length ? parts.join(" · ") : "running";
});

const isStale = computed(
  () => claude.value.loaded && claude.value.ageSeconds > STALE_AFTER_S
);

const staleLabel = computed(() => {
  const minutes = Math.round(claude.value.ageSeconds / 60);
  if (minutes < 60) return `${minutes}m old`;
  return `${Math.round(minutes / 60)}h old`;
});

onMounted(async () => {
  while (polling) {
    await fetchClaudeUsage();
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
});

// HomeView remounts this block whenever the monitoring flags change, so the
// loop has to stop with the instance or every toggle leaves another running.
onUnmounted(() => {
  polling = false;
});
</script>
