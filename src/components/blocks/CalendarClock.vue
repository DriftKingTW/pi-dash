<template>
  <div class="panel flex min-h-0 gap-2 overflow-hidden px-3 py-2">
    <div class="flex min-w-0 flex-1 flex-col">
      <!-- Lock-screen layout: date above, hours and minutes large, seconds and
           AM/PM stacked small beside them so the big figures stay steady -->
      <div class="text-[13px] font-medium text-ink-dim">
        {{ `${now.dayName}, ${now.day} ${now.monthName}` }}
      </div>
      <div class="flex items-center gap-2">
        <span class="text-[46px] leading-none font-semibold tracking-tight tabular-nums">
          {{ `${now.hour}:${now.minute}` }}
        </span>
        <span class="flex flex-col text-xs leading-tight font-semibold tabular-nums">
          <span class="text-ink-dim">{{ now.second }}</span>
          <span class="text-ink-faint">{{ now.ampm }}</span>
        </span>
      </div>

      <WeatherWidget class="mt-2 min-h-0 flex-1 border-t border-line pt-2" />
    </div>

    <div class="shrink-0 calendar">
      <Calendar
        :attributes="attrs"
        :key="`${page.year}-${page.month}`"
        :initial-page="page"
        :first-day-of-week="1"
        trim-weeks
        color="blue"
        is-dark
        borderless
        transparent
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from "vue";
import axios from "axios";
import { Calendar } from "v-calendar";
import "v-calendar/style.css";

import WeatherWidget from "@/components/WeatherWidget.vue";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAYS = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

const now = reactive({
  year: "", month: 0, monthName: "", day: "", dayName: "",
  hour: "", minute: "", second: "", ampm: "",
});

const attrs = ref([
  { key: "today", highlight: true, dates: new Date() },
  { key: "weekend", dot: { style: { backgroundColor: "#ff453acc" } }, dates: [] },
  {
    key: "fanbox",
    dot: { style: { backgroundColor: "var(--color-accent)" } },
    dates: { on: [{ days: 1 }, { days: 15 }] },
    popover: { label: "Fanbox Update", visibility: "click" },
  },
]);

let timer = null;

function updateTime() {
  const date = new Date();
  now.year = date.getFullYear();
  now.month = date.getMonth();
  now.monthName = MONTHS[now.month];
  now.day = date.getDate();
  now.dayName = DAYS[date.getDay()];
  // Midnight and noon are 12, not 0, on a 12-hour clock.
  now.hour = String(date.getHours() % 12 || 12).padStart(2, "0");
  now.ampm = date.getHours() >= 12 ? "PM" : "AM";
  now.minute = String(date.getMinutes()).padStart(2, "0");
  now.second = String(date.getSeconds()).padStart(2, "0");

  // Move the highlight when the date rolls over, not on every tick.
  if (attrs.value[0].dates.getDate() !== date.getDate()) {
    attrs.value[0] = { ...attrs.value[0], dates: date };
  }
}

async function getTaiwanHoliday(year) {
  try {
    const url = `https://cdn.jsdelivr.net/gh/ruyut/TaiwanCalendar/data/${year}.json`;
    const res = await axios.get(url);
    const holidays = res.data
      .filter((d) => d.isHoliday)
      .map(
        (d) =>
          new Date(
            d.date.slice(0, 4) + "-" + d.date.slice(4, 6) + "-" + d.date.slice(6, 8)
          )
      );
    attrs.value[1] = {
      ...attrs.value[1],
      dates: [...attrs.value[1].dates, ...holidays],
    };
  } catch (e) {
    console.log(e);
  }
}

// The month the calendar shows. `initial-page` is read once, so the component
// is keyed on it: when the month rolls over the calendar remounts on the new
// one, which costs a remount every thirty-odd days. v-calendar counts months
// from 1.
const page = computed(() => ({ month: now.month + 1, year: now.year }));

// Run the first tick during setup, not on mount: an empty `now` renders the
// calendar at month 1 of year "", which it reads as January 1900.
updateTime();

onMounted(() => {
  timer = setInterval(updateTime, 1000);
  const year = new Date().getFullYear();
  [year - 1, year, year + 1].forEach(getTaiwanHoliday);
});

onUnmounted(() => clearInterval(timer));
</script>

<style scoped>
/* v-calendar ships its own surface colour; the block supplies the background. */
.calendar :deep(.vc-container) {
  background-color: transparent;
  border: none;
  font-family: inherit;
}

/* Restyled to match the glass panels: quieter header and weekday row, the
   theme's ink colours, and today in the accent instead of v-calendar blue. */
.calendar :deep(.vc-title) {
  background: transparent;
  color: var(--color-ink);
  font-size: 14px;
  font-weight: 600;
}

.calendar :deep(.vc-arrow) {
  background: transparent;
  color: var(--color-ink-faint);
}

.calendar :deep(.vc-weekday) {
  color: var(--color-ink-faint);
  font-size: 10px;
  font-weight: 600;
}

.calendar :deep(.vc-day-content) {
  color: var(--color-ink-dim);
  font-size: 12px;
  font-weight: 500;
}

.calendar :deep(.vc-highlight-bg-solid) {
  background-color: var(--color-accent);
}

.calendar :deep(.vc-highlight-content-solid) {
  color: var(--color-ink);
  font-weight: 700;
}

.calendar :deep(.vc-dot) {
  width: 4px;
  height: 4px;
}

/* v-calendar 3 lays days out at 32px, taller than v2 did. Six weeks of that
   plus the header is 270px against the ~258px the block has on the kiosk, so
   the last week was cut off. 28px fits a six-week month with room to spare;
   trim-weeks drops the empty sixth row in the months that don't need it. */
.calendar :deep(.vc-day) {
  min-height: 28px;
}
</style>
