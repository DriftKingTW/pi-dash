import Vue from "vue";
import Vuex from "vuex";
import { getField, updateField } from "vuex-map-fields";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    isMacMode: false,
    snackbar: false,
    snackbarText: "",
    snackbarColor: "info",
    timeout: 3000,
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
    syncMacModeFromLocalStorage(state) {
      if (localStorage.getItem("isMacMode") === "true") {
        state.isMacMode = true;
      } else {
        state.isMacMode = false;
      }
    },

    toggleMacMode(state) {
      state.isMacMode = !state.isMacMode;
      localStorage.setItem("isMacMode", state.isMacMode);
    },

    triggerSnackbar(state, { status, text }) {
      if (status) state.snackbarColor = status;
      if (text) state.snackbarText = text;
      state.snackbar = true;
    },

    closeSnackbar(state) {
      state.snackbar = false;
    },

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
