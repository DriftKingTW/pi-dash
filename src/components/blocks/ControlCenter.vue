<template>
  <v-card flat :loading="loading">
    <v-card-title>
      <v-icon left>mdi-tune-vertical</v-icon>
      ControlCenter
    </v-card-title>
    <v-card-text class="align-center">
      <v-row>
        <v-col cols="12" class="pa-1">
          <v-list-item>
            <v-list-item-avatar tile>
              <v-img
                v-if="currentPlaying.cover.length > 0"
                :src="currentPlaying.cover"
                :alt="''"
              ></v-img>
              <v-icon v-else>mdi-music</v-icon>
            </v-list-item-avatar>

            <v-list-item-content>
              <v-list-item-title class="d-inline-block text-truncate">
                {{ currentPlaying.title }}
              </v-list-item-title>
              <v-list-item-subtitle class="d-inline-block text-truncate">
                {{ currentPlaying.artist }} - {{ currentPlaying.album }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-col>
        <v-col
          cols="12"
          class="py-1 px-6 d-flex align-center justify-space-between"
        >
          <v-btn icon large @click="trigger('Previous')">
            <v-icon>mdi-skip-previous</v-icon>
          </v-btn>
          <v-btn
            v-if="!currentPlaying.isPlaying"
            icon
            large
            @click="trigger('PlayPause')"
          >
            <v-icon>mdi-play</v-icon>
          </v-btn>
          <v-btn v-else icon large @click="trigger('PlayPause')">
            <v-icon>mdi-pause</v-icon>
          </v-btn>
          <v-btn icon large @click="trigger('Next')">
            <v-icon>mdi-skip-next</v-icon>
          </v-btn>
          <v-btn icon large @click="trigger('Mute')">
            <v-icon>mdi-volume-off</v-icon>
          </v-btn>
          <v-btn icon large @click="trigger('VolumeDown')">
            <v-icon>mdi-volume-minus</v-icon>
          </v-btn>
          <v-btn icon large @click="trigger('VolumeUp')">
            <v-icon>mdi-volume-plus</v-icon>
          </v-btn>
        </v-col>

        <v-col
          cols="12"
          class="py-1 px-6 d-flex align-center justify-space-between"
        >
          <v-btn v-if="dnd" icon large @click="trigger('DND')">
            <v-icon>mdi-bell</v-icon>
          </v-btn>
          <v-btn v-else icon large @click="trigger('DND')">
            <v-icon>mdi-bell-off</v-icon>
          </v-btn>
          <v-btn icon large @click="trigger('ToggleLyric')">
            <v-icon>mdi-subtitles</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import axios from "axios";

export default {
  components: {},

  data() {
    return {
      hostUrl: "localhost:61901",
      loading: true,
      currentPlaying: {
        isPlaying: 0,
        title: "No song playing...",
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
      setInterval(() => {
        this.updateStatus();
      }, 500);
    },

    async trigger(triggerName) {
      try {
        await axios.get(
          `http://${this.hostUrl}/trigger_named/?trigger_name=${triggerName}`
        );
        this.getCurrentPlaying();
      } catch (e) {
        console.log(e);
      }
    },

    updateStatus() {
      this.getCurrentPlaying();
      this.getDNDStatus();
    },

    async getDNDStatus() {
      let res = await axios.get(
        `http://${this.hostUrl}/get_number_variable/?variableName=SystemDoNotDisturbState`
      );
      if (res.data === 1) {
        this.dnd = true;
      } else {
        this.dnd = false;
      }
    },

    async getCurrentPlaying() {
      try {
        let res = await axios.get(
          `http://${this.hostUrl}/get_number_variable/?variableName=BTTCurrentlyPlaying`
        );
        this.currentPlaying.isPlaying = res.data;
        res = await axios.get(
          `http://${this.hostUrl}/get_string_variable/?variableName=BTTNowPlayingInfoAlbum`
        );
        this.currentPlaying.album = res.data;
        res = await axios.get(
          `http://${this.hostUrl}/get_string_variable/?variableName=BTTNowPlayingInfoArtist`
        );
        this.currentPlaying.artist = res.data;
        res = await axios.get(
          `http://${this.hostUrl}/get_string_variable/?variableName=BTTNowPlayingInfoTitle`
        );
        this.currentPlaying.title = res.data;
      } catch (e) {
        console.log(e);
      }
    },

    async getAlbumArt() {
      const res = await axios.get(
        process.env.VUE_APP_MB_API_URL +
          `/release/?fmt=json&limit=1&query=${this.currentPlaying.title} AND artist:${this.currentPlaying.artist}`
      );
      const coverRes = await axios.get(
        process.env.VUE_APP_COVERART_API_URL +
          `/release/${res.data.releases[0].id}`
      );
      if (coverRes.data.images[0].thumbnails.small) {
        this.currentPlaying.cover = coverRes.data.images[0].thumbnails.small;
      }
    },
  },

  watch: {
    "currentPlaying.title": function (newVal, oldVal) {
      if (newVal !== oldVal) {
        this.currentPlaying.cover = "";
        this.getAlbumArt();
      }
    },
  },

  computed: {
    progress: function () {
      return (
        (this.currentPlaying.elapsedTime / this.currentPlaying.duration) * 100
      );
    },
  },
};
</script>
