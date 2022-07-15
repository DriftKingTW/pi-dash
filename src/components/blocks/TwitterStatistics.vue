<template>
  <v-card flat :href="twitterUrl" target="_blank" :loading="loading">
    <v-card-title>
      <v-icon left>mdi-account-group-outline</v-icon>
      Social Statistics
    </v-card-title>
    <v-card-text>
      <v-list two-line>
        <v-list-item>
          <v-list-item-avatar>
            <v-img :src="data.profile_image_url" :alt="data.name"></v-img>
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title>
              {{ data.name }}
            </v-list-item-title>
            <v-list-item-subtitle>
              <!-- <twitter-icon size="1x" fill="white" class="mr-1"> </twitter-icon> -->
              <v-icon left small>mdi-twitter</v-icon>
              {{
                data.public_metrics ? data.public_metrics.followers_count : ""
              }}
              followers
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <v-divider :inset="true"></v-divider>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script>
import axios from "axios";
// import { TwitterIcon } from "vue-simple-icons";

export default {
  components: {
    // TwitterIcon,
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
