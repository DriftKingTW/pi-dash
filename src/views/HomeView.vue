<template>
  <div class="grid-container">
    <ClockBlock class="clock-block" />
    <TwitterStatistics class="twitter-block" />
  </div>
</template>

<script>
// @ is an alias to /src
import TwitterStatistics from "@/components/blocks/TwitterStatistics.vue";
import ClockBlock from "@/components/blocks/ClockBlock.vue";

export default {
  name: "HomeView",
  components: { TwitterStatistics, ClockBlock },

  computed: {},
};
</script>

<style scoped>
.grid-container {
  display: grid;
  height: 290px;
  padding: 0.6rem;
  gap: 0.6rem;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-template-rows: 2;
  grid-template-areas:
    "clock twitter . ."
    "clock twitter . .";
}

.twitter-block {
  grid-area: twitter;
}

.clock-block {
  grid-area: clock;
}
</style>
