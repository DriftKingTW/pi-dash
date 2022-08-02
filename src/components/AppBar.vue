<template>
  <v-app-bar app color="primary" dark height="30px" flat>
    <div class="d-flex align-center">
      <v-app-bar-nav-icon>
        <raspberry-pi-icon
          size="1.2x"
          fill="white"
          class="mr-2"
        ></raspberry-pi-icon>
      </v-app-bar-nav-icon>
      <v-toolbar-title>
        <strong>Pi Dash</strong>
      </v-toolbar-title>
    </div>
    <v-spacer></v-spacer>
    <v-chip
      v-if="connectionStatus === 'disconnected'"
      small
      color="primary"
      class="error--text"
    >
      <v-icon small left color="error">mdi-server-network-off</v-icon>
      {{ `BTT Server ${statusMessages[connectionStatus]}` }}
    </v-chip>
    <v-chip v-else small color="primary">
      <v-icon small left>mdi-server-network</v-icon>
      {{ `BTT Server ${statusMessages[connectionStatus]}` }}
    </v-chip>
    <v-divider vertical class="mx-1"></v-divider>
    <v-btn icon @click="screenOff">
      <v-icon small>mdi-television-off</v-icon>
    </v-btn>
    <v-divider vertical class="mx-1"></v-divider>
    <v-btn icon @dblclick="reloadPage" @click="showReloadHint">
      <v-icon small>mdi-refresh</v-icon>
    </v-btn>
    <v-divider vertical class="mx-1"></v-divider>
    <v-btn icon @click="$store.commit('openKeyboard')">
      <v-icon small>mdi-keyboard</v-icon>
    </v-btn>
  </v-app-bar>
</template>

<script>
import { RaspberryPiIcon } from "vue-simple-icons";
import { mapState } from "vuex";
import axios from "axios";

export default {
  components: {
    RaspberryPiIcon,
  },

  data() {
    return {
      now: "",
    };
  },

  mounted() {
    this.initialize();
    setInterval(() => {
      this.updateTime();
    }, 1000);
  },

  methods: {
    initialize() {
      //
    },

    updateTime() {
      const date = new Date();
      this.now = date.toLocaleString();
    },

    reloadPage() {
      window.location.reload();
    },

    showReloadHint() {
      this.$store.commit("triggerSnackbar", {
        status: "warning",
        text: "Double click to reload page",
      });
    },

    async screenOff() {
      try {
        await axios.get(process.env.VUE_APP_API_URL + "/shell/display", {
          params: { action: "off" },
        });
      } catch (e) {
        console.log(e);
      }
    },
  },

  computed: {
    ...mapState(["statusMessages", "connectionStatus"]),
  },
};
</script>
