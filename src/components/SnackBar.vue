<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="translate-y-full opacity-0"
    leave-active-class="transition duration-150 ease-in"
    leave-to-class="translate-y-full opacity-0"
  >
    <div
      v-if="ui.snackbar"
      class="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl px-4 py-2 text-sm shadow-lg"
      :class="toneClass"
      role="status"
    >
      <i :class="['mdi', toneIcon, 'text-base']" />
      <span>{{ ui.snackbarText }}</span>
      <button class="ml-2 font-medium uppercase" @click="ui.closeSnackbar()">
        Close
      </button>
    </div>
  </Transition>
</template>

<script setup>
import { computed, watch, onUnmounted } from "vue";
import { useUiStore } from "@/stores/ui";

const ui = useUiStore();

const TONES = {
  info: { class: "bg-sky-700 text-white", icon: "mdi-information-outline" },
  success: { class: "bg-emerald-700 text-white", icon: "mdi-check" },
  error: { class: "bg-red-700 text-white", icon: "mdi-alert" },
};

const tone = computed(() => TONES[ui.snackbarColor] || TONES.info);
const toneClass = computed(() => tone.value.class);
const toneIcon = computed(() => tone.value.icon);

// Vuetify closed the snackbar on its own timer; without it the message would
// sit there until someone tapped Close, which on a kiosk is never.
let timer = null;
watch(
  () => ui.snackbar,
  (open) => {
    clearTimeout(timer);
    if (open && ui.snackbarTimeout > 0) {
      timer = setTimeout(() => ui.closeSnackbar(), ui.snackbarTimeout);
    }
  }
);
onUnmounted(() => clearTimeout(timer));
</script>
