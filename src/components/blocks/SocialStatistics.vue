<template>
  <v-card color="primary" flat :loading="loading">
    <v-card-title class="pb-0">
      <v-icon left>mdi-account-group-outline</v-icon>
      Social Statistics
    </v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="6" class="px-0 pr-4">
          <v-list dense color="primary">
            <v-list-item>
              <v-list-item-icon class="mr-4 my-2">
                <v-badge
                  avatar
                  bordered
                  overlap
                  bottom
                  color="#1DA1F2"
                  icon="mdi-twitter"
                >
                  <v-avatar size="40">
                    <v-img
                      :src="twitterData.profile_image_url"
                      :alt="twitterData.name"
                    ></v-img>
                  </v-avatar>
                </v-badge>
              </v-list-item-icon>

              <v-list-item-content>
                <v-list-item-title>
                  {{ twitterData.name }}
                </v-list-item-title>
                <v-list-item-subtitle>
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
              <v-list-item-icon class="mr-4 my-2">
                <v-badge
                  avatar
                  bordered
                  overlap
                  bottom
                  color="#3B5998"
                  icon="mdi-facebook"
                >
                  <v-avatar size="40">
                    <v-img
                      :src="
                        facebookData.picture
                          ? facebookData.picture.data.url
                          : ''
                      "
                      :alt="facebookData.name"
                    ></v-img>
                  </v-avatar>
                </v-badge>
              </v-list-item-icon>

              <v-list-item-content>
                <v-list-item-title>
                  {{ facebookData.name }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ facebookData.fan_count }}
                  fans
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-divider :inset="true"></v-divider>
          </v-list>
        </v-col>

        <v-col cols="6" class="px-0 pr-4">
          <v-list dense color="primary">
            <v-list-item>
              <v-list-item-icon class="mr-4 my-2">
                <v-avatar size="40">
                  <pixiv-icon size="3x" fill="white"></pixiv-icon>
                </v-avatar>
              </v-list-item-icon>

              <v-list-item-content>
                <v-list-item-title>
                  {{ pixivDataMain.name }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ pixivDataMain.followerCount }}
                  followers
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-divider :inset="true"></v-divider>
            <v-list-item>
              <v-list-item-icon class="mr-4 my-2">
                <v-avatar size="40">
                  <pixiv-icon size="3x" fill="white"></pixiv-icon>
                </v-avatar>
              </v-list-item-icon>

              <v-list-item-content>
                <v-list-item-title>
                  {{ pixivDataSub.name }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ pixivDataSub.followerCount }}
                  followers
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-divider :inset="true"></v-divider>
          </v-list>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import axios from "axios";
import { PixivIcon } from "vue-simple-icons";

export default {
  components: {
    PixivIcon,
  },

  data() {
    return {
      loading: true,
      twitterData: {},
      facebookData: {},
      pixivDataMain: {},
      pixivDataSub: {},
    };
  },

  mounted() {
    this.initialize();
    setInterval(() => {
      this.initialize();
    }, 10 * 60 * 1000 /* 10 minutes */);
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

        const resPixivMain = await axios.get(
          `${process.env.VUE_APP_API_URL}/pixiv/statistics?user=driftkingtw`
        );
        this.pixivDataMain = { ...resPixivMain.data };

        const resPixivSub = await axios.get(
          `${process.env.VUE_APP_API_URL}/pixiv/statistics?user=dkaze`
        );
        this.pixivDataSub = { ...resPixivSub.data };
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
