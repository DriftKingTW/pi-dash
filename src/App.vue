<template>
  <v-app>
    <AppBar />
    <v-main>
      <router-view />
      <v-dialog
        v-model="osk"
        fullscreen
        hide-overlay
        transition="dialog-bottom-transition"
      >
        <v-card>
          <div class="d-flex">
            <v-spacer></v-spacer>
            <div class="d-flex" style="width: 850px">
              <v-text-field
                :value="input"
                dense
                solo
                flat
                hide-details
                class="w-full white--text"
                placeholder="Tap on the virtual keyboard to start"
                @input="onInputChange"
              />
              <v-btn icon @click="$store.commit('closeKeyboard')">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </div>
            <v-spacer></v-spacer>
          </div>
          <div class="d-flex">
            <v-spacer></v-spacer>
            <SimpleKeyboard
              @onChange="onChange"
              @onKeyPress="onKeyPress"
              :input="input"
              :theme="theme"
            />
            <v-spacer></v-spacer>
          </div>
        </v-card>
      </v-dialog>
    </v-main>
    <SnackBar />
    <v-snackbar
      bottom
      right
      :value="updateExists"
      :timeout="-1"
      color="info"
      transition="slide-x-reverse-transition"
    >
      <v-icon left small>mdi-alert-circle-outline</v-icon>
      An update is available!
      <template v-slot:action="{ attrs }">
        <v-btn text small class="ma-0" @click="refreshApp" v-bind="attrs">
          Update
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script>
import AppBar from "@/components/AppBar.vue";
import SimpleKeyboard from "@/components/SimpleKeyboard.vue";
import { mapFields } from "vuex-map-fields";
import SnackBar from "@/components/SnackBar";

export default {
  components: {
    AppBar,
    SimpleKeyboard,
    SnackBar,
  },

  data() {
    return {
      refreshing: false,
      registration: null,
      updateExists: false,
      theme: "hg-theme-default dark-theme",
    };
  },

  created() {
    document.addEventListener("swUpdated", this.updateAvailable, {
      once: true,
    });

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      // We'll also need to add 'refreshing' to our data originally set to false.
      if (this.refreshing) return;
      this.refreshing = true;
      // Here the actual reload of the page occurs
      window.location.reload();
    });
  },

  mounted() {
    this.initialize();
  },

  methods: {
    initialize() {
      document.title = "Pi Dash";
    },

    onChange(input) {
      this.input = input;
      this.$store.commit("updateInput", input);
    },

    onKeyPress(button) {
      console.log("button", button);
    },

    onInputChange(input) {
      this.input = input.target.value;
    },

    updateAvailable(event) {
      this.registration = event.detail;
      this.updateExists = true;
    },

    refreshApp() {
      this.updateExists = false;
      // Make sure we only send a 'skip waiting' message if the SW is waiting
      if (!this.registration || !this.registration.waiting) return;
      // Send message to SW to skip the waiting and activate the new SW
      this.registration.waiting.postMessage({ type: "SKIP_WAITING" });
    },
  },

  computed: {
    ...mapFields(["osk", "input"]),
  },
};
</script>

<style>
html {
  overflow: hidden;
}

/* Currently this method not working in Pi's touch screen */
/* @media (pointer: coarse) {
} */
.v-btn:hover:before {
  opacity: 0 !important;
}

.v-tab:hover:before {
  opacity: 0 !important;
}

.vc-arrow:hover {
  background: none !important;
}

.simple-keyboard {
  max-width: 850px;
}

/*
  Theme: dark-theme
*/
.simple-keyboard.dark-theme {
  background-color: rgba(50, 50, 50, 0.8);
  border-radius: 0;
  border-bottom-right-radius: 5px;
  border-bottom-left-radius: 5px;
}

.simple-keyboard.dark-theme .hg-button {
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(20, 20, 20, 0.8);
  color: white;
  border: none;
}

.simple-keyboard.dark-theme .hg-button:active {
  background: #1c4995;
  color: white;
  border: none;
}

#root .simple-keyboard.dark-theme + .simple-keyboard-preview {
  background: #1c4995;
}
</style>
