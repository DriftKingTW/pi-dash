<template>
  <div class="panel flex flex-col justify-center gap-4 overflow-hidden px-5">
    <div v-for="gauge in gauges" :key="gauge.icon">
      <div class="mb-1.5 flex items-center gap-2 text-xs">
        <i :class="['mdi', gauge.icon, 'text-base', gauge.textClass]" />
        <span class="min-w-0 flex-1 truncate text-ink-dim">{{ gauge.label }}</span>
        <template v-if="isConnected">
          <span v-if="gauge.temp" class="flex items-center tabular-nums text-ink-faint">
            <i class="mdi mdi-thermometer" />{{ gauge.temp }}°
          </span>
          <span class="w-10 text-right text-sm font-semibold tabular-nums">
            {{ Math.round(gauge.value) }}%
          </span>
        </template>
        <span v-else class="text-ink-faint">Offline</span>
      </div>
      <!-- Same track as the Claude windows, so the middle slot looks like one
           family whichever block holds it -->
      <div class="h-[14px] overflow-hidden rounded-full bg-surface-2">
        <div
          class="h-full rounded-full transition-[width] duration-300"
          :class="gauge.barClass"
          :style="{ width: barWidth(gauge.value) }"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from "vue";
import axios from "axios";
import Decimal from "decimal.js";

const POLL_MS = 500;

// Libre Hardware Monitor's ids for the readings shown here. Where a sensor
// sits in the tree isn't stable: a group can be missing on one launch and
// back on the next, moving every group after it, but these ids stay put
const SENSOR_IDS = {
  cpuTemp: "/intelcpu/0/temperature/14", // CPU Package
  cpuLoad: "/intelcpu/0/load/0", // CPU Total
  gpuTemp: "/gpu-nvidia/0/temperature/0", // GPU Core
  gpuLoad: "/gpu-nvidia/0/load/0", // GPU Core
  memoryLoad: "/ram/load/0",
  memoryUsed: "/ram/data/0",
  memoryAvailable: "/ram/data/1",
};

// Every sensor under a node, keyed by its id
const collectSensors = (node, sensors = {}) => {
  if (node.SensorId) sensors[node.SensorId] = node;
  (node.Children || []).forEach((child) => collectSensors(child, sensors));
  return sensors;
};

const isConnected = ref(false);
const cpu = reactive({ name: "CPU", temp: 0, load: 0 });
const gpu = reactive({ name: "GPU", temp: 0, load: 0 });
const memory = reactive({ used: 0, available: 0, load: 0, total: 0 });

let polling = true;

const gauges = computed(() => [
  {
    label: cpu.name,
    icon: "mdi-cpu-64-bit",
    value: cpu.load,
    temp: cpu.temp,
    textClass: "text-[#0a84ff]",
    barClass: "bg-linear-to-r from-[#0a84ff99] to-[#0a84ff]",
  },
  {
    label: gpu.name,
    icon: "mdi-expansion-card",
    value: gpu.load,
    temp: gpu.temp,
    textClass: "text-ok",
    barClass: "bg-linear-to-r from-ok/60 to-ok",
  },
  {
    label: isConnected.value
      ? `Used ${memory.used} | Free ${memory.available} | Total ${memory.total}`
      : "Memory",
    icon: "mdi-memory",
    value: memory.load,
    temp: null,
    textClass: "text-warn",
    barClass: "bg-linear-to-r from-warn/60 to-warn",
  },
]);

function barWidth(value) {
  if (!isConnected.value) return "0%";
  // A sliver even at idle, so an empty track still reads as a live gauge
  return Math.max(Number(value) || 0, 3) + "%";
}

async function getHwInfo() {
  try {
    const res = await axios.get(import.meta.env.VITE_PC_HWINFO_API_URL);

    const sensors = collectSensors(res.data);
    const reading = (id) => sensors[id].Value;
    // The hardware a sensor belongs to, for its name
    const hardwareOf = (id) =>
      res.data.Children[0].Children.find((hardware) =>
        Object.prototype.hasOwnProperty.call(collectSensors(hardware), id)
      );

    cpu.name = hardwareOf(SENSOR_IDS.cpuLoad).Text;
    cpu.temp = reading(SENSOR_IDS.cpuTemp);
    cpu.load = reading(SENSOR_IDS.cpuLoad);
    gpu.name = hardwareOf(SENSOR_IDS.gpuLoad).Text;
    gpu.temp = reading(SENSOR_IDS.gpuTemp);
    gpu.load = reading(SENSOR_IDS.gpuLoad);
    memory.used = reading(SENSOR_IDS.memoryUsed);
    memory.available = reading(SENSOR_IDS.memoryAvailable);
    memory.load = reading(SENSOR_IDS.memoryLoad);

    const used = new Decimal(memory.used.split(" GB")[0]);
    const available = new Decimal(memory.available.split(" GB")[0]);
    memory.total = used.plus(available).toFixed(1).toString() + "GB";

    isConnected.value = true;
  } catch (e) {
    console.log(e);
    isConnected.value = false;
  }
}

onMounted(async () => {
  while (polling) {
    await getHwInfo();
    await new Promise((resolve) => setTimeout(resolve, POLL_MS));
  }
});

// HomeView remounts this block on every monitoring toggle, so the loop has to
// stop with the instance or every toggle leaves another one polling
onUnmounted(() => {
  polling = false;
});
</script>
