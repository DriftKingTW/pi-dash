<template>
  <v-card color="primary" flat class="d-flex flex-column">
    <v-card-title class="flex-grow-0">
      <v-icon left>mdi-tune-vertical</v-icon>
      Control Center
    </v-card-title>

    <v-card-text class="flex-grow-1 py-0">
      <!-- Claude Code usage. The block is here rather than in its own slot so
           it is visible without switching to it. -->
      <div v-if="claude.loaded">
        <div
          v-for="window in claudeWindows"
          :key="window.label"
          class="mb-2"
        >
          <div class="d-flex justify-space-between caption mb-1">
            <span :class="staleClass">{{ window.label }}</span>
            <span :class="staleClass">{{ window.resetsIn }}</span>
          </div>
          <v-progress-linear
            height="20"
            :color="window.color"
            :value="window.percent"
          >
            <strong class="caption">{{ window.percent }}%</strong>
          </v-progress-linear>
        </div>

        <div class="d-flex justify-space-between caption" :class="staleClass">
          <span>{{ claude.cost }}</span>
          <span>{{ claude.tokens }}</span>
        </div>

        <!-- The numbers outlive the machine that produced them: the bridge
             keeps serving the last reading while the Mac is asleep. Say so,
             rather than letting hours-old percentages pass as current. -->
        <div v-if="isStale" class="caption warning--text mt-1">
          <v-icon x-small left color="warning">mdi-alert-outline</v-icon>
          {{ staleLabel }}
        </div>
      </div>

      <div v-else class="caption text--disabled">
        {{ claude.error || "Loading Claude usage…" }}
      </div>
    </v-card-text>

    <!-- Kept at the bottom of the card: it is a touch target on a kiosk, and
         the bottom edge is the easiest part of the screen to reach. -->
    <v-card-actions class="flex-grow-0 justify-center pb-2">
      <div class="d-flex flex-column align-center">
        <v-btn
          icon
          x-large
          @click="getKettleTemperature"
          :loading="isKettleLoading"
        >
          <v-icon>mdi-kettle</v-icon>
        </v-btn>
        <div class="text-center caption">KetTemp</div>
      </div>
    </v-card-actions>
  </v-card>
</template>

<script>
import axios from "axios";

const POLL_INTERVAL_MS = 30000;
// Past this the percentages are shown as untrustworthy. A 5-hour window is
// long enough that a reading from earlier in the day says very little about
// what is left now.
const STALE_AFTER_S = 900;

export default {
  components: {},

  data() {
    return {
      isKettleLoading: false,
      polling: false,
      claude: {
        loaded: false,
        error: "",
        fiveHour: null,
        sevenDay: null,
        cost: "",
        tokens: "",
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
        const res = await axios.get(
          `${process.env.VUE_APP_API_URL}/claude`,
          { timeout: 10000 }
        );
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
      // The reading is as old as the numbers were when the bridge built them,
      // plus however long the server has been serving them from its cache.
      const cached = (data.bridge && data.bridge.cachedSeconds) || 0;
      this.claude = {
        loaded: true,
        error: "",
        fiveHour: limits.h5 || null,
        sevenDay: limits.d7 || null,
        cost: this.formatCost(data.today && data.today.cost),
        tokens: this.formatTokens(data.today && data.today.tok),
        ageSeconds: (data.age === null || data.age === undefined ? 0 : data.age) + cached,
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
      if (seconds <= 0) return "now";
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
        // Same thresholds the T-QT monitor uses, so the two agree at a glance.
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

    isStale() {
      return this.claude.loaded && this.claude.ageSeconds > STALE_AFTER_S;
    },

    staleClass() {
      return this.isStale ? "text--disabled" : "";
    },

    staleLabel() {
      const minutes = Math.round(this.claude.ageSeconds / 60);
      if (minutes < 60) return `${minutes}m old`;
      const hours = Math.round(minutes / 60);
      return `${hours}h old`;
    },
  },
};
</script>
