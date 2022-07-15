<template>
  <v-card flat :loading="loading">
    <v-card-title>
      <v-icon left>mdi-tune-vertical</v-icon>
      ControlCenter
    </v-card-title>
    <v-card-text class="d-flex align-center">
      <v-row>
        <v-col cols="12" class="pa-1">
          <v-list-item>
            <v-list-item-avatar>
              <v-img :src="currentPlaying.cover" :alt="''"></v-img>
            </v-list-item-avatar>

            <v-list-item-content>
              <v-list-item-title>
                {{ currentPlaying.title }}
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ currentPlaying.artist }} - {{ currentPlaying.album }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-progress-linear
            :value="progress"
            color="indigo accent-4"
          ></v-progress-linear>
        </v-col>
        <v-col cols="12" class="pa-1 d-flex align-center justify-center">
          <v-btn icon large @click="trigger('Previous')">
            <v-icon>mdi-skip-previous</v-icon>
          </v-btn>
          <v-btn icon x-large @click="trigger('PlayPause')">
            <v-icon>mdi-play-pause</v-icon>
          </v-btn>
          <v-btn icon large @click="trigger('Next')">
            <v-icon>mdi-skip-next</v-icon>
          </v-btn>
          <v-btn icon large @click="trigger('VolumeUp')">
            <v-icon>mdi-volume-plus</v-icon>
          </v-btn>
          <v-btn icon large @click="trigger('VolumeDown')">
            <v-icon>mdi-volume-minus</v-icon>
          </v-btn>
          <v-btn icon large @click="trigger('Mute')">
            <v-icon>mdi-volume-off</v-icon>
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
      hostUrl: "${this.hostUrl}",
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
      data: {},
    };
  },

  mounted() {
    this.initialize();
  },

  methods: {
    async initialize() {
      setInterval(() => {
        this.getCurrentPlaying();
        if (this.currentPlaying.isPlaying === 1) {
          this.currentPlaying.elapsedTime += 0.5;
        }
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

    async getCurrentPlaying() {
      try {
        let res = await axios.get(
          `http://${this.hostUrl}/get_number_variable/?variableName=BTTCurrentlyPlaying`
        );
        this.currentPlaying.isPlaying = res.data;
        res = await axios.get(
          `http://${this.hostUrl}/get_string_variable/?variableName=BTTNowPlayingInfoTitle`
        );
        this.currentPlaying.title = res.data;
        res = await axios.get(
          `http://${this.hostUrl}/get_string_variable/?variableName=BTTNowPlayingInfoAlbum`
        );
        this.currentPlaying.album = res.data;
        res = await axios.get(
          `http://${this.hostUrl}/get_string_variable/?variableName=BTTNowPlayingInfoArtist`
        );
        this.currentPlaying.artist = res.data;
        res = await axios.get(
          `http://${this.hostUrl}/get_string_variable/?variableName=BTTNowPlayingInfoArtworkData`
        );
        this.currentPlaying.cover = res.data;
        res = await axios.get(
          `http://${this.hostUrl}/get_number_variable/?variableName=BTTNowPlayingInfoDuration`
        );
        this.currentPlaying.duration = Number(res.data);
        if (this.currentPlaying.isPlaying === 0) {
          res = await axios.get(
            `http://${this.hostUrl}/get_number_variable/?variableName=BTTNowPlayingInfoElapsedTime`
          );
          this.currentPlaying.elapsedTime = Number(res.data);
        }
      } catch (e) {
        console.log(e);
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
