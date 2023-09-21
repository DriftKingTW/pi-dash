import Vue from "vue";
import Vuex from "vuex";
import { getField, updateField } from "vuex-map-fields";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    navDrawer: false,
    isExpand: false,
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
    showPCMonitoring: false,
    updateKey: 0,
    screenControlOverlay: false,
  },
  getters: {
    getField,
  },
  mutations: {
    openScreenControlOverlay(state) {
      state.screenControlOverlay = true;
    },

    closeScreenControlOverlay(state) {
      state.screenControlOverlay = false;
    },

    switchPCMonitoring(state) {
      state.showPCMonitoring = !state.showPCMonitoring;
      state.updateKey++;
    },

    toggleNavDrawer(state) {
      state.navDrawer = !state.navDrawer;
    },

    syncMacModeFromLocalStorage(state) {
      if (localStorage.getItem("isExpand") === "true") {
        state.isExpand = true;
      } else {
        state.isExpand = false;
      }
    },

    toggleExpand(state) {
      state.isExpand = !state.isExpand;
      localStorage.setItem("isExpand", state.isExpand);
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
