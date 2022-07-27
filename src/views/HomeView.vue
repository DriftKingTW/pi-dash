<template>
  <div class="grid-container">
    <div class="statistics-block d-flex flex-column">
      <v-tabs v-model="tab" color="white" class="flex-grow-0" background-color="primary">
        <v-tabs-slider></v-tabs-slider>
        <v-tab v-for="item in tabItems" :key="item">
          {{ item }}
        </v-tab>
      </v-tabs>
      <v-tabs-items v-model="tab" class="flex-grow-1 primary">
        <v-tab-item>
          <SocialStatistics />
        </v-tab-item>
        <v-tab-item>
          <FamilyMartTracking />
        </v-tab-item>
      </v-tabs-items>
    </div>
    <ControlCenter class="control-block" />
    <CalendarClock class="clock-block" />
  </div>
</template>

<script>
// @ is an alias to /src
import SocialStatistics from "@/components/blocks/SocialStatistics.vue";
import FamilyMartTracking from "@/components/blocks/FamilyMartTracking.vue";
import CalendarClock from "@/components/blocks/CalendarClock.vue";
import ControlCenter from "@/components/blocks/ControlCenter.vue";

export default {
  name: "HomeView",
  components: {
    SocialStatistics,
    FamilyMartTracking,
    CalendarClock,
    ControlCenter,
  },

  data() {
    return {
      tab: null,
      tabItems: ["Social", "Shipping"],
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

  computed: {},
};
</script>

<style scoped>
.grid-container {
  display: grid;
  height: 290px;
  padding: 0.6rem;
  gap: 0.6rem;
  grid-template-columns: 33% 33% auto;
  grid-template-areas: "statistics control clock";
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
