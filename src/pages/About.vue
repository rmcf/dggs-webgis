<template>
  <q-page class="q-pa-lg">
    <div class="text-h4 text-center">{{ $t("about_title") }}</div>
    <div class="text-body1 q-mt-md q-mb-md">
      {{ $t("about_1") }}
    </div>
    <div class="text-body1 q-mb-md">
      {{ $t("about_2") }}
    </div>
    <div class="text-body1 q-mb-md">
      {{ $t("about_3") }}
    </div>
    <div class="text-body1 q-mb-md">
      {{ $t("about_4") }}
    </div>
    <!-- page footer -->
    <Footer />
  </q-page>
</template>

<script>
import Footer from "components/Footer.vue";

export default {
  name: "About",

  components: { Footer },

  data() {
    return {};
  },

  mounted() {},

  methods: {},

  computed: {},
};
</script>

<style scoped></style>
