<template>
  <div class="grid-container">
    <CalendarClock class="clock-block" />
    <div class="statistics-block d-flex flex-column">
      <v-tabs
        v-model="tab"
        color="white"
        class="flex-grow-0"
        background-color="primary"
        fixed-tabs
      >
        <v-tabs-slider></v-tabs-slider>
        <v-tab v-for="(item, index) in tabItems" :key="item">
          <v-icon small left>{{ tabIcons[index] }}</v-icon>
          {{ item }}
        </v-tab>
      </v-tabs>
      <v-tabs-items v-model="tab" class="flex-grow-1 primary">
        <v-tab-item>
          <SocialStatistics />
        </v-tab-item>
        <v-tab-item>
          <CountdownTimer />
        </v-tab-item>
      </v-tabs-items>
    </div>
    <ControlCenter
      v-if="!showPCMonitoring && !showOctoMonitoring"
      class="control-block"
      :key="'control-center-' + updateKey"
    />
    <PCMonitor
      class="control-block"
      v-if="showPCMonitoring"
      :key="'pc-monitor-' + updateKey"
    />
    <OctoMonitor
      class="control-block"
      v-if="showOctoMonitoring"
      :key="'octo-monitor-' + updateKey"
    />
  </div>
</template>

<script>
// @ is an alias to /src
import SocialStatistics from "@/components/blocks/SocialStatistics.vue";
import CalendarClock from "@/components/blocks/CalendarClock.vue";
import ControlCenter from "@/components/blocks/ControlCenter.vue";
import CountdownTimer from "@/components/blocks/CountdownTimer.vue";
import PCMonitor from "@/components/blocks/PCMonitor.vue";
import OctoMonitor from "@/components/blocks/OctoMonitor.vue";
import { mapState } from "vuex";

export default {
  name: "HomeView",
  components: {
    SocialStatistics,
    CalendarClock,
    ControlCenter,
    CountdownTimer,
    PCMonitor,
    OctoMonitor,
  },

  data() {
    return {
      tab: null,
      tabItems: ["SNS Stats", "Timer"],
      tabIcons: ["mdi-chart-line", "mdi-timer"],
    };
  },

  mounted() {
    this.initialize();
  },

  methods: {
    initialize() {
      // Load tab state from localStorage
      if (localStorage.getItem("tab")) {
        this.tab = Number(localStorage.getItem("tab"));
      }
    },
  },

  watch: {
    tab: function (val) {
      localStorage.setItem("tab", val);
    },
  },

  computed: {
    ...mapState(["showPCMonitoring", "showOctoMonitoring", "updateKey"]),
  },
};
</script>

<style scoped>
.grid-container {
  display: grid;
  height: 290px;
  padding: 0.6rem;
  gap: 0.6rem;
  grid-template-columns: 33% 33% auto;
  grid-template-areas: "clock control statistics";
}

.statistics-block {
  grid-area: statistics;
}

.control-block {
  grid-area: control;
}

.clock-block {
  grid-area: clock;
}
</style>
