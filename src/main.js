import { createApp } from "vue";
import { createPinia } from "pinia";
import axios from "axios";

import App from "./App.vue";
import router from "./router";
import "./assets/main.css";
import "@mdi/font/css/materialdesignicons.css";

// Without this an unreachable host hangs forever, and polling blocks pile up
// until they exhaust the browser's connection limit and the dashboard stalls
axios.defaults.timeout = 10000;

createApp(App).use(createPinia()).use(router).mount("#app");
