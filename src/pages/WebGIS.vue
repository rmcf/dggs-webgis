<template>
  <q-page class="q-pt-lg">
    <!-- map -->
    <div><Map /></div>
  </q-page>
</template>

<script>
import Map from "components/Map.vue";

export default {
  name: "Web-GIS",

  components: { Map },

  data() {
    return {};
  },

  mounted() {},

  methods: {},

  computed: {
    layersSelectedVectorComputed: function () {
      return this.$store.state.layers.layersSelectedVector;
    },

    layerSelectedRasterComputed: function () {
      return this.$store.state.layers.layerSelectedRaster;
    },
  },
};
</script>

<style scoped></style>
