<template>
  <v-card color="primary" flat :loading="loading">
    <v-card-title class="pb-0">
      <v-icon left @click="initialize">mdi-account-group-outline</v-icon>
      Social Statistics
      <v-icon right @click="resetDiff">mdi-television-shimmer</v-icon>
    </v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="6" class="pa-0 pr-4 pt-4">
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
                  {{ twitterData.name ? twitterData.name : "Loading..." }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{
                    twitterData.public_metrics
                      ? numberWithCommas(
                          twitterData.public_metrics.followers_count
                        )
                      : 0
                  }}
                  <span
                    :class="
                      twitterData.diff >= 0 ? 'success--text' : 'error--text'
                    "
                  >
                    ({{ twitterData.diff >= 0 ? "+" : "" }}
                    {{ numberWithCommas(twitterData.diff) }})
                  </span>
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
                  {{ facebookData.name ? facebookData.name : "Loading..." }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{
                    facebookData.fan_count
                      ? numberWithCommas(facebookData.fan_count)
                      : 0
                  }}
                  <span
                    :class="
                      facebookData.diff >= 0 ? 'success--text' : 'error--text'
                    "
                  >
                    ({{ facebookData.diff >= 0 ? "+" : "" }}
                    {{ numberWithCommas(facebookData.diff) }})
                  </span>
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-divider :inset="true"></v-divider>
          </v-list>
        </v-col>

        <v-col cols="6" class="pa-0 pr-4 pt-4">
          <v-list dense color="primary">
            <v-list-item>
              <v-list-item-icon class="mr-4 my-2">
                <v-avatar size="40" color="white">
                  <pixiv-icon size="3x" fill="#0096fa"></pixiv-icon>
                </v-avatar>
              </v-list-item-icon>

              <v-list-item-content>
                <v-list-item-title>
                  {{ pixivDataMain.name ? pixivDataMain.name : "Loading..." }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{
                    pixivDataMain.followerCount
                      ? numberWithCommas(pixivDataMain.followerCount)
                      : 0
                  }}
                  <span
                    :class="
                      pixivDataMain.diff >= 0 ? 'success--text' : 'error--text'
                    "
                  >
                    ({{ pixivDataMain.diff >= 0 ? "+" : "" }}
                    {{ numberWithCommas(pixivDataMain.diff) }})
                  </span>
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-divider :inset="true"></v-divider>
            <v-list-item>
              <v-list-item-icon class="mr-4 my-2">
                <v-avatar size="40" color="white">
                  <pixiv-icon size="3x" fill="#0096fa"></pixiv-icon>
                </v-avatar>
              </v-list-item-icon>

              <v-list-item-content>
                <v-list-item-title>
                  {{ pixivDataSub.name ? pixivDataSub.name : "Loading..." }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{
                    pixivDataSub.followerCount
                      ? numberWithCommas(pixivDataSub.followerCount)
                      : 0
                  }}
                  <span
                    :class="
                      pixivDataSub.diff >= 0 ? 'success--text' : 'error--text'
                    "
                  >
                    ({{ pixivDataSub.diff >= 0 ? "+" : "" }}
                    {{ numberWithCommas(pixivDataSub.diff) }})
                  </span>
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-divider :inset="true"></v-divider>
            <v-list-item>
              <v-list-item-icon class="mr-4 my-2">
                <v-avatar size="40">
                  <v-img
                    :src="require(`@/assets/images/pixivfanbox.png`)"
                    :alt="'Fanbox Logo'"
                  ></v-img>
                </v-avatar>
              </v-list-item-icon>

              <v-list-item-content>
                <v-list-item-title>
                  {{ fanboxData.name ? fanboxData.name : "Loading..." }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ fanboxData.fans ? numberWithCommas(fanboxData.fans) : 0 }}
                  ({{
                    fanboxData.pledge ? numberWithCommas(fanboxData.pledge) : 0
                  }}¥
                  <span
                    :class="
                      fanboxData.diff >= 0 ? 'success--text' : 'error--text'
                    "
                  >
                    {{ fanboxData.diff >= 0 ? "+" : "" }}
                    {{ numberWithCommas(fanboxData.diff) }}¥
                  </span>
                  )
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
      timer: null,
      loading: true,
      twitterData: { diff: 0 },
      facebookData: { diff: 0 },
      pixivDataMain: { diff: 0 },
      pixivDataSub: { diff: 0 },
      fanboxData: { diff: 0 },
    };
  },

  mounted() {
    this.initialize();
    this.timer = setInterval(() => {
      this.initialize();
    }, 60 * 60 * 1000 /* 60 minutes */);
  },

  methods: {
    async initialize() {
      this.loading = true;
      try {
        const resTwitter = await axios.get(
          `${process.env.VUE_APP_API_URL}/twitter/statistics`
        );
        this.twitterData = { ...resTwitter.data };

        if (
          localStorage.getItem("twitterFollowersCount") === null &&
          !isNaN(this.twitterData.public_metrics.followers_count)
        ) {
          localStorage.setItem(
            "twitterFollowersCount",
            this.twitterData.public_metrics.followers_count
          );
        }

        this.twitterData.diff =
          this.twitterData.public_metrics.followers_count -
          Number(localStorage.getItem("twitterFollowersCount"));
      } catch (e) {
        console.log(e);
      }
      try {
        const resFacebook = await axios.get(
          `${process.env.VUE_APP_API_URL}/facebook/statistics`
        );
        this.facebookData = { ...resFacebook.data };

        if (
          localStorage.getItem("facebookFollowersCount") === null &&
          !isNaN(this.facebookData.fan_count)
        ) {
          localStorage.setItem(
            "facebookFollowersCount",
            this.facebookData.fan_count
          );
        }

        this.facebookData.diff =
          this.facebookData.fan_count -
          Number(localStorage.getItem("facebookFollowersCount"));
      } catch (e) {
        console.log(e);
      }
      try {
        const resPixivMain = await axios.get(
          `${process.env.VUE_APP_API_URL}/pixiv/statistics?user=driftkingtw`
        );
        this.pixivDataMain = { ...resPixivMain.data };

        if (
          localStorage.getItem("pixivMainFollowersCount") === null &&
          !isNaN(this.pixivDataMain.followerCount)
        ) {
          localStorage.setItem(
            "pixivMainFollowersCount",
            this.pixivDataMain.followerCount
          );
        }

        this.pixivDataMain.diff =
          this.pixivDataMain.followerCount -
          Number(localStorage.getItem("pixivMainFollowersCount"));
      } catch (e) {
        console.log(e);
      }
      try {
        const resPixivSub = await axios.get(
          `${process.env.VUE_APP_API_URL}/pixiv/statistics?user=dkaze`
        );
        this.pixivDataSub = { ...resPixivSub.data };

        if (
          localStorage.getItem("pixivSubFollowersCount") === null &&
          !isNaN(this.pixivDataSub.followerCount)
        ) {
          localStorage.setItem(
            "pixivSubFollowersCount",
            this.pixivDataSub.followerCount
          );
        }

        this.pixivDataSub.diff =
          this.pixivDataSub.followerCount -
          Number(localStorage.getItem("pixivSubFollowersCount"));
      } catch (e) {
        console.log(e);
      }
      try {
        const resFanbox = await axios.get(
          `${process.env.VUE_APP_API_URL}/pixiv/statistics/fanbox?user=dkaze`
        );
        this.fanboxData = { ...resFanbox.data };

        if (
          localStorage.getItem("fanboxPledgeNumber") === null &&
          !isNaN(this.fanboxData.pledge)
        ) {
          localStorage.setItem("fanboxPledgeNumber", this.fanboxData.pledge);
        }

        this.fanboxData.diff =
          this.fanboxData.pledge -
          Number(localStorage.getItem("fanboxPledgeNumber"));
      } catch (e) {
        console.log(e);
      }
      this.loading = false;
    },

    resetDiff() {
      localStorage.setItem(
        "twitterFollowersCount",
        this.twitterData.public_metrics.followers_count
      );
      localStorage.setItem(
        "facebookFollowersCount",
        this.facebookData.fan_count
      );
      localStorage.setItem(
        "pixivMainFollowersCount",
        this.pixivDataMain.followerCount
      );
      localStorage.setItem(
        "pixivSubFollowersCount",
        this.pixivDataSub.followerCount
      );
      localStorage.setItem("fanboxPledgeNumber", this.fanboxData.pledge);

      this.initialize();
    },

    numberWithCommas(x) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
  },

  computed: {
    //
  },

  beforeDestroy() {
    clearInterval(this.timer);
  },
};
</script>
