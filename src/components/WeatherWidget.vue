<template>
  <v-card flat color="primary">
    <div class="d-flex align-center">
      <div class="mt-2">
        <h2>{{ currentWeather.temperature.toFixed(1) }}°C</h2>
        <small>{{ currentWeather.description }}</small>
      </div>
      <v-spacer></v-spacer>
      <v-img
        v-if="currentWeather.icon"
        :src="`https://openweathermap.org/img/wn/${currentWeather.icon}@2x.png`"
        max-height="48px"
        max-width="48px"
        contain
      ></v-img>
    </div>

    <div class="d-flex align-center mt-2">
      <div
        class="flex-grow-1"
        v-for="(hourly, i) in hourlyWeather"
        :key="`hourly_key_${i}`"
      >
        <div class="d-flex flex-column align-center justify-center">
          <v-img
            v-if="hourly.icon"
            :src="`https://openweathermap.org/img/wn/${hourly.icon}.png`"
            max-height="24px"
            max-width="24px"
            contain
          ></v-img>
          <span>{{ hourly.pop.toFixed(1) * 100 }}%</span>
        </div>
      </div>
    </div>

    <v-divider class="my-2"></v-divider>

    <span class="d-flex">
      <div class="caption flex-grow-1 text-center">
        <v-icon small class="mr-1">mdi-sun-wireless</v-icon>
        {{ currentWeather.uvi.toFixed(0) }} UVI
      </div>
      <div class="caption flex-grow-1 text-center">
        <v-icon small>mdi-water-percent</v-icon>
        {{ currentWeather.humidity }} %
      </div>
      <div class="caption flex-grow-1 text-center">
        <v-icon small>mdi-windsock</v-icon>
        {{ currentWeather.windSpeed.toFixed(0) }} m/s
      </div>
    </span>

    <span class="d-flex">
      <div class="caption flex-grow-1 text-center">
        <v-icon small class="mr-1">mdi-human</v-icon>
        {{ currentWeather.feelsLike.toFixed(1) }}°C
      </div>
      <div class="caption flex-grow-1 text-center">
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
      city: process.env.VUE_APP_WEATHER_CITY,
      lat: process.env.VUE_APP_WEATHER_LAT,
      lon: process.env.VUE_APP_WEATHER_LON,
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
      hourlyWeather: [
        { pop: 0, icon: "" },
        { pop: 0, icon: "" },
        { pop: 0, icon: "" },
        { pop: 0, icon: "" },
      ],
    };
  },

  mounted() {
    this.initialize();
    setInterval(() => {
      this.initialize();
    }, 30 * 60 * 1000 /* 30 minutes */);
  },

  methods: {
    async initialize() {
      try {
        let url = this.city
          ? `${process.env.VUE_APP_API_URL}/weather?city=${this.city}`
          : `${process.env.VUE_APP_API_URL}/weather?lat=${this.lat}&lon=${this.lon}`;

        const res = await axios.get(url);

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
        for (let i = 0; i < this.hourlyWeather.length; i++) {
          this.hourlyWeather[i].pop = res.data.hourly[i].pop;
          this.hourlyWeather[i].icon = res.data.hourly[i].weather[0].icon;
        }
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
