<template>
  <v-snackbar
    v-model="snackbar"
    :timeout="snackbarTimeout"
    :color="snackbarColor"
    transition="slide-y-reverse-transition"
  >
    <v-icon v-if="snackbarColor === 'info'" small left>
      mdi-information-outline
    </v-icon>
    <v-icon v-else-if="snackbarColor === 'success'" small left>
      mdi-check
    </v-icon>
    <v-icon v-else-if="snackbarColor === 'error'" small left>
      mdi-alert
    </v-icon>

    {{ snackbarText }}

    <template v-slot:action="{ attrs }">
      <v-btn text v-bind="attrs" @click="$store.commit('closeSnackbar')">
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import { mapFields } from "vuex-map-fields";

export default {
  components: {
    //
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
      // this.$store.commit("triggerSnackbar", {
      //   status: "info",
      //   text: "Test Snackbar",
      // });
    },
  },

  computed: {
    ...mapState(["snackbarTimeout", "snackbarColor", "snackbarText"]),
    ...mapFields(["snackbar"]),
    ...mapMutations(["triggerSnackbar", "closeSnackbar"]),
  },
};
</script>
