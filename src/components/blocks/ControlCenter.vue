<template>
  <v-card color="primary" flat class="d-flex flex-column control-card">
    <v-card-text
      class="flex-grow-1 py-0 d-flex align-center"
      :class="{ 'is-stale': isStale }"
    >
      <!-- The card is 482x271 on the kiosk: wide and short. Two columns use
           that far better than one stacked one, and give the mark room to be
           more than an icon. -->
      <div class="mascot d-flex flex-column align-center justify-center mr-4">
        <ClaudeRobot :size="132" :color="accent" :asleep="!isSessionLive" />
        <div class="caption text--secondary mt-2 text-truncate mascot-label">
          {{ sessionLabel }}
        </div>
      </div>

      <div class="flex-grow-1 readings">
        <template v-if="claude.loaded">
          <div v-for="window in claudeWindows" :key="window.label" class="mb-2">
            <div class="d-flex justify-space-between caption mb-1">
              <span class="font-weight-medium">{{ window.label }}</span>
              <span class="text--secondary">{{ window.resetsIn }}</span>
            </div>
            <v-progress-linear
              rounded
              height="18"
              :color="window.color"
              :value="window.percent"
            >
              <span class="caption font-weight-bold">{{ window.percent }}%</span>
            </v-progress-linear>
          </div>

          <div class="d-flex justify-space-between align-baseline mt-3">
            <span class="text-subtitle-1 font-weight-bold" :style="costStyle">
              {{ claude.cost }}
            </span>
            <span class="caption text--secondary">
              {{ claude.tokens }} · {{ claude.messages }} msg
            </span>
          </div>

          <!-- Seven days of spend, scaled to the busiest day so the shape of
               the week reads even when the totals are small. -->
          <div class="week d-flex align-end mt-1">
            <div
              v-for="(day, index) in week"
              :key="day.date"
              class="week-bar"
              :class="{ 'week-bar--today': index === week.length - 1 }"
              :style="{ height: day.height + '%' }"
              :title="`${day.date}  ${day.label}`"
            />
          </div>

          <!-- The numbers outlive the machine that produced them: the server
               keeps serving the last reading while the Mac is asleep. Say so,
               rather than letting hours-old percentages pass as current. -->
          <div v-if="isStale" class="caption warning--text mt-1">
            <v-icon x-small left color="warning">mdi-alert-outline</v-icon>
            {{ staleLabel }}
          </div>
        </template>

        <div v-else class="caption text--disabled">
          {{ claude.error || "Loading Claude usage…" }}
        </div>
      </div>
    </v-card-text>

    <!-- Kept at the bottom of the card: it is a touch target on a kiosk, and
         the bottom edge is the easiest part of the screen to reach. -->
    <v-card-actions class="flex-grow-0 justify-center card-actions py-0">
      <v-btn icon @click="getKettleTemperature" :loading="isKettleLoading">
        <v-icon>mdi-kettle</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import axios from "axios";
import ClaudeRobot from "@/components/ClaudeRobot.vue";

const POLL_INTERVAL_MS = 30000;
// Past this the percentages are shown as untrustworthy. A 5-hour window is
// long enough that a reading from earlier in the day says very little about
// what is left now.
const STALE_AFTER_S = 900;
// The status line only reports while a session is rendering it, so a recent
// reading is the closest thing to "Claude is running right now".
const SESSION_LIVE_WITHIN_S = 300;

