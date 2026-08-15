<template>
  <v-card color="primary">
    <v-fade-transition>
      <div v-if="showInfo">
        <div class="float-info top-center caption">
          <!-- The box doubles as the progress bar: it fills left to right as
               the print advances, so a glance at the stream tells you how far
               along it is without reading the number -->
          <div
            v-if="progress !== null"
            class="progress-fill"
            :class="{ 'is-complete': progress >= 100 }"
            :style="{ width: `${progress}%` }"
          ></div>

          <div v-if="isConnected" class="info-body">
            <div class="text-center text-truncate">
              {{ capitalize(sensors.currentStage.state) }} -
              {{ sensors.taskName.state }}
            </div>
            <div class="d-flex justify-center">
              <div class="mr-2">Progress: {{ readout(sensors.progress) }}</div>
              <div>| Left: {{ readout(sensors.remainingTime) }}</div>
            </div>
          </div>

          <div v-else class="info-body d-flex justify-center">Loading...</div>
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
              {{ readout(sensors.envTemp) }} /
              {{ readout(sensors.envHumidity) }}
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
      polling: false,
      sensors: SENSOR_KEYS.reduce((acc, key) => {
        acc[key] = { state: "-", unit: "" };
        return acc;
      }, {}),
    };
  },

  mounted() {
    this.initialize();
  },

  // HomeView remounts this block on every monitoring toggle, so the loop has
  // to stop with the instance or every toggle leaves another one polling
  beforeDestroy() {
    this.polling = false;
  },

  methods: {
    async initialize() {
      this.polling = true;

      while (this.polling) {
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
    // Percentage the top box is filled to, or null when there is no reading to
    // draw — an unreachable server must not leave a stale bar on screen
    progress() {
      if (!this.isConnected) return null;

      const { state } = this.sensors.progress;

      if (!state || state === "unknown" || state === "unavailable") return null;

      const value = Number(state);

      if (!Number.isFinite(value)) return null;

      return Math.min(Math.max(value, 0), 100);
    },
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
  /* Keeps the fill inside the rounded corners */
  overflow: hidden;
}

.progress-fill {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(255, 255, 255, 0.16);
  /* A brighter leading edge so the boundary reads as a progress bar rather
     than an uneven backdrop over a busy camera image */
  box-shadow: inset -2px 0 0 rgba(255, 255, 255, 0.5);
  /* Matches the one-second poll, so the edge creeps instead of stepping */
  transition: width 1s linear;
  overflow: hidden;
}

/* Light running along the filled part towards the leading edge, so the bar
   reads as a print still going rather than a static shape. The same sweep the
   statistics rows use while they load, on the same easing. */
.progress-fill::after {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  /* Concentrated into the middle fifth on purpose: spread across the whole
     band the gradient is so gradual it just washes the fill, and nothing
     appears to move. It also leaves a pause between passes, which suits an
     overlay you are not meant to keep looking at. */
  background: linear-gradient(
    90deg,
    transparent 30%,
    rgba(255, 255, 255, 0.28) 50%,
    transparent 70%
  );
  /* transform only, so the Pi composites this instead of repainting the
     overlay every frame on top of decoding the stream */
  animation: progress-sweep 2.4s ease-in-out infinite;
}

/* A finished print is not still working, so the light stops travelling */
.progress-fill.is-complete::after {
  animation: none;
}

@keyframes progress-sweep {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(100%);
  }
}

.info-body {
  position: relative;
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
