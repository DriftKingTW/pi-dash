<template>
  <v-navigation-drawer
    v-model="navDrawer"
    absolute
    bottom
    temporary
    color="primary"
  >
    <v-list flat>
      <v-list-item-group>
        <v-list-item>
          <v-list-item-title>Foo</v-list-item-title>
        </v-list-item>

        <v-list-item>
          <v-list-item-title>Bar</v-list-item-title>
        </v-list-item>

        <v-list-item>
          <v-list-item-title>Fizz</v-list-item-title>
        </v-list-item>

        <v-list-item>
          <v-list-item-title>Buzz</v-list-item-title>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
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
      //
    },
  },

  computed: {
    ...mapFields(["navDrawer"]),
  },
};
</script>
