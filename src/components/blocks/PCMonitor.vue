<template>
  <div class="panel flex flex-col justify-center gap-3 overflow-hidden px-3">
    <div v-for="gauge in gauges" :key="gauge.label">
      <div class="mb-1 flex items-center gap-1 text-[11px] uppercase tracking-wide text-ink-dim">
        <i :class="['mdi', gauge.icon]" />
        <span class="truncate">{{ gauge.label }}</span>
      </div>
      <div class="h-[25px] overflow-hidden rounded bg-surface-2">
        <div
          class="flex h-full items-center rounded px-2 transition-[width] duration-300"
          :class="gauge.barClass"
          :style="{ width: barWidth(gauge.value) }"
        >
          <strong v-if="isConnected" class="flex items-center gap-3 whitespace-nowrap text-xs">
            <span class="flex items-center gap-1">
              <i :class="['mdi', gauge.icon]" />{{ Math.round(gauge.value) }}
            </span>
            <span v-if="gauge.temp" class="flex items-center gap-1">
              <i class="mdi mdi-thermometer" />{{ gauge.temp }}
            </span>
          </strong>
          <span v-else class="text-[11px] uppercase tracking-wide">Not Connected</span>
        </div>
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
const cpu = reactive({ name: "-", temp: 0, load: 0 });
const gpu = reactive({ name: "-", temp: 0, load: 0 });
const memory = reactive({ used: 0, available: 0, load: 0, total: 0 });

let polling = true;

const gauges = computed(() => [
  { label: cpu.name, icon: "mdi-cpu-64-bit", value: cpu.load, temp: cpu.temp, barClass: "bg-blue-600" },
  { label: gpu.name, icon: "mdi-expansion-card", value: gpu.load, temp: gpu.temp, barClass: "bg-emerald-600" },
  {
    label: `Used ${memory.used} | Free ${memory.available} | Total ${memory.total}`,
    icon: "mdi-memory",
    value: memory.load,
    temp: null,
    barClass: "bg-orange-600",
  },
]);

// A disconnected gauge still has to be wide enough to read its own label.
function barWidth(value) {
  if (!isConnected.value) return "100%";
  return Math.max(Number(value) || 0, 18) + "%";
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
