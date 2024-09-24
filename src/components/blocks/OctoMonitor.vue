<template>
  <v-card color="primary">
    <v-fade-transition>
      <div v-if="showInfo">
        <div class="float-info top-center caption">
          <div v-if="job">
            <div class="text-center">
              {{ job.state }} - {{ job.job.file.name }}
            </div>
            <div class="d-flex justify-center">
              <div class="mr-2">
                Progress:
                {{ job.progress.completion.toString().substring(0, 3) }}%
              </div>
              <div class="mr-1">
                Total: {{ convertSecondstoTime(job.progress.printTime) }}
              </div>
              <div>
                | Left: {{ convertSecondstoTime(job.progress.printTimeLeft) }}
              </div>
            </div>
          </div>

          <div v-else class="d-flex justify-center">Loading...</div>
        </div>

        <div class="float-info bottom-center caption">
          <div v-if="printer" class="d-flex justify-space-around">
            <div class="mr-2">
              <v-icon small>mdi-printer-3d-nozzle-heat</v-icon>
              {{ printer.temperature.tool0.actual }}°C /
              {{ printer.temperature.tool0.target }}°C
            </div>
            <div>
              <v-icon small>mdi-radiator</v-icon>
              {{ printer.temperature.bed.actual }}°C /
              {{ printer.temperature.bed.target }}°C
            </div>
          </div>

          <div v-else class="d-flex justify-center">Loading...</div>
        </div>
      </div>
    </v-fade-transition>
    <img
      src="http://octopi.local/webcam/?action=stream"
      alt="Camera Live Stream"
      width="100%"
      @click="showInfo = !showInfo"
    />
  </v-card>
</template>

<script>
import axios from "axios";

const timeout = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export default {
  components: {
    //
  },

  data() {
    return {
      showInfo: true,
      job: null,
      printer: null,
    };
  },

  mounted() {
    this.initialize();
  },

  methods: {
    async initialize() {
      await this.getOctoStatus();

      for (;;) {
        await this.getOctoStatus();
        await timeout(1000);
      }
    },

    async getOctoStatus() {
      // Get OctoPrint job status
      try {
        const result = await axios.get("http://octopi.local/api/job", {
          headers: {
            "X-Api-Key": "FCE8A025321B4373A2070D0F62746603",
          },
        });
        this.job = result.data;
        console.log("OCTO: ", this.job);
      } catch (e) {
        console.log(e);
      }

      // Get OctoPrint printer status
      try {
        const result = await axios.get("http://octopi.local/api/printer", {
          headers: {
            "X-Api-Key": "FCE8A025321B4373A2070D0F62746603",
          },
        });
        this.printer = result.data;
      } catch (e) {
        console.log(e);
      }
    },

    convertSecondstoTime(given_seconds) {
      const hours = Math.floor(given_seconds / 3600);
      const minutes = Math.floor((given_seconds - hours * 3600) / 60);
      const seconds = given_seconds - hours * 3600 - minutes * 60;

      const timeString =
        hours.toString().padStart(2, "0") +
        ":" +
        minutes.toString().padStart(2, "0") +
        ":" +
        seconds.toString().padStart(2, "0");

      return timeString;
    },
  },

  computed: {
    //
  },
};
</script>

<style scoped lang="scss">
.float-info {
  position: absolute;
  background-color: rgba(0, 0, 0, 0.2);
  color: white;
  padding: 0.5rem;
  border-radius: 5px;
  backdrop-filter: blur(2px);
  width: 96%;
}

.top-left {
  top: 0.5rem;
  left: 0.5rem;
}

.top-right {
  top: 0.5rem;
  right: 0.5rem;
}

.top-center {
  top: 0.5rem;
  left: 50%;
  transform: translate(-50%, 0);
}

.bottom-center {
  bottom: 0.8rem;
  left: 50%;
  transform: translate(-50%, 0);
}
</style>
