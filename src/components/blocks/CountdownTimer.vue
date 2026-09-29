<template>
  <div
    class="flex h-full items-center gap-2 rounded-b-xl px-3 transition-colors"
    :class="alarming ? 'bg-red-950' : ''"
  >
    <div class="flex flex-1 justify-center">
      <div
        class="relative"
        :class="alarming ? 'animate-[timer-shake_0.5s_ease-in-out_20]' : ''"
        :style="{ width: SIZE + 'px', height: SIZE + 'px' }"
        @click="clearAlarm = true"
      >
        <!-- Rotated so the ring starts at twelve o'clock -->
        <svg class="-rotate-90" :width="SIZE" :height="SIZE" :viewBox="`0 0 ${SIZE} ${SIZE}`">
          <circle
            :cx="SIZE / 2" :cy="SIZE / 2" :r="RADIUS"
            fill="none" stroke="currentColor" class="text-white/10" :stroke-width="WIDTH"
          />
          <circle
            :cx="SIZE / 2" :cy="SIZE / 2" :r="RADIUS"
            fill="none" stroke="currentColor" :stroke-width="WIDTH" stroke-linecap="round"
            :class="ringClass"
            :stroke-dasharray="CIRCUMFERENCE"
            :stroke-dashoffset="CIRCUMFERENCE * (1 - percentage / 100)"
          />
        </svg>

        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <span class="text-2xl font-medium tabular-nums">{{ timerString }}</span>
          <div class="flex items-center gap-1">
            <button class="rounded-full p-1 hover:bg-white/10" @click.stop="timerStop">
              <i class="mdi mdi-stop" />
            </button>
            <button class="rounded-full p-1 text-xl hover:bg-white/10" @click.stop="timerPlayPause">
              <i :class="['mdi', isPlaying ? 'mdi-pause' : 'mdi-play']" />
            </button>
            <button class="rounded-full p-1 hover:bg-white/10" @click.stop="timerReset">
              <i class="mdi mdi-reload" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="flex w-[38%] flex-wrap content-center gap-1">
      <button
        v-for="t in timerList"
        :key="`${t.m}_${t.s}`"
        class="flex items-center gap-1 glass-chip px-2 py-1 text-xs hover:bg-white/20"
        @click="setTimer(t.m, t.s)"
      >
        <i class="mdi mdi-alarm" />
        {{ `${String(t.m).padStart(2, "0")}:${String(t.s).padStart(2, "0")}` }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
// Named, not default: under Vite the default export is a module namespace,
// and `new` on it throws before the timer is ever set up.
import { Timer } from "easytimer.js";

const SIZE = 180;
const WIDTH = 10;
const RADIUS = (SIZE - WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const timerList = [
  { m: 3, s: 0 }, { m: 5, s: 0 }, { m: 10, s: 0 }, { m: 15, s: 0 },
  { m: 20, s: 0 }, { m: 25, s: 0 }, { m: 30, s: 0 }, { m: 45, s: 0 },
];

const clearAlarm = ref(false);
// Shown before any preset is picked. easytimer only reports on a tick, and a
// timer that has never started never ticks, so without this the ring is empty.
const timerString = ref("00:00:00");
const isPlaying = ref(true);
const percentage = ref(0);

let timer = null;
let timerLength = 0;

const alarming = computed(() => percentage.value === 100 && !clearAlarm.value);

const ringClass = computed(() => {
  if (percentage.value === 100) return "text-crit";
  if (percentage.value >= 80) return "text-warn";
  return "text-ink";
});

function setTimer(m, s) {
  timer.stop();
  timerLength = m * 60 + s;
  timer.start({
    countdown: true,
    precision: "seconds",
    startValues: { seconds: timerLength },
  });
  isPlaying.value = true;
}

function timerPlayPause() {
  isPlaying.value = !isPlaying.value;
  if (isPlaying.value) timer.start();
  else timer.pause();
}

function timerStop() {
  timer.stop();
  timer.reset();
  timer.pause();
  isPlaying.value = false;
}

function timerReset() {
  timer.reset();
  isPlaying.value = true;
}

onMounted(() => {
  timer = new Timer();
  timer.addEventListener("secondsUpdated", () => {
    const t = timer.getTimeValues();
    timerString.value = t.toString();
    const left = t.seconds + t.minutes * 60 + t.hours * 3600 + t.days * 86400;
    percentage.value = timerLength ? (1 - left / timerLength) * 100 : 0;
    clearAlarm.value = false;
  });
  setTimer(0, 0);
  timer.stop();
  isPlaying.value = false;
});

// easytimer keeps its own interval, which outlives the component otherwise.
onUnmounted(() => timer?.stop());
</script>

<style>
@keyframes timer-shake {
  0%, 100% { transform: translate(1px, 1px) rotate(0deg); }
  20% { transform: translate(-3px, 0) rotate(1deg); }
  40% { transform: translate(1px, -1px) rotate(1deg); }
  60% { transform: translate(-3px, 1px) rotate(0deg); }
  80% { transform: translate(-1px, -1px) rotate(1deg); }
}
</style>
