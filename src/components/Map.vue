<template>
  <div class="q-pa-md row items-start items-center q-gutter-md">
    <!-- <div class="q-pa-md">{{ map }}</div> -->
    <!-- <div class="q-pb-md">
      <q-btn color="orange-6" @click="testFunction()">Test function</q-btn>
    </div> -->
    <div>Map zoom: {{ mapZoom }}</div>
    <div>Map center: {{ mapCenterComputed }}</div>
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
// import MouseWheelZoom from 'ol/interaction/MouseWheelZoom';

export default {
  name: "Map",

  props: { layer: Object },

  components: {},

  data() {
    return {
      // map object
      map: null,
      mapCenter: [25.073697, 58.706599],
      mapZoom: 7,
    };
  },

  watch: {
    // watch for selected vector layers
    layerSelectedRasterComputed(newValue, oldValue) {
      this.updateMap();
    },

    layersSelectedVectorComputed(newValue, oldValue) {
      this.updateMap();
    },
  },

  mounted() {
    this.createMap();
  },

  methods: {
    testFunction() {
      console.log("test");
    },

    createMap() {
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
          center: fromLonLat(this.mapCenter),
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

    // create map object
    updateMap() {
      // remove HTML map container
      document.getElementById("openmap").innerHTML = "";

      var layers = [];

      // new tileLayer
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

      if (this.layersSelectedVectorComputed.length > 0) {
        this.layersSelectedVectorComputed.forEach((layer) => {
          // vector layer
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

  // load geojson file
  // await this.$axios({
  //   url: "https://openlayers.org/en/latest/examples/data/geojson/countries.geojson",
  // }).then((res) => {
  //   let pJSON = new GeoJSON().readFeatures(res.data);
  //   var vectorSource = new VectorSource({
  //     features: pJSON,
  //   });
  //   vectorLayer = new VectorLayer({
  //     source: vectorSource,
  //     style: new Style({
  //       stroke: new Stroke({
  //         color: "yellow",
  //         width: 1,
  //       }),
  //       fill: new Fill({
  //         color: "rgba(255, 255, 0, 0.1)",
  //       }),
  //     }),
  //   });
  // });

  computed: {
    layersSelectedVectorComputed: function () {
      return this.$store.state.layers.layersSelectedVector;
    },

    layerSelectedRasterComputed: function () {
      return this.$store.state.layers.layerSelectedRaster;
    },

    mapCenterComputed: function () {
      return toLonLat(this.mapCenter);
    },
  },
};
</script>

<style lang="scss" scoped>
.map-container {
  width: 100%;
  height: 80vh;
}
</style>
