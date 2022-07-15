<template>
  <div class="grid-container">
    <CalendarClock class="clock-block" />
    <SocialStatistics class="social-block" />
    <FamilyMartTracking class="family-mart-block" />
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
    "social family-mart-block clock"
    "social family-mart-block clock";
}

.social-block {
  grid-area: social;
}

.family-mart-block {
  grid-area: family-mart-block;
}

.clock-block {
  grid-area: clock;
}
</style>
