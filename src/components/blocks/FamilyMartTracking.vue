<template>
  <v-card color="primary" flat :loading="loading">
    <v-card-title>
      <v-icon left>mdi-package-variant-closed</v-icon>
      Family Mart Package Tracking
      <v-spacer></v-spacer>
      <v-btn icon @click="initialize" :disabled="loading">
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
    </v-card-title>
    <v-card-subtitle>Updated at {{ lastUpdate }}</v-card-subtitle>
    <v-card-text>
      <v-text-field
        label="Tracking ID"
        v-model="trackingId"
        dense
        append-outer-icon="mdi-plus"
        color="white"
        @click="handleInput"
        @click:append-outer="addPackage"
        @keyup.enter="addPackage"
      >
      </v-text-field>
      <v-row align="center" class="spacer" no-gutters>
        <v-col cols="12" v-for="(d, i) in data" :key="i">
          <v-skeleton-loader
            v-if="loading"
            class="mx-auto"
            width="100%"
            type="paragraph"
          ></v-skeleton-loader>
          <v-chip
            v-if="d.orderId"
            small
            label
            color="primary lighten-1"
            class="mb-2"
            close
            @click:close="removePackage(i)"
          >
            <v-icon small left>mdi-truck-cargo-container</v-icon>
            {{ d.orderId }} {{ d.status }} {{ d.receiveDate }}
          </v-chip>
          <v-chip v-else small label color="primary lighten-1" class="mb-2">
            <v-icon small left>mdi-emoticon-sad</v-icon>
            No Data
          </v-chip>
          <br />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import axios from "axios";
import { mapState } from "vuex";

export default {
  components: {
    //
  },

  data() {
    return {
      loading: true,
      trackingId: "",
      packages: [],
      data: [],
      lastUpdate: new Date().toLocaleString(),
    };
  },

  mounted() {
    this.initialize();
    setInterval(() => {
      this.initialize();
    }, 1000 * 60 * 30 /* 10 minutes */);
  },

  methods: {
    async initialize() {
      this.loading = true;
      this.data = [];
      this.packages = [];
      this.packages = this.loadPackages();
      for (const pkg of this.packages) {
        try {
          const query = {
            trackingId: pkg,
          };
          const res = await axios.post(
            `${process.env.VUE_APP_API_URL}/package/familymart`,
            query
          );
          if (res.data.statusCode === "999") {
            res.data.latestStatus.status = "查無訂單資料";
          }
          this.data = [...this.data, { ...res.data.latestStatus }];
        } catch (e) {
          console.log(e);
        }
      }
      this.lastUpdate = new Date().toLocaleString();
      this.loading = false;
    },

    addPackage() {
      this.packages = [...this.packages, this.trackingId];
      this.trackingId = "";
      this.savePackages();
      this.initialize();
    },

    removePackage(index) {
      this.packages.splice(index, 1);
      this.savePackages();
      this.initialize();
    },

    savePackages() {
      localStorage.setItem("familyMartPackages", JSON.stringify(this.packages));
    },

    loadPackages() {
      if (localStorage.getItem("familyMartPackages").length !== null) {
        return JSON.parse(localStorage.getItem("familyMartPackages"));
      } else {
        return [];
      }
    },

    handleInput() {
      if (this.input.length > 0) {
        this.trackingId = this.input;
        this.$store.commit("clearInput");
      }
    },
  },

  computed: {
    familyMartTrackingUrl: function () {
      return `https://ecfme.fme.com.tw/fmedcfpwebv2/index.aspx`;
    },

    ...mapState(["input"]),
  },
};
</script>
