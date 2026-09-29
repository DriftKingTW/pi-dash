<template>
  <!-- Three blocks across a 1480x320 panel. The middle slot is shared: a print
       or the PC coming up takes it over and hands it back afterwards. -->
  <!-- minmax(0,1fr) lets the row shrink instead of being pushed past the
       viewport by its content on short screens -->
  <div
    class="grid h-[min(290px,100%)] grid-cols-[33%_33%_auto] grid-rows-[minmax(0,1fr)] gap-2 p-2"
  >
    <CalendarClock class="min-h-0" />

    <component :is="middleBlock" :key="`middle-${ui.updateKey}`" class="min-h-0" />

    <div class="panel flex min-h-0 flex-col overflow-hidden">
      <!-- iOS segmented control. The selected pill is one element that slides
           (transform only, so it stays cheap on the Pi) rather than a
           background that jumps from segment to segment. -->
      <div class="glass-chip relative m-2 mb-0 flex shrink-0 p-[3px]">
        <div
          class="absolute inset-y-[3px] left-[3px] rounded-full bg-white/20 transition-transform duration-300 ease-out"
          :style="{
            width: `calc((100% - 6px) / ${tabItems.length})`,
            transform: `translateX(${tab * 100}%)`,
          }"
        />
        <button
          v-for="(item, index) in tabItems"
          :key="item.label"
          class="relative flex-1 rounded-full px-2 py-1 text-xs font-medium transition-colors duration-300"
          :class="tab === index ? 'text-ink' : 'text-ink-faint hover:text-ink-dim'"
          @click="tab = index"
        >
          <i :class="['mdi', item.icon, 'mr-1']" />
          {{ item.label }}
        </button>
      </div>
      <div class="relative min-h-0 flex-1 overflow-hidden">
        <!-- Slides in from the side of the segment that was tapped -->
        <Transition
          enter-active-class="transition duration-250 ease-out"
          leave-active-class="absolute inset-0 transition duration-200 ease-in"
          :enter-from-class="`opacity-0 ${tab === 0 ? '-translate-x-6' : 'translate-x-6'}`"
          :leave-to-class="`opacity-0 ${tab === 0 ? 'translate-x-6' : '-translate-x-6'}`"
        >
          <SocialStatistics v-if="tab === 0" class="h-full" />
          <CountdownTimer v-else class="h-full" />
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";

import CalendarClock from "@/components/blocks/CalendarClock.vue";
import ControlCenter from "@/components/blocks/ControlCenter.vue";
import CountdownTimer from "@/components/blocks/CountdownTimer.vue";
import OctoMonitor from "@/components/blocks/OctoMonitor.vue";
import PCMonitor from "@/components/blocks/PCMonitor.vue";
import SocialStatistics from "@/components/blocks/SocialStatistics.vue";
import { useUiStore } from "@/stores/ui";

const ui = useUiStore();

// Read before the first render, not in onMounted: restoring it afterwards
// would play the tab transition on every page load.
const tab = ref(readSavedTab());
const tabItems = [
  { label: "SNS Stats", icon: "mdi-chart-line" },
  { label: "Timer", icon: "mdi-timer" },
];

// A print outranks the PC: it is the one with a deadline.
const middleBlock = computed(() => {
  if (ui.showOctoMonitoring) return OctoMonitor;
  if (ui.showPCMonitoring) return PCMonitor;
  return ControlCenter;
});

function readSavedTab() {
  try {
    return Number(localStorage.getItem("tab")) || 0;
  } catch {
    return 0;
  }
}

watch(tab, (value) => localStorage.setItem("tab", String(value)));
</script>
