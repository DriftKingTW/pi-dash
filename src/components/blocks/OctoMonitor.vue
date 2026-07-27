<template>
  <v-card color="primary">
    <v-fade-transition>
      <div v-if="showInfo">
        <div class="float-info top-center caption">
          <div v-if="isConnected">
            <div class="text-center text-truncate">
              {{ capitalize(sensors.currentStage.state) }} -
              {{ sensors.taskName.state }}
            </div>
            <div class="d-flex justify-center">
              <div class="mr-2">Progress: {{ readout(sensors.progress) }}</div>
              <div>| Left: {{ readout(sensors.remainingTime) }}</div>
            </div>
          </div>

          <div v-else class="d-flex justify-center">Loading...</div>
        </div>

        <div class="float-info bottom-center caption">
          <div v-if="isConnected" class="d-flex justify-space-around">
            <div>
              <v-icon small>mdi-printer-3d-nozzle-heat</v-icon>
              {{ readout(sensors.nozzleTemp) }} /
              {{ readout(sensors.nozzleTarget) }}
            </div>
            <div>
              <v-icon small>mdi-radiator</v-icon>
              {{ readout(sensors.bedTemp) }} / {{ readout(sensors.bedTarget) }}
            </div>
            <div>
              <v-icon small>mdi-thermometer</v-icon>
              {{ readout(sensors.envTemp) }} / {{ readout(sensors.envHumidity) }}
            </div>
          </div>

          <div v-else class="d-flex justify-center">Loading...</div>
        </div>
      </div>
    </v-fade-transition>
    <img
      :src="cameraStreamingUrl"
      alt="Camera Live Stream"
      class="camera-stream"
      @click="showInfo = !showInfo"
    />
  </v-card>
</template>

<script>
import axios from "axios";

const timeout = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// Keys returned by the server's /printer route. The Home Assistant entity ids
// and token live there so they never reach the browser.
const SENSOR_KEYS = [
  "taskName",
  "currentStage",
  "progress",
  "remainingTime",
  "nozzleTemp",
  "nozzleTarget",
  "bedTemp",
  "bedTarget",
  "envTemp",
  "envHumidity",
];

export default {
  components: {
    //
  },

  data() {
    return {
      cameraStreamingUrl: process.env.VUE_APP_CAM_STERAMING_URL,
      showInfo: true,
      isConnected: false,
      sensors: SENSOR_KEYS.reduce((acc, key) => {
        acc[key] = { state: "-", unit: "" };
        return acc;
      }, {}),
    };
  },

  mounted() {
    this.initialize();
  },

  methods: {
    async initialize() {
      await this.getPrinterStatus();

      for (;;) {
        await this.getPrinterStatus();
        await timeout(1000);
      }
    },

    async getPrinterStatus() {
      try {
        const res = await axios.get(`${process.env.VUE_APP_API_URL}/printer`);

        SENSOR_KEYS.forEach((key) => {
          if (res.data[key]) this.sensors[key] = res.data[key];
        });

        this.isConnected = true;
      } catch (e) {
        console.log(e);
        this.isConnected = false;
      }
    },

    // Home Assistant reports "unknown"/"unavailable" when a sensor has no value
    readout({ state, unit }) {
      if (!state || state === "unknown" || state === "unavailable") return "-";

      return unit ? `${state}${unit}` : state;
    },

    capitalize(text) {
      if (!text) return "";

      return text.charAt(0).toUpperCase() + text.slice(1);
    },
  },

  computed: {
    //
  },
};
</script>

<style scoped lang="scss">
.v-card {
  height: 100%;
  overflow: hidden;
}

/* Fill the card instead of letting the stream's aspect ratio drive the card
   height, so the overlays always sit on the image edges */
.camera-stream {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.float-info {
  position: absolute;
  background-color: rgba(0, 0, 0, 0.2);
  color: white;
  padding: 0.5rem;
  border-radius: 5px;
  backdrop-filter: blur(2px);
  width: 96%;
}

.top-left {
  top: 0.5rem;
  left: 0.5rem;
}

.top-right {
  top: 0.5rem;
  right: 0.5rem;
}

.top-center {
  top: 0.5rem;
  left: 50%;
  transform: translate(-50%, 0);
}

.bottom-center {
  bottom: 0.8rem;
  left: 50%;
  transform: translate(-50%, 0);
}
</style>
