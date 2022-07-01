<template>
  <v-app-bar app color="primary" dark dense flat>
    <div class="d-flex align-center">
      <v-toolbar-title>
        <v-app-bar-nav-icon>
          <raspberry-pi-icon
            size="1.5x"
            fill="white"
            class="mr-2"
          ></raspberry-pi-icon>
        </v-app-bar-nav-icon>
        <strong>Pi Dash</strong>
      </v-toolbar-title>
    </div>
    <v-spacer></v-spacer>
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
      //
    };
  },

  mounted() {
    this.initialize();
  },

  methods: {
    initialize() {
      //
    },
  },

  computed: {
    //
  },
};
</script>
