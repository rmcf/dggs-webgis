<template>
  <div class="q-pa-md row items-start items-center q-gutter-md">
    <div>Map zoom: {{ mapZoom }}</div>
    <div>
      Map center: {{ mapCenterComputed[0].toFixed(5) }},
      {{ mapCenterComputed[1].toFixed(5) }}
    </div>
    <div id="openmap" ref="map-gis" class="map-container"></div>
  </div>
</template>

<script>
import "ol/ol.css";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import { fromLonLat, toLonLat } from "ol/proj";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { Fill, Stroke, Style, Text } from "ol/style";

export default {
  name: "Map",

  props: { layer: Object },

  components: {},

  data() {
    return {
      // map object
      map: null,
      mapCenter: [2791191.1823448315, 8117240.098736058],
      mapZoom: 7,
    };
  },

  watch: {
    // watch for selected vector layers
    layerSelectedRasterComputed(newValue, oldValue) {
      this.createMap();
    },

    layersSelectedVectorComputed(newValue, oldValue) {
      this.createMap();
    },
  },

  mounted() {
    this.createMap();
  },

  methods: {
    createMap() {
      // remove HTML map container
      document.getElementById("openmap").innerHTML = "";
      // all layers
      var layers = [];
      // tile layer
      const tileLayer = new TileLayer({
        source: new XYZ({
          url: this.layerSelectedRasterComputed.url,
          attributions: this.layerSelectedRasterComputed.attributions,
        }),
      });
      layers.push(tileLayer);
      // styles
      const style = new Style({
        fill: new Fill({
          color: "rgba(255, 255, 255, 0.6)",
        }),
        stroke: new Stroke({
          color: "#319FD3",
          width: 1,
        }),
        text: new Text({
          font: "12px Calibri,sans-serif",
          fill: new Fill({
            color: "#000",
          }),
          stroke: new Stroke({
            color: "#fff",
            width: 3,
          }),
        }),
      });
      // vector layers
      if (this.layersSelectedVectorComputed.length > 0) {
        this.layersSelectedVectorComputed.forEach((layer) => {
          let vectorLayer = new VectorLayer({
            source: new VectorSource({
              url: layer.url,
              format: new GeoJSON(),
            }),
            style: function (feature) {
              style.getText().setText(feature.get("name"));
              return style;
            },
          });
          layers.push(vectorLayer);
        });
      }
      // map object
      this.map = new Map({
        target: this.$refs["map-gis"],
        layers: layers,
        view: new View({
          center: this.mapCenter,
          zoom: this.mapZoom,
          constrainResolution: true,
        }),
      });
      // on move event
      this.map.on("moveend", (event) => {
        let map = event.map;
        let center = map.getView().getCenter(); // view center
        let zoom = map.getView().getZoom(); // view zoom
        this.mapCenter = center;
        this.mapZoom = zoom;
      });
    },
  },

  computed: {
    // vector layers
    layersSelectedVectorComputed: function () {
      return this.$store.state.layers.layersSelectedVector;
    },
    // raster layers
    layerSelectedRasterComputed: function () {
      return this.$store.state.layers.layerSelectedRaster;
    },
    // map center
    mapCenterComputed: function () {
      return toLonLat(this.mapCenter);
    },
  },
};
</script>

<style lang="scss" scoped>
.map-container {
  width: 100%;
  height: 75vh;
}
</style>
