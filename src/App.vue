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
      //
    },
  },

  computed: {
    //
  },
};
</script>
