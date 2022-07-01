<template>
  <v-card flat :href="twitterUrl" target="_blank" :loading="loading">
    <v-card-title>Twitter Statistics</v-card-title>
    <v-card-text>
      <v-row align="center" class="spacer" no-gutters>
        <v-col cols="3">
          <v-avatar color="primary" max-width="100%" right>
            <img :src="data.profile_image_url" :alt="data.name" />
          </v-avatar>
        </v-col>
        <v-col cols="9">
          <strong v-html="data.name"></strong>
          <v-divider></v-divider>
          <v-icon small left>mdi-account</v-icon>
          {{ data.public_metrics ? data.public_metrics.followers_count : "" }}
          followers
          <br />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import axios from "axios";

export default {
  components: {
    //
  },

  data() {
    return {
      loading: true,
      data: {},
    };
  },

  mounted() {
    this.initialize();
  },

  methods: {
    async initialize() {
      this.loading = true;
      try {
        const res = await axios.get(
          `${process.env.VUE_APP_API_URL}/twitter/statistics`
        );
        this.data = { ...res.data };
      } catch (e) {
        console.log(e);
      }
      this.loading = false;
    },
  },

  computed: {
    twitterUrl: function () {
      return `https://twitter.com/${this.data.username}`;
    },
  },
};
</script>
