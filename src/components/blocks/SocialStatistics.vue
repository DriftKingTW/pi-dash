<template>
  <v-card color="primary" flat :loading="loading && accent">
    <v-card-text>
      <v-row>
        <v-col cols="12" class="pa-0 pr-4">
          <v-list dense color="primary">
            <template v-for="row in rows">
              <v-list-item :key="row.key" class="sns-row" :class="row.classes">
                <v-list-item-icon class="mr-4 my-2">
                  <v-avatar
                    size="40"
                    :color="row.logo === 'pixiv' ? 'white' : ''"
                  >
                    <pixiv-icon
                      v-if="row.logo === 'pixiv'"
                      size="3x"
                      fill="#0096fa"
                    ></pixiv-icon>
                    <v-img
                      v-else
                      :src="require(`@/assets/images/pixivfanbox.png`)"
                      :alt="'Fanbox Logo'"
                    ></v-img>
                  </v-avatar>
                </v-list-item-icon>

                <v-list-item-content>
                  <v-list-item-title>{{ row.title }}</v-list-item-title>
                  <v-list-item-subtitle>
                    <template v-if="row.hasValue">
                      <span class="stat-value">{{ row.valueText }}</span>
                      <span class="stat-diff"
                        >(<span v-if="row.totalText" class="mr-1">{{
                          row.totalText
                        }}</span
                        ><span
                          :class="
                            row.diff >= 0 ? 'success--text' : 'error--text'
                          "
                          >{{ row.diffText }}</span
                        >)</span
                      >
                    </template>
                    <span
                      v-else
                      :class="
                        row.status === 'error' ? 'error--text' : 'grey--text'
                      "
                      >{{ row.placeholder }}</span
                    >
                  </v-list-item-subtitle>
                </v-list-item-content>

                <v-list-item-action class="my-0 align-self-center">
                  <v-fade-transition mode="out-in">
                    <v-progress-circular
                      v-if="row.status === 'loading'"
                      key="loading"
                      indeterminate
                      :size="16"
                      :width="2"
                      :color="accent"
                    ></v-progress-circular>
                    <v-icon
                      v-else-if="row.status === 'error'"
                      key="error"
                      color="error"
                      >mdi-alert-circle</v-icon
                    >
                    <v-icon
                      v-else-if="row.updated"
                      key="updated"
                      color="success"
                      >mdi-check-circle</v-icon
                    >
                    <span v-else key="idle"></span>
                  </v-fade-transition>
                </v-list-item-action>
              </v-list-item>
              <v-divider :key="`${row.key}-divider`" :inset="true"></v-divider>
            </template>
          </v-list>
        </v-col>
      </v-row>
    </v-card-text>

    <v-card-actions class="px-4">
      <span class="caption text-truncate" :class="footer.textClass">
        <v-icon x-small :color="footer.iconColor">{{ footer.icon }}</v-icon>
        {{ footer.text }}
      </span>
      <v-spacer></v-spacer>
      <v-btn text @dblclick="resetDiff" @click="showDblClickHint">
        <v-icon left>mdi-television-shimmer</v-icon> Reset
      </v-btn>
      <v-btn text :disabled="loading" @click="refresh">
        <v-icon left :class="{ spinning: loading }">mdi-refresh</v-icon> Reload
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import axios from "axios";
import { PixivIcon } from "vue-simple-icons";

// The pixiv statistics route scrapes with a headless browser and takes ~14s on
// the Pi, well past the global axios default. Safe to wait: this runs hourly.
const PIXIV_TIMEOUT = 60000;

const REFRESH_INTERVAL = 60 * 60 * 1000; // 60 minutes
// A scrape that fails shouldn't leave the block stale for a whole hour
const RETRY_INTERVAL = 5 * 60 * 1000; // 5 minutes

// pixiv blue, shared by every "this is being fetched" cue
const ACCENT = "#0096fa";

const COUNT_DURATION = 900; // time spent counting a number up to its new reading
const FLASH_DURATION = 1600; // how long the "just updated" check stays on a row

