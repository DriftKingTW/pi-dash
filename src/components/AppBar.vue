<template>
  <v-app-bar app color="primary" dark height="30px" flat>
    <div class="d-flex align-center">
      <v-app-bar-nav-icon>
        <raspberry-pi-icon
          size="1.2x"
          fill="white"
          class="mr-2"
        ></raspberry-pi-icon>
      </v-app-bar-nav-icon>
      <v-toolbar-title>
        <strong>Pi Dash</strong>
      </v-toolbar-title>
    </div>
    <v-spacer></v-spacer>
    <!-- <v-divider vertical class="mx-1"></v-divider> -->
    <v-btn icon @click="$store.commit('openKeyboard')">
      <v-icon small>mdi-keyboard</v-icon>
    </v-btn>
  </v-app-bar>
</template>

<script>
import { RaspberryPiIcon } from "vue-simple-icons";

export default {
  components: {
    RaspberryPiIcon,
  },

  data() {
    return {
      now: "",
    };
  },

  mounted() {
    this.initialize();
    setInterval(() => {
      this.updateTime();
    }, 1000);
  },

  methods: {
    initialize() {
      //
    },

    updateTime() {
      const date = new Date();
      this.now = date.toLocaleString();
    },
  },

  computed: {
    //
  },
};
</script>
