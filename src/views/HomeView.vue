<template>
  <div class="grid-container">
    <CalendarClock class="clock-block" />
    <TwitterStatistics class="twitter-block" />
    <FamilyMartTracking class="family-mart-block" />
  </div>
</template>

<script>
// @ is an alias to /src
import TwitterStatistics from "@/components/blocks/TwitterStatistics.vue";
import FamilyMartTracking from "@/components/blocks/FamilyMartTracking.vue";
import CalendarClock from "@/components/blocks/CalendarClock.vue";

export default {
  name: "HomeView",
  components: { TwitterStatistics, FamilyMartTracking, CalendarClock },

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
    "twitter family-mart-block clock"
    "twitter family-mart-block clock";
}

.twitter-block {
  grid-area: twitter;
}

.family-mart-block {
  grid-area: family-mart-block;
}

.clock-block {
  grid-area: clock;
}
</style>