// One row each, fetched in order. Every row carries its own status, so a scrape
// that dies takes down its row only and says so.
const SOURCES = [
  {
    key: "pixivMain",
    logo: "pixiv",
    label: "pixiv / driftkingtw",
    path: "/pixiv/statistics?user=driftkingtw",
    timeout: PIXIV_TIMEOUT,
    unit: "Followers",
    valueField: "followerCount",
    diffField: "followerCount",
    baselineKey: "pixivMainFollowersCount",
  },
  {
    key: "pixivSub",
    logo: "pixiv",
    label: "pixiv / dkaze",
    path: "/pixiv/statistics?user=dkaze",
    timeout: PIXIV_TIMEOUT,
    unit: "Followers",
    valueField: "followerCount",
    diffField: "followerCount",
    baselineKey: "pixivSubFollowersCount",
  },
  {
    key: "fanbox",
    logo: "fanbox",
    label: "Fanbox / dkaze",
    path: "/pixiv/statistics/fanbox?user=dkaze",
    unit: "Fans",
    valueField: "fans",
    diffField: "pledge",
    baselineKey: "fanboxPledgeNumber",
    currency: "¥",
  },
];

// Per-source state is seeded up front so every field is reactive without $set
const bySource = (value) =>
  SOURCES.reduce((acc, source) => {
    acc[source.key] = value(source);
    return acc;
  }, {});

// The numbers a row animates: its headline count, plus the pledge on Fanbox
const countedFields = (source) => [
  ...new Set([source.valueField, source.diffField]),
];

