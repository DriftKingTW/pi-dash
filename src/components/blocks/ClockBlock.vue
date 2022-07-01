<template>
  <v-card>
    <v-card-title v-if="now">
      <v-spacer></v-spacer>
      <h1>{{ `${now.hour}:${now.minute}:${now.second}` }}</h1>
      <small class="ml-2">{{ now.ampm }}</small>
    </v-card-title>
    <v-card-subtitle class="text-right" v-if="now">
      <span>
        {{ `${now.dayName} ${now.day} ${now.monthName} ${now.year}` }}
      </span>
    </v-card-subtitle>
    <v-card-text> </v-card-text>
  </v-card>
</template>

<script>
export default {
  components: {
    //
  },

  data() {
    return {
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
