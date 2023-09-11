<template>
  <v-app-bar app color="primary" dark height="30px" flat>
    <div class="d-flex align-center">
      <v-app-bar-nav-icon @click="$store.commit('toggleNavDrawer')">
        <!-- <raspberry-pi-icon
          size="1.2x"
          fill="white"
          class="mr-2"
        ></raspberry-pi-icon> -->
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
    <v-btn text>
      <v-icon small left :color="temperatureColor">mdi-thermometer</v-icon>
      <span :class="`${temperatureColor}--text`">{{ temperature }}</span>
      <v-icon small right :color="temperatureColor">
        mdi-temperature-celsius
      </v-icon>
    </v-btn>
    <v-divider vertical class="mx-1"></v-divider>
    <v-btn icon @click="switchPCMonitoring">
      <v-icon small>mdi-swap-horizontal</v-icon>
    </v-btn>
    <v-divider vertical class="mx-1"></v-divider>
    <v-btn icon @click="syncClipboard">
      <v-icon small>mdi-clipboard-arrow-down-outline</v-icon>
    </v-btn>
    <v-divider vertical class="mx-1"></v-divider>
    <v-btn icon @click="$store.commit('openKeyboard')">
      <v-icon small>mdi-keyboard</v-icon>
    </v-btn>
    <v-divider vertical class="mx-1"></v-divider>
    <v-btn icon @click="reloadPage">
      <v-icon small>mdi-refresh</v-icon>
    </v-btn>
    <v-divider vertical class="mx-1"></v-divider>
    <v-btn icon @click="screenOff">
      <v-icon small>mdi-television-off</v-icon>
    </v-btn>
    <template v-if="isExpand">
      <v-divider vertical class="mx-1"></v-divider>
      <v-btn icon @click="piReboot">
        <v-icon small color="warning">mdi-restart</v-icon>
      </v-btn>
      <v-divider vertical class="mx-1"></v-divider>
      <v-btn icon @click="piOff">
        <v-icon small color="error">mdi-power</v-icon>
      </v-btn>
    </template>
    <v-divider vertical class="mx-1"></v-divider>
    <v-btn icon @click="$store.commit('toggleExpand')">
      <v-icon small v-if="isExpand">mdi-chevron-right</v-icon>
      <v-icon small v-else>mdi-dots-horizontal</v-icon>
    </v-btn>
  </v-app-bar>
</template>

<script>
// import { RaspberryPiIcon } from "vue-simple-icons";
import { mapState } from "vuex";
import axios from "axios";
import copy from "copy-to-clipboard";

export default {
  components: {
    // RaspberryPiIcon,
  },

  data() {
    return {
      temperature: 0,
    };
  },

  mounted() {
    this.initialize();
  },

  methods: {
    initialize() {
      setInterval(() => {
        this.updateTemperature();
      }, 5000); // 5 seconds
    },

    switchPCMonitoring() {
      const notifyText = !this.showPCMonitoring
        ? "PC Monitoring Enabled"
        : "PC Monitoring Disabled";
      this.$store.commit("switchPCMonitoring");
      this.$store.commit("triggerSnackbar", {
        status: "success",
        text: notifyText,
      });
    },

    async updateTemperature() {
      try {
        const result = await axios.get(
          process.env.VUE_APP_API_URL + "/shell/temperature"
        );
        this.temperature = (result.data.value / 1000).toFixed(1);
      } catch (e) {
        console.log(e);
      }
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

    async piOff() {
      try {
        await axios.get(process.env.VUE_APP_API_URL + "/shell/power", {
          params: { action: "off" },
        });
      } catch (e) {
        console.log(e);
      }
    },

    async piReboot() {
      try {
        await axios.get(process.env.VUE_APP_API_URL + "/shell/power", {
          params: { action: "reboot" },
        });
      } catch (e) {
        console.log(e);
      }
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

    // Trigger BTT actions
    async trigger(triggerName) {
      try {
        await axios.get(
          `${process.env.VUE_APP_BTT_API_URL}/trigger_named/?trigger_name=${triggerName}`
        );
      } catch (e) {
        console.log(e);
      }
    },

    async syncClipboard() {
      try {
        this.trigger("SetClipboardVariable");
        await new Promise((resolve) => setTimeout(resolve, 500));
        const res = await axios.get(
          `${process.env.VUE_APP_BTT_API_URL}/get_string_variable/?variableName=LatestClipboardData`
        );
        this.$store.commit("updateInput", res.data);
        this.$store.commit("triggerSnackbar", {
          status: "success",
          text: "Clipboard synced: " + res.data,
        });
        copy(res.data);
      } catch (e) {
        console.log(e);
      }
    },
  },

  computed: {
    ...mapState(["statusMessages", "connectionStatus", "isExpand"]),
    temperatureColor() {
      if (this.temperature >= 70) {
        return "error";
      } else if (this.temperature >= 60) {
        return "warning";
      } else {
        return "white";
      }
    },
  },
};
</script>
