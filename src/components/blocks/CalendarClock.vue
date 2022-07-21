<template>
  <v-card>
    <div class="d-flex ml-2">
      <v-card flat>
        <v-card-text class="pa-0">
          <Calendar :attributes="attrs" color="blue" is-dark height="100px" />
        </v-card-text>
      </v-card>
      <v-card flat class="flex-grow-1">
        <v-card-title v-if="now">
          <v-spacer></v-spacer>
          <div class="text-h4">
            {{ `${now.hour}:${now.minute}:${now.second}` }}
          </div>
          <small class="ml-2">{{ now.ampm }}</small>
        </v-card-title>
        <v-card-subtitle class="text-right" v-if="now">
          <span>
            {{ `${now.dayName} ${now.day} ${now.monthName} ${now.year}` }}
          </span>
        </v-card-subtitle>
      </v-card>
    </div>
  </v-card>
</template>

<script>
import Calendar from "v-calendar/lib/components/calendar.umd";

export default {
  components: {
    Calendar,
  },

  data() {
    return {
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
      ],
    };
  },

  mounted() {
    this.initialize();
  },

  methods: {
    initialize() {
      setInterval(() => {
        this.updateTime();
      }, 1000);
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
    },
  },

  computed: {
    //
  },
};
</script>

<style scoped>
.vc-is-dark {
  background-color: #1e1e1e;
  border-color: #1e1e1e;
}
</style>
