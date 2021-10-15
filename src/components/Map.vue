<template>
  <div class="q-pa-md">
    <div id="openmap" ref="map" class="map-container"></div>
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
      mapCenter: [25.073697, 58.706599],
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

  created() {},

  methods: {
    // create map object
    createMap() {
      let ref = this;
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

      // tile layer
      // const tileLayer = new TileLayer({
      //   source: new OSM(),
      // });

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

      // map object
      this.map = new Map({
        target: this.$refs["map"],
        layers: layers,
        view: new View({
          center: fromLonLat(this.mapCenter),
          zoom: this.mapZoom,
        }),
      });

      function getMapCenter(map) {
        let center = map.getView().getCenter();
        let mapCenter = toLonLat(center);
        ref.mapCenter = mapCenter;
        console.log(mapCenter);
      }

      // event listener
      // this.map.on("moveend", getMapCenter(this.map));
    },
  },

  computed: {
    layersSelectedVectorComputed: function () {
      return this.$store.state.layers.layersSelectedVector;
    },

    layerSelectedRasterComputed: function () {
      return this.$store.state.layers.layerSelectedRaster;
    },

    mapCenterComputed: function () {
      if (this.map) {
        return 7;
      } else {
        return null;
      }
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
