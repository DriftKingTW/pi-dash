<template>
  <v-card
    :color="percentage === 100 && !clearAlarm ? 'red darken-4' : 'primary'"
    flat
    :loading="loading"
  >
    <v-card-text>
      <v-row>
        <v-col cols="7" class="d-flex">
          <v-spacer></v-spacer>
          <v-progress-circular
            :rotate="-90"
            :size="190"
            :width="10"
            :value="percentage"
            :color="timerColor"
            :class="percentage === 100 && !clearAlarm ? 'shaking' : ''"
            @click="clearAlarm = true"
          >
            <div class="d-flex flex-column">
              <span class="text-h4">
                {{ timerString }}
              </span>
              <div class="d-flex justify-center align-center">
                <v-btn icon @click="timerStop">
                  <v-icon>mdi-stop</v-icon>
                </v-btn>
                <v-btn icon large @click="timerPlayPause">
                  <v-icon large v-if="isPlaying">mdi-pause</v-icon>
                  <v-icon large v-else>mdi-play</v-icon>
                </v-btn>
                <v-btn icon @click="timerReset">
                  <v-icon>mdi-reload</v-icon>
                </v-btn>
              </div>
            </div>
          </v-progress-circular>
          <v-spacer></v-spacer>
        </v-col>
        <v-col cols="5">
          <v-chip
            v-for="(t, i) in timerList"
            :key="`t_chip_${i}`"
            class="my-2 mx-1 pr-2"
            outlined
            @click="setTimer(t.m, t.s)"
          >
            <v-icon left small>mdi-alarm</v-icon>
            {{
              `${t.m.toString().padStart(2, "0")}:${t.s
                .toString()
                .padStart(2, "0")}`
            }}
          </v-chip>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapState } from "vuex";
import Timer from "easytimer.js";

export default {
  components: {
    //
  },

  data() {
    return {
      clearAlarm: false,
      timerLength: 0,
      timer: null,
      timerString: "",
      timerList: [
        { m: 3, s: 0 },
        { m: 5, s: 0 },
        { m: 10, s: 0 },
        { m: 15, s: 0 },
        { m: 20, s: 0 },
        { m: 25, s: 0 },
        { m: 30, s: 0 },
        { m: 45, s: 0 },
      ],
      isPlaying: true,
      percentage: 0,
      loading: true,
    };
  },

  mounted() {
    this.initialize();
  },

  methods: {
    async initialize() {
      this.loading = true;
      this.timer = new Timer();
      const _this = this;
      _this.timer.addEventListener("secondsUpdated", () => {
        const t = _this.timer.getTimeValues();
        _this.timerString = t.toString();
        _this.percentage =
          (1 -
            (t.seconds + t.minutes * 60 + t.hours * 3600 + t.days * 3600 * 24) /
              _this.timerLength) *
          100;
        _this.clearAlarm = false;
      });
      this.setTimer(0, 0);
      this.timer.stop();
      this.loading = false;
    },

    setTimer(m, s) {
      this.timer.stop();
      this.timerLength = m * 60 + s;
      this.timer.start({
        countdown: true,
        precision: "seconds",
        startValues: { seconds: this.timerLength },
      });
    },

    timerPlayPause() {
      if (this.isPlaying) {
        this.isPlaying = false;
        this.timer.pause();
      } else {
        this.isPlaying = true;
        this.timer.start();
      }
    },

    timerStop() {
      this.timer.stop();
      this.timer.reset();
      this.timer.pause();
      this.isPlaying = false;
    },

    timerReset() {
      this.timer.reset();
      this.isPlaying = true;
    },
  },

  computed: {
    ...mapState([""]),

    timerColor() {
      let color = "";
      if (this.percentage >= 80) color = "orange";
      if (this.percentage === 100) color = "red";
      return color;
    },
  },
};
</script>

<style scoped>
.shaking {
  animation: shake 0.5s;
  animation-iteration-count: 20;
}

@keyframes shake {
  0% {
    transform: translate(1px, 1px) rotate(0deg);
  }
  10% {
    transform: translate(-1px, -2px) rotate(-1deg);
  }
  20% {
    transform: translate(-3px, 0px) rotate(1deg);
  }
  30% {
    transform: translate(3px, 2px) rotate(0deg);
  }
  40% {
    transform: translate(1px, -1px) rotate(1deg);
  }
  50% {
    transform: translate(-1px, 2px) rotate(-1deg);
  }
  60% {
    transform: translate(-3px, 1px) rotate(0deg);
  }
  70% {
    transform: translate(3px, 1px) rotate(-1deg);
  }
  80% {
    transform: translate(-1px, -1px) rotate(1deg);
  }
  90% {
    transform: translate(1px, 2px) rotate(0deg);
  }
  100% {
    transform: translate(1px, -2px) rotate(-1deg);
  }
}
</style>
