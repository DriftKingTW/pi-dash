<template>
  <div class="panel relative overflow-hidden">
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-300"
      leave-to-class="opacity-0"
    >
      <div v-if="showInfo">
        <div class="float-info top-center text-xs">
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
            <div class="truncate text-center">
              {{ capitalize(sensors.currentStage.state) }} -
              {{ sensors.taskName.state }}
            </div>
            <div class="flex justify-center">
              <div class="mr-2">Progress: {{ readout(sensors.progress) }}</div>
              <div>| Left: {{ readout(sensors.remainingTime) }}</div>
            </div>
          </div>

          <div v-else class="info-body flex justify-center">Loading...</div>
        </div>

        <div class="float-info bottom-center text-xs">
          <div v-if="isConnected" class="flex justify-around">
            <div>
              <i class="mdi mdi-printer-3d-nozzle-heat" />
              {{ readout(sensors.nozzleTemp) }} / {{ readout(sensors.nozzleTarget) }}
            </div>
            <div>
              <i class="mdi mdi-radiator" />
              {{ readout(sensors.bedTemp) }} / {{ readout(sensors.bedTarget) }}
            </div>
            <div>
              <i class="mdi mdi-thermometer" />
              {{ readout(sensors.envTemp) }} / {{ readout(sensors.envHumidity) }}
            </div>
          </div>

          <div v-else class="flex justify-center">Loading...</div>
        </div>
      </div>
    </Transition>

    <img
      :src="cameraStreamingUrl"
      alt="Camera Live Stream"
      class="camera-stream"
      @click="showInfo = !showInfo"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import axios from "axios";

const POLL_MS = 1000;

// Keys returned by the server's /printer route. The Home Assistant entity ids
// and token live there so they never reach the browser.
const SENSOR_KEYS = [
  "taskName", "currentStage", "progress", "remainingTime",
  "nozzleTemp", "nozzleTarget", "bedTemp", "bedTarget",
  "envTemp", "envHumidity",
];

const cameraStreamingUrl = import.meta.env.VITE_CAM_STERAMING_URL;
const showInfo = ref(true);
const isConnected = ref(false);
const sensors = ref(
  SENSOR_KEYS.reduce((acc, key) => {
    acc[key] = { state: "-", unit: "" };
    return acc;
  }, {})
);

let polling = true;

async function getPrinterStatus() {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/printer`);
    const next = { ...sensors.value };
    SENSOR_KEYS.forEach((key) => {
      if (res.data[key]) next[key] = res.data[key];
    });
    sensors.value = next;
    isConnected.value = true;
  } catch (e) {
    console.log(e);
    isConnected.value = false;
  }
}

// Home Assistant reports "unknown"/"unavailable" when a sensor has no value
function readout({ state, unit }) {
  if (!state || state === "unknown" || state === "unavailable") return "-";
  return unit ? `${state}${unit}` : state;
}

function capitalize(text) {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Percentage the top box is filled to, or null when there is no reading to
// draw — an unreachable server must not leave a stale bar on screen
const progress = computed(() => {
  if (!isConnected.value) return null;
  const { state } = sensors.value.progress;
  if (!state || state === "unknown" || state === "unavailable") return null;
  const value = Number(state);
  if (!Number.isFinite(value)) return null;
  return Math.min(Math.max(value, 0), 100);
});

onMounted(async () => {
  while (polling) {
    await getPrinterStatus();
    await new Promise((resolve) => setTimeout(resolve, POLL_MS));
  }
});

// HomeView remounts this block on every monitoring toggle, so the loop has to
// stop with the instance or every toggle leaves another one polling
onUnmounted(() => {
  polling = false;
});
</script>

<style scoped>
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
  /* Glass over the stream, matching the panels: dark enough to read over a
     bright bed, with the same lit top edge */
  background-color: rgba(20, 20, 28, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.18);
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 14px;
  backdrop-filter: blur(2px);
  width: 96%;
  /* Keeps the fill inside the rounded corners */
  overflow: hidden;
  z-index: 1;
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

.top-center {
  top: 0.6rem;
  left: 50%;
  transform: translate(-50%, 0);
}

.bottom-center {
  bottom: 0.8rem;
  left: 50%;
  transform: translate(-50%, 0);
}
</style>
