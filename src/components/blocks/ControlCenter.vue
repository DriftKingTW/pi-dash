<template>
  <v-card color="primary" flat>
    <v-card-title>
      <v-icon left>mdi-tune-vertical</v-icon>
      Control Center
    </v-card-title>
    <v-card-text class="align-center">
      <v-row>
        <v-col
          cols="12"
          class="py-1 px-6 d-flex align-center justify-space-between"
        >
          <div class="d-flex flex-column">
            <v-btn
              icon
              x-large
              @click="getKettleTemperature"
              :loading="isKettleLoading"
            >
              <v-icon>mdi-kettle</v-icon>
            </v-btn>
            <div class="text-center caption">KetTemp</div>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import axios from "axios";

export default {
  components: {},

  data() {
    return {
      isKettleLoading: false,
    };
  },

  methods: {
    async getKettleTemperature() {
      let result = "";
      let index = 0;
      do {
        try {
          this.isKettleLoading = true;
          const res = await axios.get(
            `${process.env.VUE_APP_API_URL}/mikettle/temperature`,
            // Reading over BLE is slower than the global default allows
            { timeout: 30000 }
          );
          result = res.data;
        } catch (e) {
          console.log(e);
        } finally {
          this.isKettleLoading = false;
          index++;
        }
      } while (result.includes("Read failed") && index < 10);

      this.$store.commit("triggerSnackbar", {
        status: "success",
        text: `Kettle temperature: ${result}°C`,
      });
    },
  },

  computed: {
    //
  },
};
</script>
