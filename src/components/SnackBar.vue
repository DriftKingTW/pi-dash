<template>
  <!-- The one place with real backdrop blur. The panels can't afford it (the
       Pi drops to ~18fps with animation under glass), but a toast is small
       and gone in seconds, and without blur it is either opaque or unreadable. -->
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="translate-y-full opacity-0"
    leave-active-class="transition duration-150 ease-in"
    leave-to-class="translate-y-full opacity-0"
  >
    <div
      v-if="ui.snackbar"
      class="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 max-w-[60%] rounded-2xl border border-white/15 bg-[#1e1e28]/55 py-2 pr-2 pl-4 text-sm text-ink shadow-[inset_0_1px_0_#ffffff26,0_8px_24px_#00000080] backdrop-blur-xl backdrop-saturate-150"
      role="status"
    >
      <i :class="['mdi', toneIcon, toneClass, 'text-lg']" />
      <span class="line-clamp-2">{{ ui.snackbarText }}</span>
      <button
        class="ml-1 grid h-7 w-7 place-items-center rounded-full text-ink-dim hover:bg-white/10"
        aria-label="Close"
        @click="ui.closeSnackbar()"
      >
        <i class="mdi mdi-close" />
      </button>
    </div>
  </Transition>
</template>

<script setup>
import { computed, watch, onUnmounted } from "vue";
import { useUiStore } from "@/stores/ui";

const ui = useUiStore();

const TONES = {
  // Glass pill for every tone, iOS style; only the icon carries the colour
  info: { class: "text-sky-400", icon: "mdi-information-outline" },
  success: { class: "text-ok", icon: "mdi-check-circle" },
  error: { class: "text-crit", icon: "mdi-alert-circle" },
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
