<template>
  <header
    class="flex h-[30px] shrink-0 items-center gap-1 px-2 text-sm"
  >
    <button class="rounded-full p-1 hover:bg-surface-2" @click="ui.toggleNavDrawer()">
      <i class="mdi mdi-menu text-lg" />
    </button>
    <strong class="ml-1">Pi Dash</strong>

    <div class="flex-1" />

    <span class="flex items-center gap-1 px-2" :class="temperatureClass">
      <i class="mdi mdi-thermometer" />
      {{ temperature }}
      <i class="mdi mdi-temperature-celsius" />
    </span>

    <template v-for="(action, index) in actions" :key="action.icon">
      <div v-if="index > 0" class="mx-1 h-4 w-px bg-line" />
      <button
        class="rounded-full p-1 hover:bg-surface-2"
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
