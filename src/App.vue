<template>
  <div class="flex h-full flex-col overflow-hidden text-ink">
    <AppBar />
    <NavigationDrawer />

    <main class="min-h-0 flex-1">
      <RouterView />
    </main>

    <!-- On-screen keyboard. Vuetify's fullscreen dialog is just a fixed
         overlay, so it is one here rather than a component. -->
    <Teleport to="body">
      <div
        v-if="ui.osk"
        class="fixed inset-0 z-50 flex flex-col items-center justify-start gap-2 bg-bg p-2"
      >
        <div class="flex w-full max-w-[850px] items-center gap-2">
          <input
            :value="ui.input"
            class="min-w-0 flex-1 rounded-lg bg-surface-2 px-3 py-2 text-ink outline-none placeholder:text-ink-faint"
            placeholder="Tap on the virtual keyboard to start"
            @input="ui.updateInput($event.target.value)"
          />
          <button
            class="rounded-full p-2 text-ink-dim hover:bg-surface-2"
            @click="ui.closeKeyboard()"
          >
            <i class="mdi mdi-close text-xl" />
          </button>
        </div>
        <SimpleKeyboard
          :input="ui.input"
          theme="hg-theme-default dark-theme"
          @onChange="ui.updateInput($event)"
        />
      </div>
    </Teleport>

    <SnackBar />

    <!-- Swallows the first tap after the screen is woken, so whatever is under
         the finger is not triggered by the tap that turned the screen on. -->
    <div
      v-if="ui.screenControlOverlay"
      class="fixed inset-0 z-40 bg-black/70"
      @click="turnOnPiScreen"
    />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from "vue";
import axios from "axios";

import AppBar from "@/components/AppBar.vue";
import NavigationDrawer from "@/components/NavigationDrawer.vue";
import SimpleKeyboard from "@/components/SimpleKeyboard.vue";
import SnackBar from "@/components/SnackBar.vue";
import { useUiStore } from "@/stores/ui";

// Home Assistant reports one of these when the printer is off or has nothing
// to do, so anything else means there is a job worth watching
const PRINTER_IDLE_STATES = ["idle", "offline", "unknown", "unavailable"];

// Checks in a row the PC has to miss before it counts as switched off
const PC_OFFLINE_AFTER_MISSES = 3;

const WATCH_INTERVAL_MS = 5000;

const ui = useUiStore();

let printerBusy = false;
let pcOnline = false;
let pcMisses = 0;
let timers = [];

// The printer block only polls while it is on screen, so the check that
// decides whether to show it has to live here, at the root
async function updatePrinterState() {
  let stage;
  try {
    const res = await axios.get(import.meta.env.VITE_API_URL + "/printer");
    stage = res.data.currentStage && res.data.currentStage.state;
  } catch (e) {
    console.log(e);
  }

  // Leave whatever is on screen alone when the printer can't be reached
  if (!stage) return;

  const busy = !PRINTER_IDLE_STATES.includes(stage.toLowerCase());

  // Only act on changes, so toggling the block by hand isn't undone by the
  // next poll five seconds later
  if (busy === printerBusy) return;

  printerBusy = busy;
  ui.setOctoMonitoring(busy);
}

// The same goes for the PC block, which can't notice the PC come up while it
// is off screen
async function updatePCState() {
  let online;
  try {
    // Libre Hardware Monitor only answers while the PC is running. A PC that
    // is switched off doesn't refuse the connection, it just never replies, so
    // give up before the next check is due
    await axios.get(import.meta.env.VITE_PC_HWINFO_API_URL, { timeout: 3000 });
    pcMisses = 0;
    online = true;
  } catch {
    pcMisses++;
    // Hand the slot back only once the PC has stayed quiet for a while, so one
    // slow reply doesn't flip it away and straight back
    if (pcMisses < PC_OFFLINE_AFTER_MISSES) return;
    online = false;
  }

  // Only act on changes, so toggling the block by hand sticks until the PC is
  // switched on or off
  if (online === pcOnline) return;

  pcOnline = online;
  ui.setPCMonitoring(online);
}

function turnOnPiScreen() {
  ui.closeScreenControlOverlay();
  axios.get(import.meta.env.VITE_API_URL + "/shell/display?action=on");
}

onMounted(() => {
  document.title = "Pi Dash";
  ui.syncMacModeFromLocalStorage();

  updatePrinterState();
  updatePCState();
  timers = [
    setInterval(updatePrinterState, WATCH_INTERVAL_MS),
    setInterval(updatePCState, WATCH_INTERVAL_MS),
  ];
});

onUnmounted(() => timers.forEach(clearInterval));
</script>
