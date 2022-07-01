<template>
  <v-row>
    <v-col cols="3" class="pa-0">
      <TwitterStatistics :style="cardHeight1U" class="mx-2 mt-2" />
    </v-col>
    <v-col cols="3"> </v-col>
    <v-col cols="3"> </v-col>
    <v-col cols="3"> </v-col>
    <v-col cols="3" class="pa-0">
      <TwitterStatistics :style="cardHeight1U" class="mx-2 mt-2" />
    </v-col>
    <v-col cols="3"> </v-col>
    <v-col cols="3"> </v-col>
    <v-col cols="3"> </v-col>
  </v-row>
</template>

<script>
// @ is an alias to /src
import TwitterStatistics from "@/components/blocks/TwitterStatistics.vue";

export default {
  name: "HomeView",
  components: { TwitterStatistics },

  computed: {
    cardHeight1U: () => "height: 133px",
  },
};
</script>