export default {
  components: { ClaudeRobot },

  data() {
    return {
      accent: "#c4825e",
      isKettleLoading: false,
      polling: false,
      claude: {
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
      },
    };
  },

  mounted() {
    this.polling = true;
    this.pollClaudeUsage();
  },

  // HomeView remounts this block whenever the monitoring flags change, so the
  // loop has to stop with the instance or every toggle leaves another running.
  beforeDestroy() {
    this.polling = false;
  },

  methods: {
    async pollClaudeUsage() {
      while (this.polling) {
        await this.fetchClaudeUsage();
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
      }
    },

    async fetchClaudeUsage() {
      try {
        const res = await axios.get(`${process.env.VUE_APP_API_URL}/claude`, {
          timeout: 10000,
        });
        this.applyUsage(res.data);
      } catch (e) {
        // A failed poll must not wipe a reading that is already on screen;
        // it only becomes an error state when there has never been one.
        if (!this.claude.loaded) {
          this.claude.error = "Claude usage unavailable";
        }
      }
    },

    applyUsage(data) {
      const limits = data.limits || {};
      const session = data.session || {};
      const today = data.today || {};
      // The reading is as old as the numbers were when the bridge built them,
      // plus however long the server has been serving them from its cache.
      const cached = (data.bridge && data.bridge.cachedSeconds) || 0;
      const age = typeof data.age === "number" ? data.age : 0;

      this.claude = {
        loaded: true,
        error: "",
        fiveHour: limits.h5 || null,
        sevenDay: limits.d7 || null,
        model: session.model || "",
        project: session.cwd || "",
        cost: this.formatCost(today.cost),
        tokens: this.formatTokens(today.tok),
        messages: today.msgs || 0,
        week: Array.isArray(data.week) ? data.week : [],
        ageSeconds: age + cached,
      };
    },

    formatCost(dollars) {
      if (typeof dollars !== "number") return "—";
      return dollars >= 10 ? `$${dollars.toFixed(1)}` : `$${dollars.toFixed(2)}`;
    },

    formatTokens(tokens) {
      if (typeof tokens !== "number") return "—";
      if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
      if (tokens >= 1000) return `${Math.round(tokens / 1000)}K`;
      return String(tokens);
    },

    formatDuration(resetsAt) {
      if (!resetsAt) return "";
      const seconds = resetsAt - Math.floor(Date.now() / 1000);
      if (seconds <= 0) return "resets now";
      const days = Math.floor(seconds / 86400);
      const hours = Math.floor((seconds % 86400) / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      if (days > 0) return `${days}d ${hours}h`;
      if (hours > 0) return `${hours}h ${minutes}m`;
      return `${minutes}m`;
    },

    describeWindow(label, window) {
      if (!window) return null;
      const percent = Math.round(window.pct);
      return {
        label,
        percent,
        // Same thresholds the T-QT desk monitor uses, so the two agree.
        color: percent >= 80 ? "red" : percent >= 50 ? "orange" : "green",
        resetsIn: this.formatDuration(window.reset),
      };
    },

    async getKettleTemperature() {
      let result = "";
      let index = 0;
      do {
        try {
          this.isKettleLoading = true;
          const res = await axios.get(
            `${process.env.VUE_APP_API_URL}/mikettle/temperature`,
            // Reading over BLE is slower than the global default allows
            { timeout: 30000 }
          );
          result = res.data;
        } catch (e) {
          console.log(e);
        } finally {
          this.isKettleLoading = false;
          index++;
        }
      } while (result.includes("Read failed") && index < 10);

      this.$store.commit("triggerSnackbar", {
        status: "success",
        text: `Kettle temperature: ${result}°C`,
      });
    },
  },

  computed: {
    claudeWindows() {
      return [
        this.describeWindow("5H", this.claude.fiveHour),
        this.describeWindow("7D", this.claude.sevenDay),
      ].filter(Boolean);
    },

    week() {
      const days = this.claude.week;
      const peak = days.reduce((max, day) => Math.max(max, day.cost || 0), 0);
      return days.map((day) => ({
        date: day.d,
        label: this.formatCost(day.cost),
        // A day with any spend at all keeps a visible stub, so an idle day and
        // a nearly-idle one do not look the same.
        height: peak > 0 ? Math.max(day.cost > 0 ? 8 : 2, (day.cost / peak) * 100) : 2,
      }));
    },

    isSessionLive() {
      return this.claude.loaded && this.claude.ageSeconds <= SESSION_LIVE_WITHIN_S;
    },

    sessionLabel() {
      if (!this.claude.loaded) return "…";
      if (!this.isSessionLive) return "idle";
      const parts = [this.claude.model, this.claude.project].filter(Boolean);
      return parts.length ? parts.join(" · ") : "running";
    },

    isStale() {
      return this.claude.loaded && this.claude.ageSeconds > STALE_AFTER_S;
    },

    costStyle() {
      return { color: this.isStale ? undefined : this.accent };
    },

    staleLabel() {
      const minutes = Math.round(this.claude.ageSeconds / 60);
      if (minutes < 60) return `${minutes}m old`;
      return `${Math.round(minutes / 60)}h old`;
    },
  },
};
</script>

<style scoped>
.control-card {
  overflow: hidden;
}

/* The card has a fixed slice of grid row to live in, so the chrome around the
   readings is kept deliberately thin - every pixel here is one the bars and
   the week chart do not get. */
.card-actions {
  min-height: 40px;
}

.mascot {
  width: 150px;
  flex: 0 0 150px;
}

/* The project name can be long; keep it from widening the column */
.mascot-label {
  max-width: 150px;
}

.readings {
  min-width: 0;
}


/* Everything fades back together rather than each piece needing its own
   greyed-out variant */
.is-stale {
  opacity: 0.45;
  transition: opacity 0.4s ease;
}

/* Tall enough for the shape of the week to be legible. At 20px a quiet day
   and a busy one were the same two-pixel stub. */
.week {
  height: 44px;
  gap: 3px;
}

.week-bar {
  flex: 1;
  min-height: 2px;
  border-radius: 1px;
  background: rgba(255, 255, 255, 0.22);
  transition: height 0.6s ease;
}

.week-bar--today {
  background: #c4825e;
}
</style>
