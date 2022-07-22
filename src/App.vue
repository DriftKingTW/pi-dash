<template>
  <v-app>
    <AppBar />
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
import AppBar from "@/components/AppBar.vue";

export default {
  components: {
    AppBar,
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
      document.title = "Pi Dash";
    },
  },

  computed: {
    //
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
</style>
