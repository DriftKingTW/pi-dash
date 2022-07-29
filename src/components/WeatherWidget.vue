<template>
  <v-card flat color="primary">
    <div class="d-flex align-center">
      <div>
        <h2>{{ currentWeather.temperature.toFixed(1) }}°C</h2>
        <small>{{ currentWeather.description }}</small>
      </div>
      <v-spacer></v-spacer>
      <v-img
        :src="`https://openweathermap.org/img/wn/${currentWeather.icon}@2x.png`"
        max-height="70px"
        max-width="70px"
        contain
      ></v-img>
    </div>
    <v-divider class="mb-2"></v-divider>
    <span class="d-flex">
      <div class="caption flex-grow-1">
        <v-icon small class="mr-1">mdi-sun-wireless</v-icon>
        {{ currentWeather.uvi.toFixed(0) }} UVI
      </div>
      <div class="caption flex-grow-1">
        <v-icon small>mdi-water-percent</v-icon>
        {{ currentWeather.humidity }} %
      </div>
      <div class="caption flex-grow-1">
        <v-icon small>mdi-windsock</v-icon>
        {{ currentWeather.windSpeed.toFixed(0) }} m/s
      </div>
    </span>
    <span class="d-flex">
      <div class="caption flex-grow-1">
        <v-icon small class="mr-1">mdi-human</v-icon>
        {{ currentWeather.feelsLike.toFixed(1) }}°C
      </div>
      <div class="caption flex-grow-1">
        <v-icon small class="mr-1">mdi-eye</v-icon>
        {{ currentWeather.visibility }} m
      </div>
    </span>
  </v-card>
</template>

<script>
import axios from "axios";

export default {
  components: {
    //
  },

  data() {
    return {
      city: "taipei",
      currentWeather: {
        description: "",
        icon: "",
        temperature: 0,
        uvi: 0,
        humidity: 0,
        windSpeed: 0,
        feelsLike: 0,
        visibility: 0,
      },
      hourlyWeather: {},
    };
  },

  mounted() {
    this.initialize();
  },

  methods: {
    async initialize() {
      try {
        const res = await axios.get(
          `${process.env.VUE_APP_API_URL}/weather?city=${this.city}`
        );
        console.log(res.data);
        this.currentWeather.description = this.titleCase(
          res.data.current.weather[0].description
        );
        this.currentWeather.icon = res.data.current.weather[0].icon;
        this.currentWeather.uvi = res.data.current.uvi;
        this.currentWeather.humidity = res.data.current.humidity;
        this.currentWeather.temperature = res.data.current.temp;
        this.currentWeather.windSpeed = res.data.current.wind_speed;
        this.currentWeather.feelsLike = res.data.current.feels_like;
        this.currentWeather.visibility = res.data.current.visibility;
      } catch (e) {
        console.error(e);
      }
    },

    titleCase(str) {
      str = str.toLowerCase().split(" ");
      for (var i = 0; i < str.length; i++) {
        str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
      }
      return str.join(" ");
    },
  },

  computed: {
    //
  },
};
</script>
