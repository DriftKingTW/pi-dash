<template>
  <v-card color="primary">
    <v-card-text>
      <v-row>
        <v-col cols="12">
          <v-row>
            <v-col cols="8">
              <div class="mb-1">
                <v-icon left>mdi-cpu-64-bit</v-icon>
                <span class="text-overline">
                  {{ cpu.name }}: {{ cpu.load }}
                </span>
              </div>
              <v-progress-linear
                height="25"
                color="blue"
                v-model="cpu.load"
              ></v-progress-linear>
            </v-col>
            <v-col cols="4" class="mt-2 d-flex justify-center align-center">
              <span class="text-h3 blue--text">
                {{ cpu.temp }}
              </span>
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="12">
          <v-row>
            <v-col cols="8">
              <div class="mb-1">
                <v-icon left>mdi-expansion-card</v-icon>
                <span class="text-overline">
                  {{ gpu.name }} : {{ gpu.load }}
                </span>
              </div>
              <v-progress-linear
                height="25"
                color="green"
                v-model="gpu.load"
              ></v-progress-linear>
            </v-col>
            <v-col cols="4" class="mt-2 d-flex justify-center align-center">
              <span class="text-h3 green--text">
                {{ gpu.temp }}
              </span>
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="12">
          <v-row>
            <v-col cols="8">
              <div class="mb-1">
                <v-icon left>mdi-memory</v-icon>
                <span class="text-overline">
                  Used {{ memory.used }} | Free {{ memory.available }} | Total
                  {{
                    Number(memory.used.split(" GB")[0]) +
                    Number(memory.available.split(" GB")[0])
                  }}
                  GB
                </span>
              </div>
              <v-progress-linear
                height="25"
                color="orange"
                v-model="memory.load"
              ></v-progress-linear>
            </v-col>
            <v-col cols="4" class="mt-2 d-flex justify-center align-center">
              <span class="text-h3 orange--text">
                {{ memory.load }}
              </span>
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

export default {
  components: {
    //
  },

  data() {
    return {
      cpu: {
        name: "-",
        temp: "-",
        load: "-",
      },
      gpu: {
        name: "-",
        temp: "-",
        load: "-",
      },
      memory: {
        used: "-",
        available: "-",
        load: "-",
        total: "-",
      },
    };
  },

  mounted() {
    this.initialize();
  },

  methods: {
    initialize() {
      this.getHwInfo();

      setInterval(() => {
        this.updateStatus();
      }, 1000);
    },

    async updateStatus() {
      await this.getHwInfo();
    },

    async getHwInfo() {
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
      this.memory.total = used.plus(available).toString() + "GB";
    },
  },

  computed: {
    //
  },
};
</script>
