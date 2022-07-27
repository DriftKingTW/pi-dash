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
  </v-app>
</template>

<script>
import AppBar from "@/components/AppBar.vue";
import SimpleKeyboard from "@/components/SimpleKeyboard.vue";
import { mapFields } from "vuex-map-fields";

export default {
  components: {
    AppBar,
    SimpleKeyboard,
  },

  data() {
    return {
      theme: "hg-theme-default dark-theme",
    };
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
  },

  computed: {
    ...mapFields(["osk", "input"]),
  },
};
</script>

<style>
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
