<template>
  <div class="panel flex min-h-0 flex-col overflow-hidden p-3">
    <div class="flex items-center gap-2">
      <i class="mdi mdi-package-variant-closed" />
      <span class="font-medium">Family Mart Package Tracking</span>
      <div class="flex-1" />
      <button
        class="rounded-full p-1 text-ink-dim hover:bg-surface-2 disabled:opacity-40"
        :disabled="loading"
        @click="refresh"
      >
        <i class="mdi" :class="loading ? 'mdi-loading mdi-spin' : 'mdi-refresh'" />
      </button>
    </div>
    <div class="text-xs text-ink-faint">Updated at {{ lastUpdate }}</div>

    <div class="mt-2 flex items-center gap-2">
      <input
        v-model="trackingId"
        class="min-w-0 flex-1 rounded-lg bg-surface-2 px-3 py-1.5 text-sm outline-none placeholder:text-ink-faint"
        placeholder="Tracking ID"
        @click="handleInput"
        @keyup.enter="addPackage"
      />
      <button class="rounded-full p-1 hover:bg-surface-2" @click="addPackage">
        <i class="mdi mdi-plus" />
      </button>
    </div>

    <div class="mt-2 min-h-0 flex-1 overflow-y-auto">
      <div
        v-for="(d, i) in data"
        :key="i"
        class="mb-2 flex items-center gap-1 rounded bg-surface-2 px-2 py-1 text-xs"
        :class="d.status && d.status.includes('完成取件') ? 'text-ink-faint' : ''"
      >
        <i class="mdi" :class="d.orderId ? 'mdi-truck-cargo-container' : 'mdi-emoticon-sad'" />
        <span class="min-w-0 flex-1 truncate">
          <template v-if="d.orderId">
            {{ d.orderId }} {{ d.status }} {{ d.receiveDate }}
          </template>
          <template v-else>No Data</template>
        </span>
        <button class="rounded-full p-0.5 hover:bg-white/10" @click="removePackage(i)">
          <i class="mdi mdi-close" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import axios from "axios";

import { useUiStore } from "@/stores/ui";

const REFRESH_MS = 1000 * 60 * 30;

const ui = useUiStore();
const loading = ref(true);
const trackingId = ref("");
const packages = ref([]);
const data = ref([]);
const lastUpdate = ref(new Date().toLocaleString());

let timer = null;

function loadPackages() {
  const saved = localStorage.getItem("familyMartPackages");
  return saved === null ? [] : JSON.parse(saved);
}

function savePackages() {
  localStorage.setItem("familyMartPackages", JSON.stringify(packages.value));
}

async function refresh() {
  loading.value = true;
  data.value = [];
  packages.value = loadPackages();

  for (const pkg of packages.value) {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/package/familymart`,
        { trackingId: pkg }
      );
      if (res.data.statusCode === "999") {
        res.data.latestStatus.status = "查無訂單資料";
      }
      data.value = [...data.value, { ...res.data.latestStatus }];
    } catch (e) {
      console.log(e);
    }
  }

  lastUpdate.value = new Date().toLocaleString();
  loading.value = false;
}

function addPackage() {
  if (!trackingId.value) return;
  packages.value = [trackingId.value, ...packages.value];
  trackingId.value = "";
  savePackages();
  refresh();
}

function removePackage(index) {
  packages.value.splice(index, 1);
  savePackages();
  refresh();
}

// The on-screen keyboard writes into the shared input; when it has nothing,
// fall back to whatever was last copied.
async function handleInput() {
  if (ui.input.length > 0) {
    trackingId.value = ui.input;
    ui.clearInput();
  } else {
    try {
      trackingId.value = await navigator.clipboard.readText();
    } catch (e) {
      console.log(e);
    }
  }
}

onMounted(() => {
  refresh();
  timer = setInterval(refresh, REFRESH_MS);
});
onUnmounted(() => clearInterval(timer));
</script>
