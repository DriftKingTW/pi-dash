<template>
  <v-card color="primary" flat :loading="loading">
    <v-card-title class="pb-0">
      <v-icon left>mdi-account-group-outline</v-icon>
      Social Statistics
    </v-card-title>
    <v-card-text>
      <v-list two-line color="primary">
        <v-list-item>
          <v-list-item-avatar>
            <v-img
              :src="twitterData.profile_image_url"
              :alt="twitterData.name"
            ></v-img>
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title>
              {{ twitterData.name }}
            </v-list-item-title>
            <v-list-item-subtitle>
              <!-- <twitter-icon size="1x" fill="white" class="mr-1"> </twitter-icon> -->
              <v-icon left small>mdi-twitter</v-icon>
              {{
                twitterData.public_metrics
                  ? twitterData.public_metrics.followers_count
                  : ""
              }}
              followers
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <v-divider :inset="true"></v-divider>
        <v-list-item>
          <v-list-item-avatar>
            <v-img
              :src="facebookData.picture ? facebookData.picture.data.url : ''"
              :alt="facebookData.name"
            ></v-img>
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title>
              {{ facebookData.name }}
            </v-list-item-title>
            <v-list-item-subtitle>
              <!-- <twitter-icon size="1x" fill="white" class="mr-1"> </twitter-icon> -->
              <v-icon left small>mdi-facebook</v-icon>
              {{ facebookData.fan_count }}
              fans
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
      twitterData: {},
      facebookData: {},
    };
  },

  mounted() {
    setInterval(() => {
      this.initialize();
    }, 30 * 60 * 1000 /* 30 minutes */);
  },

  methods: {
    async initialize() {
      this.loading = true;
      try {
        const resTwitter = await axios.get(
          `${process.env.VUE_APP_API_URL}/twitter/statistics`
        );
        this.twitterData = { ...resTwitter.data };
        const resFacebook = await axios.get(
          `${process.env.VUE_APP_API_URL}/facebook/statistics`
        );
        this.facebookData = { ...resFacebook.data };
      } catch (e) {
        console.log(e);
      }
      this.loading = false;
    },
  },

  computed: {
    //
  },
};
</script>
