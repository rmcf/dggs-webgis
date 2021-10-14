<template>
  <div class="q-pa-md">
    <div id="openmap" ref="map" class="map-container"></div>
  </div>
</template>

<script>
import "ol/ol.css";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { fromLonLat, toLonLat } from "ol/proj";
// import VectorLayer from "ol/layer/Vector";
// import VectorSource from "ol/source/Vector";
// import GeoJSON from "ol/format/GeoJSON";

export default {
  name: "Map",

  components: {},

  data() {
    return {
      // map object
      map: null,
      mapCenter: [25.073697, 58.706599],
      mapZoom: 7,
    };
  },

  mounted() {
    this.createMap();
  },

  methods: {
    // create map object
    createMap() {
      // tile layer
      const tileLayer = new TileLayer({
        source: new OSM(),
      });
      // map object
      this.map = new Map({
        target: this.$refs["map"],
        layers: [tileLayer],
        view: new View({
          center: fromLonLat(this.mapCenter),
          zoom: this.mapZoom,
        }),
      });
    },
  },

  computed: {},
};
</script>

<style lang="scss" scoped>
.map-container {
  width: 100%;
  height: 80vh;
}
</style>
