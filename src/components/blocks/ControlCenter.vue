<template>
  <v-card color="primary" flat :loading="loading">
    <v-card-title>
      <v-icon left>mdi-tune-vertical</v-icon>
      Control Center
    </v-card-title>
    <v-card-text class="align-center">
      <v-row>
        <!-- Music Info -->
        <v-col cols="12" class="pa-1">
          <v-list-item>
            <v-list-item-avatar tile>
              <v-img
                v-if="currentPlaying.cover.length > 0"
                :src="currentPlaying.cover"
                :alt="currentPlaying.album"
              ></v-img>
              <v-icon v-else>mdi-music</v-icon>
            </v-list-item-avatar>

            <v-list-item-content>
              <v-list-item-title
                class="d-inline-block text-truncate font-weight-bold"
              >
                {{ currentPlaying.title }}
              </v-list-item-title>
              <v-list-item-subtitle class="d-inline-block text-truncate">
                {{ currentPlaying.artist }} - {{ currentPlaying.album }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-col>

        <!-- Playback/Volume Controls -->
        <v-col
          cols="12"
          class="py-1 px-6 d-flex align-center justify-space-between"
        >
          <v-btn icon x-large @click="trigger('Previous')">
            <v-icon>mdi-skip-previous</v-icon>
          </v-btn>
          <v-btn
            v-if="!currentPlaying.isPlaying"
            icon
            x-large
            @click="trigger('PlayPause')"
          >
            <v-icon>mdi-play</v-icon>
          </v-btn>
          <v-btn v-else icon x-large @click="trigger('PlayPause')">
            <v-icon>mdi-pause</v-icon>
          </v-btn>
          <v-btn icon x-large @click="trigger('Next')">
            <v-icon>mdi-skip-next</v-icon>
          </v-btn>
          <v-btn icon x-large @click="trigger('Mute')">
            <v-icon>mdi-volume-off</v-icon>
          </v-btn>
          <v-btn icon x-large @click="trigger('VolumeDown')">
            <v-icon>mdi-volume-minus</v-icon>
          </v-btn>
          <v-btn icon x-large @click="trigger('VolumeUp')">
            <v-icon>mdi-volume-plus</v-icon>
          </v-btn>
        </v-col>

        <!-- Other Controls -->
        <v-col
          cols="12"
          class="py-1 px-6 d-flex align-center justify-space-between"
        >
          <div class="d-flex flex-column">
            <v-btn v-if="!dnd" icon x-large @click="trigger('DND')">
              <v-icon>mdi-bell</v-icon>
            </v-btn>

            <v-btn v-else icon x-large @click="trigger('DND')">
              <v-icon>mdi-bell-off</v-icon>
            </v-btn>
            <div class="text-center caption">DnD</div>
          </div>

          <div class="d-flex flex-column">
            <v-btn icon x-large @click="trigger('ToggleFan')">
              <v-icon>mdi-fan</v-icon>
            </v-btn>
            <div class="text-center caption">Fan</div>
          </div>

          <div class="d-flex flex-column">
            <v-btn icon x-large @click="trigger('SleepDisplay')">
              <v-icon>mdi-television-off</v-icon>
            </v-btn>
            <div class="text-center caption">Sleep</div>
          </div>

          <div class="d-flex flex-column">
            <v-btn icon x-large @click="trigger('ToggleLyric')">
              <v-icon>mdi-subtitles</v-icon>
            </v-btn>
            <div class="text-center caption">Lyrics</div>
          </div>

          <div class="d-flex flex-column">
            <v-btn icon x-large @click="trigger('GetSMSVerification')">
              <v-icon>mdi-message-text</v-icon>
            </v-btn>
            <div class="text-center caption">CoVE</div>
          </div>

          <div class="d-flex flex-column">
            <v-btn icon x-large @click="trigger('ShowFloatingWebView')">
              <v-icon>mdi-picture-in-picture-bottom-right</v-icon>
            </v-btn>
            <div class="text-center caption">PiP</div>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import axios from "axios";

const timeout = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export default {
  components: {},

  data() {
    return {
      loading: true,
      currentPlaying: {
        isPlaying: 0,
        title: "Not Playing...",
        artist: "",
        album: "",
        cover: "",
        elapsedTime: 0,
        duration: 0,
      },
      dnd: false,
      data: {},
    };
  },

  mounted() {
    this.initialize();
  },

  methods: {
    async initialize() {
      // Update status with 0.3 second interval
      for (;;) {
        await this.updateStatus();
        await timeout(300);
      }
    },

    // Trigger BTT actions
    async trigger(triggerName) {
      try {
        await axios.get(
          `${process.env.VUE_APP_BTT_API_URL}/trigger_named/?trigger_name=${triggerName}`
        );
        this.getCurrentPlaying();
      } catch (e) {
        console.log(e);
      }
    },

    // Get playing info and system status from BTT http server
    async updateStatus() {
      const getSystemDoNotDisturbState = async () => {
        return await axios.get(
          `${process.env.VUE_APP_BTT_API_URL}/get_number_variable/?variableName=SystemDoNotDisturbState`
        );
      };

      const getBTTCurrentlyPlaying = async () => {
        return await axios.get(
          `${process.env.VUE_APP_BTT_API_URL}/get_number_variable/?variableName=BTTCurrentlyPlaying`
        );
      };

      const getBTTNowPlayingInfoAlbum = async () => {
        return await axios.get(
          `${process.env.VUE_APP_BTT_API_URL}/get_string_variable/?variableName=BTTNowPlayingInfoAlbum`
        );
      };

      const getBTTNowPlayingInfoArtist = async () => {
        return await axios.get(
          `${process.env.VUE_APP_BTT_API_URL}/get_string_variable/?variableName=BTTNowPlayingInfoArtist`
        );
      };

      const getBTTNowPlayingInfoTitle = async () => {
        return await axios.get(
          `${process.env.VUE_APP_BTT_API_URL}/get_string_variable/?variableName=BTTNowPlayingInfoTitle`
        );
      };

      try {
        const res = await Promise.all([
          getBTTCurrentlyPlaying(),
          getBTTNowPlayingInfoAlbum(),
          getBTTNowPlayingInfoArtist(),
          getBTTNowPlayingInfoTitle(),
          getSystemDoNotDisturbState(),
        ]);

        this.currentPlaying.isPlaying = res[0].data;
        this.currentPlaying.album = res[1].data;
        this.currentPlaying.artist = res[2].data;
        this.currentPlaying.title = res[3].data;

        const resDnD = res[4];
        this.dnd = resDnD.data === 1 ? true : false;
        if (resDnD.data === "error") {
          this.$store.commit("updateConnectionStatus", false);
        } else {
          this.$store.commit("updateConnectionStatus", true);
        }
      } catch (e) {
        console.log(e);
      }
    },

    async getAlbumArt() {
      const errorMessage = "error";
      if (
        this.currentPlaying.title === errorMessage &&
        this.currentPlaying.artist === errorMessage &&
        this.currentPlaying.album === errorMessage
      ) {
        return;
      }
      const res = await axios.get(
        process.env.VUE_APP_MB_API_URL +
          `/release/?fmt=json&limit=1&query=${this.currentPlaying.title} AND artist:${this.currentPlaying.artist}`
      );
      if (res.data.releases && res.data.releases.length > 0) {
        const coverRes = await axios.get(
          process.env.VUE_APP_COVERART_API_URL +
            `/release/${res.data.releases[0].id}`
        );
        if (coverRes.data.images[0].thumbnails.small) {
          this.currentPlaying.cover = coverRes.data.images[0].thumbnails.small;
        }
      }
      this.loading = false;
    },
  },

  watch: {
    // Get album and music info when playing changes
    "currentPlaying.title": function (newVal, oldVal) {
      if (newVal !== oldVal) {
        this.currentPlaying.cover = "";
        this.getAlbumArt();
      }
    },
  },

  computed: {
    //
  },
};
</script>
