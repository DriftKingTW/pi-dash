<template>
  <v-card color="primary">
    <v-card-text>
      <v-row>
        <v-col cols="12">
          <v-row>
            <v-col cols="12">
              <div class="mb-1">
                <v-icon left>mdi-cpu-64-bit</v-icon>
                <span class="text-overline">
                  {{ cpu.name }}
                </span>
              </div>
              <v-progress-linear height="25" color="blue" v-model="cpu.load">
                <template v-slot:default="{ value }">
                  <strong class="d-flex">
                    <span class="mr-2" v-if="isConnected">
                      <v-icon small left>mdi-cpu-64-bit</v-icon>
                      {{ value }}
                    </span>
                    <span class="ml-2" v-if="isConnected">
                      <v-icon small left>mdi-thermometer</v-icon>
                      {{ cpu.temp }}
                    </span>
                    <span v-if="!isConnected">
                      <span class="text-overline">Not Connected</span>
                    </span>
                  </strong>
                </template>
              </v-progress-linear>
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="12">
          <v-row>
            <v-col cols="12">
              <div class="mb-1">
                <v-icon left>mdi-expansion-card</v-icon>
                <span class="text-overline">
                  {{ gpu.name }}
                </span>
              </div>
              <v-progress-linear height="25" color="green" v-model="gpu.load">
                <template v-slot:default="{ value }">
                  <strong>
                    <span class="mr-2" v-if="isConnected">
                      <v-icon small left>mdi-expansion-card</v-icon>
                      {{ value }}
                    </span>
                    <span class="ml-2" v-if="isConnected">
                      <v-icon small left>mdi-thermometer</v-icon>
                      {{ gpu.temp }}
                    </span>
                    <span v-if="!isConnected">
                      <span class="text-overline">Not Connected</span>
                    </span>
                  </strong>
                </template>
              </v-progress-linear>
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="12">
          <v-row>
            <v-col cols="12">
              <div class="mb-1">
                <v-icon left>mdi-memory</v-icon>
                <span class="text-overline">
                  Used {{ memory.used }} | Free {{ memory.available }} | Total
                  {{ memory.total }}
                </span>
              </div>
              <v-progress-linear
                height="25"
                color="orange"
                v-model="memory.load"
              >
                <template v-slot:default="{ value }">
                  <strong>
                    <span v-if="isConnected">
                      <v-icon left>mdi-memory</v-icon>
                      {{ value }}
                    </span>
                    <span v-if="!isConnected">
                      <span class="text-overline">Not Connected</span>
                    </span>
                  </strong>
                </template>
              </v-progress-linear>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import axios from "axios";
import Decimal from "decimal.js";

const timeout = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

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

export default {
  components: {
    //
  },

  data() {
    return {
      isConnected: false,
      polling: false,
      cpu: {
        name: "-",
        temp: 0,
        load: 0,
      },
      gpu: {
        name: "-",
        temp: 0,
        load: 0,
      },
      memory: {
        used: 0,
        available: 0,
        load: 0,
        total: 0,
      },
    };
  },

  mounted() {
    this.initialize();
  },

  // HomeView remounts this block on every monitoring toggle, so the loop has
  // to stop with the instance or every toggle leaves another one polling
  beforeDestroy() {
    this.polling = false;
  },

  methods: {
    async initialize() {
      this.polling = true;

      while (this.polling) {
        await this.updateStatus();
        await timeout(500);
      }
    },

    async updateStatus() {
      await this.getHwInfo();
    },

    async getHwInfo() {
      try {
        const res = await axios.get(`${process.env.VUE_APP_PC_HWINFO_API_URL}`);

        const sensors = collectSensors(res.data);
        const reading = (id) => sensors[id].Value;
        // The hardware a sensor belongs to, for its name
        const hardwareOf = (id) =>
          res.data.Children[0].Children.find((hardware) =>
            Object.prototype.hasOwnProperty.call(collectSensors(hardware), id)
          );

        // CPU
        const cpuName = hardwareOf(SENSOR_IDS.cpuLoad).Text;
        const cpuTemp = reading(SENSOR_IDS.cpuTemp);
        const cpuLoad = reading(SENSOR_IDS.cpuLoad);
        // GPU
        const gpuName = hardwareOf(SENSOR_IDS.gpuLoad).Text;
        const gpuTemp = reading(SENSOR_IDS.gpuTemp);
        const gpuLoad = reading(SENSOR_IDS.gpuLoad);
        // Memory
        const memoryUsed = reading(SENSOR_IDS.memoryUsed);
        const memoryAvailable = reading(SENSOR_IDS.memoryAvailable);
        const memoryLoad = reading(SENSOR_IDS.memoryLoad);

        this.cpu.name = cpuName;
        this.cpu.temp = cpuTemp;
        this.cpu.load = cpuLoad;
        this.gpu.name = gpuName;
        this.gpu.temp = gpuTemp;
        this.gpu.load = gpuLoad;
        this.memory.used = memoryUsed;
        this.memory.available = memoryAvailable;
        this.memory.load = memoryLoad;
        const used = new Decimal(memoryUsed.split(" GB")[0]);
        const available = new Decimal(memoryAvailable.split(" GB")[0]);
        this.memory.total = used.plus(available).toFixed(1).toString() + "GB";

        this.isConnected = true;
      } catch (e) {
        console.log(e);
        this.isConnected = false;
      }
    },
  },

  computed: {
    //
  },
};
</script>
