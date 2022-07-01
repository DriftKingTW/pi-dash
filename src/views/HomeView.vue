<template>
  <div class="grid-container">
    <TwitterStatistics class="twitter-block" />
    <TwitterStatistics class="test-block" />
  </div>
</template>

<script>
// @ is an alias to /src
import TwitterStatistics from "@/components/blocks/TwitterStatistics.vue";

export default {
  name: "HomeView",
  components: { TwitterStatistics },

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
    ". twitter . ."
    ". test . .";
}

.twitter-block {
  grid-area: twitter;
}

.test-block {
  grid-area: test;
}
</style>
