<template>
  <v-card color="primary">
    <div class="d-flex ml-2">
      <v-card color="primary" flat class="flex-grow-1">
        <v-card-title v-if="now">
          <div class="text-h4">
            {{ `${now.hour}:${now.minute}:${now.second}` }}
          </div>
          <small class="ml-2">{{ now.ampm }}</small>
        </v-card-title>
        <v-card-subtitle v-if="now" class="pb-2">
          <span>
            {{ `${now.dayName} ${now.day} ${now.monthName} ${now.year}` }}
          </span>
        </v-card-subtitle>
        <v-card-text>
          <v-divider class="mb-2"></v-divider>
          <WeatherWidget />
        </v-card-text>
      </v-card>
      <v-card color="primary" flat>
        <v-card-text class="pa-0 calendar">
          <Calendar :attributes="attrs" color="blue" is-dark height="100px" />
        </v-card-text>
      </v-card>
    </div>
  </v-card>
</template>

<script>
import Calendar from "v-calendar/lib/components/calendar.umd";
import WeatherWidget from "@/components/WeatherWidget";
import axios from "axios";

export default {
  components: {
    Calendar,
    WeatherWidget,
  },

  data() {
    return {
      timer: null,
      date: null,
      now: {
        year: "",
        month: "",
        monthName: "",
        day: "",
        dayName: "",
        hour: "",
        minute: "",
        second: "",
        ampm: "",
      },
      attrs: [
        {
          key: "today",
          highlight: true,
          dates: new Date(),
        },
        {
          key: "weekend",
          dot: {
            style: {
              backgroundColor: "brown",
            },
          },
          dates: [],
        },
        {
          key: "fanbox",
          dot: "orange",
          dates: {
            on: [{ days: 1 }, { days: 15 }],
          },
          popover: {
            label: "Fanbox Update",
            visibility: "click",
          },
        },
      ],
    };
  },

  mounted() {
    this.initialize();
  },

  methods: {
    initialize() {
      this.timer = setInterval(() => {
        this.updateTime();
      }, 1000);
      this.getTaiwanHoliday();
    },

    async getTaiwanHoliday() {
      const year = new Date().getFullYear();
      const url = `https://cdn.jsdelivr.net/gh/ruyut/TaiwanCalendar/data/${year}.json`;
      const res = await axios.get(url);
      const holidays = res.data
        .filter((d) => d.isHoliday)
        .map(
          (d) =>
            new Date(
              d.date.slice(0, 4) +
                "-" +
                d.date.slice(4, 6) +
                "-" +
                d.date.slice(6, 8)
            )
        );
      this.attrs[1].dates = [...holidays];
    },

    updateTime() {
      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const date = new Date();
      this.date = date;
      this.now.year = date.getFullYear();
      this.now.month = date.getMonth();
      this.now.monthName = months[this.now.month];
      this.now.day = date.getDate();
      this.now.dayName = days[date.getDay()].padStart(2, "0");
      this.now.hour =
        date.getHours() > 12
          ? date.getHours() - 12
          : String(date.getHours()).padStart(2, "0");
      this.now.ampm = date.getHours() > 12 ? "PM" : "AM";
      this.now.minute = String(date.getMinutes()).padStart(2, "0");
      this.now.second = String(date.getSeconds()).padStart(2, "0");
      if (this.attrs[0].dates.getDate() !== this.date.getDate()) {
        this.attrs[0].dates = this.date;
      }
    },
  },

  computed: {
    //
  },

  beforeDestroy() {
    clearInterval(this.timer);
  },
};
</script>

<style scoped>
.calendar >>> .vc-container.vc-is-dark {
  background-color: var(--v-primary-base) !important;
  border: none;
}
</style>
