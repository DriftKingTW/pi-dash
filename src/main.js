import Vue from 'vue'
import axios from 'axios'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'

Vue.config.productionTip = false

// Without this an unreachable host hangs forever, and polling blocks pile up
// until they exhaust the browser's connection limit and the dashboard stalls
axios.defaults.timeout = 10000

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
