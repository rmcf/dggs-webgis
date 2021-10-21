<template>
  <div class="q-pa-md">
    <div class="row items-start items-center q-gutter-md q-mb-md">
      <div>Map zoom: {{ mapZoom }}</div>
      <div>
        Map center: {{ mapCenterComputed[0].toFixed(5) }},
        {{ mapCenterComputed[1].toFixed(5) }}
      </div>
    </div>
    <div class="q-mb-md">
      DGGS layer seleted: {{ layerSelectedDGGSComputed }}
    </div>
    <!-- <div class="q-mb-md">DGGS layers features {{ dggsLayersFeatures }}</div> -->
    <div id="openmap" ref="map-gis" class="map-container"></div>
  </div>
</template>

<script>
import "ol/ol.css";
import { geoToH3, polyfill, h3SetToMultiPolygon } from "h3-js";
import geojson2h3 from "geojson2h3";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import { fromLonLat, toLonLat } from "ol/proj";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import Feature from "ol/Feature";
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
      layers: [],
      dggsLayersFeatures: [],
      extent: null,
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

    layerSelectedDGGSComputed(newValue, oldValue) {
      console.log("DGGS changed");
      this.createMap();
    },
  },

  mounted() {
    this.createMap();
  },

  methods: {
    async createMap() {
      // remove HTML map container
      document.getElementById("openmap").innerHTML = "";
      // clean layers list
      this.layers = [];
      // remove features
      this.dggsLayersFeatures = [];

      // tile layer
      const tileLayer = new TileLayer({
        source: new XYZ({
          url: this.layerSelectedRasterComputed.url,
          attributions: this.layerSelectedRasterComputed.attributions,
        }),
      });
      this.layers.push(tileLayer);

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
          this.layers.push(vectorLayer);
        });
      }

      // get all features ID for all DGGS layers
      if (this.layerSelectedDGGSComputed.length > 0) {
        var layersComputed = this.layerSelectedDGGSComputed;
        await Promise.all(
          layersComputed.map(async (layer) => {
            var hexIDs = [];
            try {
              hexIDs = await this.$axios.get(
                "https://dggs-api-bozea3cspa-ew.a.run.app/dggs-api/collections/" +
                  layer.id +
                  "/zones",
                {
                  params: {
                    resolution: 3,
                    limit: 10,
                  },
                  headers: {
                    "Content-Type": "application/json",
                  },
                }
              );
            } catch (error) {
              console.log("error ", error.message);
            }
            //
            let hexFeatures = hexIDs.data.features;
            var hexagons = [];
            hexFeatures.forEach((feature) => {
              let hexID = feature.geometry[0];
              let hex = geojson2h3.h3ToFeature(hexID);
              hex.properties = feature.properties;
              hex.properties.id = feature.id;
              hex.properties.links = feature.links;
              hexagons.push(hex);
            });

            // gejson to upload to the map
            let geoJsonObject = {
              type: "FeatureCollection",
              features: hexagons,
            };

            this.dggsLayersFeatures = geoJsonObject;
            const vectorSource = new VectorSource({
              features: new GeoJSON().readFeatures(geoJsonObject, {
                featureProjection: "EPSG:3857",
              }),
            });

            // vector layer
            const vectorLayer = new VectorLayer({
              source: vectorSource,
              style: function (feature) {
                style.getText().setText(feature.get("id"));
                return style;
              },
            });
            this.extent = vectorLayer;
            this.layers.push(vectorLayer);
          })
        );
      }

      // map object
      this.map = new Map({
        target: this.$refs["map-gis"],
        layers: this.layers,
        view: new View({
          center: this.mapCenter,
          zoom: this.mapZoom,
          constrainResolution: true,
          // projection: "EPSG:4326",
        }),
      });

      if (this.extent) {
        // this.map.getView().fit(this.extent.getExtent());
        var extent = this.extent.getSource().getExtent();
        this.map.getView().fit(extent, this.map.getSize());
      }

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
    // map center
    mapCenterComputed: function () {
      return toLonLat(this.mapCenter);
    },
    // vector layers
    layersSelectedVectorComputed: function () {
      return this.$store.state.layers.layersSelectedVector;
    },
    // raster layers
    layerSelectedRasterComputed: function () {
      return this.$store.state.layers.layerSelectedRaster;
    },
    // DGGS layers
    layerSelectedDGGSComputed: function () {
      return this.$store.state.layers.layersSelectedDGGS;
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
