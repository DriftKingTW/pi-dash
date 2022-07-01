<template>
  <div class="home pa-4">
    <v-row>
      <v-col cols="3">
        <TwitterStatistics />
      </v-col>
      <v-col cols="3"> </v-col>
      <v-col cols="3"> </v-col>
      <v-col cols="3"> </v-col>
    </v-row>
  </div>
</template>

<script>
// @ is an alias to /src
import TwitterStatistics from "@/components/blocks/TwitterStatistics.vue";

export default {
  name: "HomeView",
  components: { TwitterStatistics },
};
</script>
