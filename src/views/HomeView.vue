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

    <div class="flex min-h-0 flex-col">
      <div class="flex shrink-0 rounded-t-xl bg-surface">
        <button
          v-for="(item, index) in tabItems"
          :key="item.label"
          class="flex-1 border-b-2 px-2 py-2 text-xs font-medium uppercase tracking-wide transition-colors"
          :class="
            tab === index
              ? 'border-ink text-ink'
              : 'border-transparent text-ink-faint hover:text-ink-dim'
          "
          @click="tab = index"
        >
          <i :class="['mdi', item.icon, 'mr-1']" />
          {{ item.label }}
        </button>
      </div>
      <div class="min-h-0 flex-1 rounded-b-xl bg-surface">
        <SocialStatistics v-if="tab === 0" />
        <CountdownTimer v-else />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";

import CalendarClock from "@/components/blocks/CalendarClock.vue";
import ControlCenter from "@/components/blocks/ControlCenter.vue";
import CountdownTimer from "@/components/blocks/CountdownTimer.vue";
import OctoMonitor from "@/components/blocks/OctoMonitor.vue";
import PCMonitor from "@/components/blocks/PCMonitor.vue";
import SocialStatistics from "@/components/blocks/SocialStatistics.vue";
import { useUiStore } from "@/stores/ui";

const ui = useUiStore();

const tab = ref(0);
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

onMounted(() => {
  const saved = localStorage.getItem("tab");
  if (saved !== null) tab.value = Number(saved);
});

watch(tab, (value) => localStorage.setItem("tab", String(value)));
</script>
