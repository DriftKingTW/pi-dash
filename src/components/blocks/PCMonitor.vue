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

export default {
  components: {
    //
  },

  data() {
    return {
      isConnected: false,
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

  methods: {
    async initialize() {
      this.getHwInfo();

      for (;;) {
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

        //   const computerName = res.data.Children[0].Text;
        // CPU
        const cpuData = res.data.Children[0].Children[1];
        const cpuName = cpuData.Text;
        const cpuTemp = cpuData.Children[3].Children.find(
          (item) => item.Text === "CPU Package"
        ).Value;
        const cpuLoad = cpuData.Children[4].Children.find(
          (item) => item.Text === "CPU Total"
        ).Value;
        // GPU
        const gpuData = res.data.Children[0].Children[3];
        const gpuName = gpuData.Text;
        const gpuTemp = gpuData.Children[2].Children.find(
          (item) => item.Text === "GPU Core"
        ).Value;
        const gpuLoad = gpuData.Children[3].Children.find(
          (item) => item.Text === "GPU Core"
        ).Value;
        // Memory
        const memoryData = res.data.Children[0].Children[2];
        const memoryUsed = memoryData.Children[1].Children.find(
          (item) => item.Text === "Memory Used"
        ).Value;
        const memoryAvailable = memoryData.Children[1].Children.find(
          (item) => item.Text === "Memory Available"
        ).Value;
        const memoryLoad = memoryData.Children[0].Children[0].Value;

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
