<template>
  <header
    class="flex h-[30px] shrink-0 items-center gap-1 px-2 text-sm"
  >
    <button class="grid h-7 w-7 place-items-center rounded-full hover:bg-surface-2" @click="ui.toggleNavDrawer()">
      <i class="mdi mdi-menu text-lg" />
    </button>
    <strong class="ml-1">Pi Dash</strong>

    <div class="flex-1" />

    <span class="flex items-center gap-1 px-2" :class="temperatureClass">
      <i class="mdi mdi-thermometer" />
      {{ temperature }}
      <i class="mdi mdi-temperature-celsius" />
    </span>

    <button
      class="grid h-7 w-7 place-items-center rounded-full text-base hover:bg-surface-2 disabled:opacity-50"
      :disabled="isKettleLoading"
      aria-label="Kettle temperature"
      @click="getKettleTemperature"
    >
      <i class="mdi" :class="isKettleLoading ? 'mdi-loading mdi-spin' : 'mdi-kettle'" />
    </button>
    <div class="mx-1.5 h-4 w-px bg-line" />

    <template v-for="(action, index) in actions" :key="action.icon">
      <div v-if="index > 0" class="mx-1.5 h-4 w-px bg-line" />
      <button
        class="grid h-7 w-7 place-items-center rounded-full text-base hover:bg-surface-2"
        :class="action.class"
        @click="action.run"
      >
        <i :class="['mdi', action.icon]" />
      </button>
    </template>
  </header>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import axios from "axios";
import copy from "copy-to-clipboard";

import { useUiStore } from "@/stores/ui";

const TEMP_POLL_MS = 5000;

const ui = useUiStore();
const temperature = ref(0);
let timer = null;

const temperatureClass = computed(() => {
  if (temperature.value >= 70) return "text-crit";
  if (temperature.value >= 60) return "text-warn";
  return "text-ink";
});

async function updateTemperature() {
  try {
    const res = await axios.get(
      import.meta.env.VITE_API_URL + "/shell/temperature"
    );
    temperature.value = (res.data.value / 1000).toFixed(1);
  } catch (e) {
    console.log(e);
  }
}

async function shell(path, action) {
  try {
    await axios.get(import.meta.env.VITE_API_URL + path, { params: { action } });
  } catch (e) {
    console.log(e);
  }
}

async function screenOff() {
  // The overlay goes up first: the tap that wakes the screen would otherwise
  // land on whatever is underneath it.
  ui.openScreenControlOverlay();
  await shell("/shell/display", "off");
}

const isKettleLoading = ref(false);

async function getKettleTemperature() {
  let result = "";
  let index = 0;
  do {
    try {
      isKettleLoading.value = true;
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/mikettle/temperature`,
        // Reading over BLE is slower than the global default allows
        { timeout: 30000 }
      );
      // axios JSON-parses a bare number, and .includes needs a string
      result = String(res.data);
    } catch (e) {
      console.log(e);
    } finally {
      isKettleLoading.value = false;
      index++;
    }
  } while (result.includes("Read failed") && index < 10);

  // The server answers 200 with the script's error text when the read fails,
  // so a number is the only thing that counts as success.
  const temperature = Number.parseFloat(result);
  if (Number.isNaN(temperature)) {
    console.log("Kettle read failed:", result);
    ui.triggerSnackbar({ status: "error", text: "Couldn't read the kettle" });
    return;
  }
  ui.triggerSnackbar({ status: "success", text: `Kettle temperature: ${temperature}°C` });
}

// Trigger BTT actions
async function trigger(triggerName) {
  try {
    await axios.get(
      `${import.meta.env.VITE_BTT_API_URL}/trigger_named/?trigger_name=${triggerName}`
    );
  } catch (e) {
    console.log(e);
  }
}

async function syncClipboard() {
  try {
    trigger("SetClipboardVariable");
    await new Promise((resolve) => setTimeout(resolve, 500));
    const res = await axios.get(
      `${import.meta.env.VITE_BTT_API_URL}/get_string_variable/?variableName=LatestClipboardData`
    );
    ui.updateInput(res.data);
    ui.triggerSnackbar({ status: "success", text: "Clipboard synced: " + res.data });
    copy(res.data);
  } catch (e) {
    console.log(e);
  }
}

// The destructive pair is hidden until the bar is expanded, so a stray tap on
// a wall-mounted screen cannot power the Pi down.
const actions = computed(() => [
  { icon: "mdi-swap-horizontal", run: () => ui.switchPCMonitoring() },
  { icon: "mdi-printer-3d-nozzle", run: () => ui.switchOctoMonitoring() },
  { icon: "mdi-clipboard-arrow-down-outline", run: syncClipboard },
  { icon: "mdi-keyboard", run: () => ui.openKeyboard() },
  { icon: "mdi-refresh", run: () => window.location.reload() },
  { icon: "mdi-television-off", run: screenOff },
  ...(ui.isExpand
    ? [
        { icon: "mdi-restart", class: "text-warn", run: () => shell("/shell/power", "reboot") },
        { icon: "mdi-power", class: "text-crit", run: () => shell("/shell/power", "off") },
      ]
    : []),
  {
    icon: ui.isExpand ? "mdi-chevron-right" : "mdi-dots-horizontal",
    run: () => ui.toggleExpand(),
  },
]);

onMounted(() => {
  updateTemperature();
  timer = setInterval(updateTemperature, TEMP_POLL_MS);
});
onUnmounted(() => clearInterval(timer));
</script>
