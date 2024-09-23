<template>
  <v-card color="primary">
    <img
      src="http://octopi.local/webcam/?action=stream"
      alt="Camera Live Stream"
      width="100%"
    />
  </v-card>
</template>

<script>
export default {
  components: {
    //
  },

  data() {
    return {};
  },

  mounted() {
    this.initialize();
  },

  methods: {
    async initialize() {},
  },

  computed: {
    //
  },
};
</script>
