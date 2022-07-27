import Vue from "vue";
import Vuex from "vuex";
import { getField, updateField } from "vuex-map-fields";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    osk: false,
    input: "",
    connectionStatus: "disconnected",
    statusMessages: {
      connected: "Connected",
      disconnected: "Disconnected",
    },
  },
  getters: {
    getField,
  },
  mutations: {
    openKeyboard(state) {
      state.osk = true;
    },

    closeKeyboard(state) {
      state.osk = false;
    },

    updateInput(state, input) {
      state.input = input;
    },

    clearInput(state) {
      state.input = "";
    },

    updateConnectionStatus(state, status) {
      if (status) {
        state.connectionStatus = "connected";
      } else {
        state.connectionStatus = "disconnected";
      }
    },

    updateField,
  },
  actions: {},
  modules: {},
});
