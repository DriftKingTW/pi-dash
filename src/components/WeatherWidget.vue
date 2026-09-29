<template>
  <div class="flex flex-col text-ink">
    <div class="flex items-center">
      <div>
        <h2 class="text-xl font-medium">{{ current.temperature.toFixed(1) }}°C</h2>
        <small class="text-ink-faint">{{ current.description }}</small>
      </div>
      <div class="flex-1" />
      <img
        v-if="current.icon"
        class="h-12 w-12 object-contain"
        :src="`https://openweathermap.org/img/wn/${current.icon}@2x.png`"
        alt=""
      />
    </div>

    <div class="mt-1 flex items-center">
      <div
        v-for="(hourly, i) in hourlyWeather"
        :key="`hourly_${i}`"
        class="flex flex-1 flex-col items-center justify-center"
      >
        <img
          v-if="hourly.icon"
          class="h-6 w-6 object-contain"
          :src="`https://openweathermap.org/img/wn/${hourly.icon}.png`"
          alt=""
        />
        <span class="text-xs">{{ (hourly.pop * 100).toFixed(0) }}%</span>
      </div>
    </div>

    <div class="my-2 h-px bg-line" />

    <div class="flex text-xs text-ink-dim">
      <div class="flex-1 text-center">
        <i class="mdi mdi-sun-wireless mr-1" />{{ current.uvi.toFixed(0) }} UVI
      </div>
      <div class="flex-1 text-center">
        <i class="mdi mdi-water-percent mr-1" />{{ current.humidity }} %
      </div>
      <div class="flex-1 text-center">
        <i class="mdi mdi-windsock mr-1" />{{ current.windSpeed.toFixed(0) }} m/s
      </div>
    </div>

    <div class="flex text-xs text-ink-dim">
      <div class="flex-1 text-center">
        <i class="mdi mdi-human mr-1" />{{ current.feelsLike.toFixed(1) }}°C
      </div>
      <div class="flex-1 text-center">
        <i class="mdi mdi-eye mr-1" />{{ current.visibility }} m
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, reactive, ref } from "vue";
import axios from "axios";

const REFRESH_MS = 30 * 60 * 1000;

const current = reactive({
  description: "", icon: "", temperature: 0, uvi: 0,
  humidity: 0, windSpeed: 0, feelsLike: 0, visibility: 0,
});

const hourlyWeather = ref([
  { pop: 0, icon: "" }, { pop: 0, icon: "" },
  { pop: 0, icon: "" }, { pop: 0, icon: "" },
]);

let timer = null;

function titleCase(str) {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

async function load() {
  try {
    const city = import.meta.env.VITE_WEATHER_CITY;
    const url = city
      ? `${import.meta.env.VITE_API_URL}/weather?city=${city}`
      : `${import.meta.env.VITE_API_URL}/weather?lat=${import.meta.env.VITE_WEATHER_LAT}&lon=${import.meta.env.VITE_WEATHER_LON}`;

    const { data } = await axios.get(url);

    current.description = titleCase(data.current.weather[0].description);
    current.icon = data.current.weather[0].icon;
    current.uvi = data.current.uvi;
    current.humidity = data.current.humidity;
    current.temperature = data.current.temp;
    current.windSpeed = data.current.wind_speed;
    current.feelsLike = data.current.feels_like;
    current.visibility = data.current.visibility;

    hourlyWeather.value = hourlyWeather.value.map((_, i) => ({
      pop: data.hourly[i].pop,
      icon: data.hourly[i].weather[0].icon,
    }));
  } catch (e) {
    console.error(e);
  }
}

onMounted(() => {
  load();
  timer = setInterval(load, REFRESH_MS);
});
onUnmounted(() => clearInterval(timer));
</script>
