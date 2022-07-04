<template>
  <div class="grid-container">
    <CalendarClock class="clock-block" />
    <TwitterStatistics class="twitter-block" />
  </div>
</template>

<script>
// @ is an alias to /src
import TwitterStatistics from "@/components/blocks/TwitterStatistics.vue";
import CalendarClock from "@/components/blocks/CalendarClock.vue";

export default {
  name: "HomeView",
  components: { TwitterStatistics, CalendarClock },

  computed: {},
};
</script>

<style scoped>
.grid-container {
  display: grid;
  height: 290px;
  padding: 0.6rem;
  gap: 0.6rem;
  grid-template-columns: 0.8fr 1.2fr 1fr;
  grid-template-rows: 2;
  grid-template-areas:
    "twitter . clock"
    ". . clock";
}

.twitter-block {
  grid-area: twitter;
}

.clock-block {
  grid-area: clock;
}
</style>
