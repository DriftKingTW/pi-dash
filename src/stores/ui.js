import { defineStore } from "pinia";

// One store for the shell's own state: which overlays are open, which block
// owns the middle slot, and the snackbar. Ported from the Vuex store; with
// Pinia the state is written directly, so vuex-map-fields is no longer needed.
export const useUiStore = defineStore("ui", {
  state: () => ({
    navDrawer: false,
    isExpand: false,

    snackbar: false,
    snackbarText: "",
    snackbarColor: "info",
    snackbarTimeout: 3000,

    osk: false,
    input: "",

    showPCMonitoring: false,
    showOctoMonitoring: false,
    // Bumped whenever the middle slot changes hands, so the outgoing block is
    // torn down rather than reused - its polling loop has to stop with it.
    updateKey: 0,

    screenControlOverlay: false,
  }),

  actions: {
    toggleNavDrawer() {
      this.navDrawer = !this.navDrawer;
    },

    syncMacModeFromLocalStorage() {
      this.isExpand = localStorage.getItem("isExpand") === "true";
    },

    toggleExpand() {
      this.isExpand = !this.isExpand;
      localStorage.setItem("isExpand", String(this.isExpand));
    },

    setPCMonitoring(value) {
      if (this.showPCMonitoring === value) return;
      this.showPCMonitoring = value;
      this.updateKey++;
    },

    switchPCMonitoring() {
      this.setPCMonitoring(!this.showPCMonitoring);
    },

    setOctoMonitoring(value) {
      if (this.showOctoMonitoring === value) return;
      this.showOctoMonitoring = value;
      this.updateKey++;
    },

    switchOctoMonitoring() {
      this.setOctoMonitoring(!this.showOctoMonitoring);
    },

    triggerSnackbar({ status, text }) {
      if (status) this.snackbarColor = status;
      if (text) this.snackbarText = text;
      this.snackbar = true;
    },

    closeSnackbar() {
      this.snackbar = false;
    },

    openKeyboard() {
      this.osk = true;
    },

    closeKeyboard() {
      this.osk = false;
    },

    updateInput(input) {
      this.input = input;
    },

    clearInput() {
      this.input = "";
    },

    openScreenControlOverlay() {
      this.screenControlOverlay = true;
    },

    closeScreenControlOverlay() {
      this.screenControlOverlay = false;
    },
  },
});