export default {
  components: {
    PixivIcon,
  },

  data() {
    return {
      accent: ACCENT,
      timer: null,
      loading: true,
      lastUpdate: null,
      nextAttempt: null,
      stats: bySource(() => ({})),
      status: bySource(() => "loading"),
      updated: bySource(() => false),
      baselines: bySource((source) =>
        Number(localStorage.getItem(source.baselineKey))
      ),
      display: bySource((source) =>
        countedFields(source).reduce((acc, field) => {
          acc[field] = null;
          return acc;
        }, {})
      ),
      frames: {},
      flashTimers: {},
    };
  },

  mounted() {
    this.refresh();
  },

  methods: {
    async refresh() {
      const succeeded = await this.initialize();
      const wait = succeeded ? REFRESH_INTERVAL : RETRY_INTERVAL;

      clearTimeout(this.timer);
      this.nextAttempt = new Date(Date.now() + wait);
      this.timer = setTimeout(this.refresh, wait);
    },

    async initialize() {
      this.loading = true;

      SOURCES.forEach((source) => {
        this.status[source.key] = "loading";
        this.updated[source.key] = false;
      });

      let succeeded = true;

      for (const source of SOURCES) {
        if (!(await this.load(source))) succeeded = false;
      }

      this.loading = false;

      // Only a clean pass moves the timestamp, so it tells you how fresh the
      // numbers on screen actually are
      if (succeeded) this.lastUpdate = new Date();

      return succeeded;
    },

    async load(source) {
      try {
        const res = await axios.get(
          `${process.env.VUE_APP_API_URL}${source.path}`,
          source.timeout ? { timeout: source.timeout } : {}
        );

        // The server answers a failed scrape with an empty object, and holding
        // on to the last good numbers beats blanking the block back to
        // 'Loading...' until the next round
        if (!res.data.name) throw new Error(`empty ${source.key} response`);

        this.stats[source.key] = { ...res.data };

        if (
          localStorage.getItem(source.baselineKey) === null &&
          !isNaN(res.data[source.diffField])
        ) {
          localStorage.setItem(source.baselineKey, res.data[source.diffField]);
        }

        this.baselines[source.key] = Number(
          localStorage.getItem(source.baselineKey)
        );

        countedFields(source).forEach((field) =>
          this.countTo(source.key, field, res.data[field])
        );

        this.status[source.key] = "ok";
        this.flash(source.key);

        return true;
      } catch (e) {
        console.log(e);
        this.status[source.key] = "error";

        return false;
      }
    },

    // Counting up to the new reading instead of swapping it in is the only way
    // an hourly update registers on a screen you walk past
    countTo(key, field, value) {
      const id = `${key}.${field}`;
      // The scraper hands some counts back as strings, and a row only shows a
      // number once it has one to show
      const to = Number(value);

      cancelAnimationFrame(this.frames[id]);

      if (!Number.isFinite(to)) {
        this.display[key][field] = null;
        return;
      }

      // A first reading counts up from zero, later ones from what's on screen
      const from = Number.isFinite(this.display[key][field])
        ? this.display[key][field]
        : 0;

      if (from === to) {
        this.display[key][field] = to;
        return;
      }

      const start = performance.now();
      const step = (now) => {
        const progress = Math.min((now - start) / COUNT_DURATION, 1);
        const eased = 1 - Math.pow(1 - progress, 3);

        this.display[key][field] = Math.round(from + (to - from) * eased);

        if (progress < 1) this.frames[id] = requestAnimationFrame(step);
      };

      this.frames[id] = requestAnimationFrame(step);
    },

    flash(key) {
      clearTimeout(this.flashTimers[key]);
      this.updated[key] = true;

      this.flashTimers[key] = setTimeout(() => {
        this.updated[key] = false;
      }, FLASH_DURATION);
    },

    resetDiff() {
      SOURCES.forEach((source) => {
        const value = this.stats[source.key][source.diffField];

        if (!isNaN(value)) localStorage.setItem(source.baselineKey, value);
      });

      this.$store.commit("triggerSnackbar", {
        status: "success",
        text: "Status has been reset.",
      });

      this.refresh();
    },

    numberWithCommas(x) {
      if (x === undefined || x === null || isNaN(x)) return "—";
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    showDblClickHint() {
      this.$store.commit("triggerSnackbar", {
        status: "info",
        text: "Double click to reset status.",
      });
    },
  },

  computed: {
    rows() {
      return SOURCES.map((source) => {
        const status = this.status[source.key];
        const shown = this.display[source.key];
        const value = shown[source.valueField];
        const total = shown[source.diffField];
        const currency = source.currency || "";
        const hasValue = Number.isFinite(value);
        const diff = Number.isFinite(total)
          ? total - this.baselines[source.key]
          : null;

        return {
          key: source.key,
          logo: source.logo,
          status,
          updated: this.updated[source.key],
          // A row that failed before it ever loaded has no name to show, and
          // the old 'Loading...' there read as though it were still working
          title:
            this.stats[source.key].name ||
            (status === "loading" ? "Loading..." : source.label),
          hasValue,
          valueText: hasValue
            ? `${this.numberWithCommas(value)} ${source.unit}`
            : "",
          // Fanbox counts fans but tracks the pledge, so it shows both
          totalText:
            source.diffField !== source.valueField && Number.isFinite(total)
              ? `${this.numberWithCommas(total)}${currency}`
              : "",
          diff,
          // The sign keeps the space it has always had after it: '(+ 137)'
          diffText:
            diff === null
              ? ""
              : `${diff >= 0 ? "+" : "-"} ${this.numberWithCommas(
                  Math.abs(diff)
                )}${currency}`,
          placeholder:
            status === "error"
              ? "Update failed"
              : status === "loading"
              ? "Fetching…"
              : "No data",
          classes: {
            "is-loading": status === "loading",
            "is-error": status === "error",
            "is-updated": this.updated[source.key],
          },
        };
      });
    },

    failed() {
      return SOURCES.some((source) => this.status[source.key] === "error");
    },

    footer() {
      if (this.loading) {
        return {
          icon: "mdi-sync",
          iconColor: ACCENT,
          textClass: "accent-text pulsing",
          text: "Updating…",
        };
      }

      // A stale timestamp alone never explained itself, so a failed round says
      // so and names the time it tries again
      if (this.failed) {
        return {
          icon: "mdi-alert-circle",
          iconColor: "error",
          textClass: "error--text",
          text: `Update failed · retry ${this.retryAt}`,
        };
      }

      return {
        icon: "mdi-clock-outline",
        iconColor: "grey",
        textClass: "grey--text",
        text: this.lastUpdate ? this.lastUpdate.toLocaleString() : "",
      };
    },

    retryAt() {
      if (!this.nextAttempt) return "";

      return this.nextAttempt.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  },

  beforeDestroy() {
    clearTimeout(this.timer);
    Object.values(this.flashTimers).forEach(clearTimeout);
    Object.values(this.frames).forEach(cancelAnimationFrame);
  },
};
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
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
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
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(100%);
  }
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
  from {
    background-color: rgba(0, 150, 250, 0.22);
  }
  to {
    background-color: transparent;
  }
}

.sns-row.is-error {
  box-shadow: inset 3px 0 0 var(--v-error-base, #ff5252);
}

.stat-value,
.stat-diff {
  transition: opacity 0.4s ease;
}

.accent-text {
  color: #0096fa;
}

.pulsing {
  animation: pulse 1.4s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.35;
  }
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
