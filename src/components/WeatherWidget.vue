<template>
  <div class="flex flex-col justify-between text-ink">
    <div class="flex items-center gap-2">
      <div class="min-w-0 flex-1">
        <div class="text-2xl font-semibold tabular-nums leading-tight">
          {{ current.temperature.toFixed(1) }}°
        </div>
        <div class="truncate text-xs text-ink-dim">{{ current.description }}</div>
      </div>
      <img
        v-if="current.icon"
        class="-my-2 h-12 w-12 object-contain"
        :src="`https://openweathermap.org/img/wn/${current.icon}@2x.png`"
        alt=""
      />
    </div>

    <!-- Chance of rain for the next four hours -->
    <div class="grid grid-cols-4">
      <div
        v-for="(hourly, i) in hourlyWeather"
        :key="`hourly_${i}`"
        class="flex flex-col items-center"
      >
        <img
          v-if="hourly.icon"
          class="h-7 w-7 object-contain"
          :src="`https://openweathermap.org/img/wn/${hourly.icon}.png`"
          alt=""
        />
        <div v-else class="h-7 w-7" />
        <span class="text-[11px] tabular-nums text-ink-dim">
          {{ (hourly.pop * 100).toFixed(0) }}%
        </span>
      </div>
    </div>

    <!-- One row, one column per reading, icon over value: a 3+2 split never
         lines up, and a single grid does by construction. -->
    <div class="grid grid-cols-5 border-t border-line pt-1.5">
      <div
        v-for="stat in stats"
        :key="stat.icon"
        class="flex flex-col items-center text-[11px] leading-tight text-ink-dim"
      >
        <i :class="['mdi', stat.icon, 'text-sm text-ink-faint']" />
        <span class="tabular-nums whitespace-nowrap">{{ stat.value }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from "vue";
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

const stats = computed(() => [
  { icon: "mdi-human", value: `${current.feelsLike.toFixed(1)}°` },
  { icon: "mdi-water-percent", value: `${current.humidity}%` },
  { icon: "mdi-windsock", value: `${current.windSpeed.toFixed(0)} m/s` },
  { icon: "mdi-sun-wireless", value: `UV ${current.uvi.toFixed(0)}` },
  { icon: "mdi-eye", value: `${(current.visibility / 1000).toFixed(0)} km` },
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
