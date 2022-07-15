<template>
  <div class="grid-container">
    <div class="statistics-block d-flex flex-column">
      <v-tabs v-model="tab" color="white" class="flex-grow-0">
        <v-tabs-slider></v-tabs-slider>
        <v-tab v-for="item in tabItems" :key="item">
          {{ item }}
        </v-tab>
      </v-tabs>
      <v-tabs-items v-model="tab" class="flex-grow-1">
        <v-tab-item>
          <SocialStatistics />
        </v-tab-item>
        <v-tab-item>
          <FamilyMartTracking />
        </v-tab-item>
      </v-tabs-items>
    </div>

    <CalendarClock class="clock-block" />
  </div>
</template>

<script>
// @ is an alias to /src
import SocialStatistics from "@/components/blocks/SocialStatistics.vue";
import FamilyMartTracking from "@/components/blocks/FamilyMartTracking.vue";
import CalendarClock from "@/components/blocks/CalendarClock.vue";

export default {
  name: "HomeView",
  components: { SocialStatistics, FamilyMartTracking, CalendarClock },

  data() {
    return {
      tab: null,
      tabItems: ["Social", "Shipping"],
    };
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
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 2;
  grid-template-areas:
    "statistics . clock"
    "statistics . clock";
}

.statistics-block {
  grid-area: statistics;
}

.clock-block {
  grid-area: clock;
}
</style>
