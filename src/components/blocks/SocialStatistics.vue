<template>
  <v-card color="primary" flat :loading="loading">
    <v-card-text>
      <v-row>
        <v-col cols="12" class="pa-0 pr-4">
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
                      ? numberWithCommas(pixivDataMain.followerCount) +
                        " Followers"
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
                      ? numberWithCommas(pixivDataSub.followerCount) +
                        " Followers"
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
                  {{
                    fanboxData.fans
                      ? numberWithCommas(fanboxData.fans) + " Fans"
                      : 0
                  }}
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

    <v-card-actions class="px-4">
      <span class="caption grey--text">
        Last Updated:
        <template v-if="lastUpdate">
          {{ lastUpdate.toLocaleString() }}
        </template>
      </span>
      <v-spacer></v-spacer>
      <v-btn text @dblclick="resetDiff" @click="showDblClickHint">
        <v-icon left>mdi-television-shimmer</v-icon> Reset
      </v-btn>
      <v-btn text @click="initialize">
        <v-icon left>mdi-refresh</v-icon> Reload
      </v-btn>
    </v-card-actions>
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
      pixivDataMain: { diff: 0 },
      pixivDataSub: { diff: 0 },
      fanboxData: { diff: 0 },
      lastUpdate: null,
    };
  },

  mounted() {
    this.initialize();
    this.lastUpdate = new Date();
    this.timer = setInterval(() => {
      this.initialize();
      this.lastUpdate = new Date();
    }, 60 * 60 * 1000 /* 60 minutes */);
  },

  methods: {
    async initialize() {
      this.loading = true;
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
      if (!isNaN(this.pixivDataMain.followerCount)) {
        localStorage.setItem(
          "pixivMainFollowersCount",
          this.pixivDataMain.followerCount
        );
      }
      if (!isNaN(this.pixivDataSub.followerCount)) {
        localStorage.setItem(
          "pixivSubFollowersCount",
          this.pixivDataSub.followerCount
        );
      }
      if (!isNaN(this.fanboxData.pledge)) {
        localStorage.setItem("fanboxPledgeNumber", this.fanboxData.pledge);
      }

      this.$store.commit("triggerSnackbar", {
        status: "success",
        text: "Status has been reset.",
      });

      this.initialize();
    },

    numberWithCommas(x) {
      if (x === undefined) return "Error";
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    showDblClickHint() {
      this.$store.commit("triggerSnackbar", {
        status: "info",
        text: "Double click to reset status.",
      });
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
