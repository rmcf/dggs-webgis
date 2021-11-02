<template>
  <div class="q-pa-md">
    <div class="row">
      <div class="col-10">
        <div class="q-mb-md">
          <div>Map zoom: {{ mapZoom }}</div>
          <div v-if="mapArea">Map area: {{ mapArea }} km<sup>2</sup></div>
          <div>
            Hexagons quantity: {{ featuresQuantity }} at Level: {{ layerLevel }}
          </div>
          <!-- <div>Map extent (bbox): {{ mapExtent }}</div>
          <div>Map center: {{ mapCenterComputed }}</div> -->
        </div>
      </div>
      <div class="col-2">
        <div class="flex flex-center" style="height: 50px; position: relative">
          <q-inner-loading :showing="loading">
            <q-spinner-ios color="primary" size="30px" />
          </q-inner-loading>
        </div>
      </div>
    </div>
    <!-- map container -->
    <div id="openmap" ref="map-gis" class="map-container"></div>
  </div>
</template>

<script>
import "ol/ol.css";
import geojson2h3 from "geojson2h3";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import { fromLonLat, toLonLat } from "ol/proj";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import Feature from "ol/Feature";
import Polygon from "ol/geom/Polygon";
import { getArea, getDistance } from "ol/sphere";
import { transformExtent } from "ol/proj";
import { defaults } from "ol/interaction";
import {
  getBottomLeft,
  getBottomRight,
  getTopLeft,
  getTopRight,
} from "ol/extent";
import { Fill, Stroke, Style, Text } from "ol/style";
import chroma from "chroma-js";

var uniq = require("lodash.uniq");

// styles for Countries layer
const styleCountries = new Style({
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

const styleHexagonsDefault = new Style({
  fill: new Fill({
    color: "#fff",
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

// styles for hexagon layer
const styleHexagonsChoropleth = new Style({
  fill: new Fill({
    color: "#fff",
  }),
  stroke: new Stroke({
    color: "transparent",
    width: 0,
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

// relations between H3-level & hex area
const h3LevelHexArea = [
  { h3level: 2, hexArea: 69000 }, // h3 official: 86745
  { h3level: 3, hexArea: 9500 }, // h3 official: 12392
  { h3level: 4, hexArea: 1350 }, // h3 official: 1770
  { h3level: 5, hexArea: 190 }, // h3 official: 252
  { h3level: 6, hexArea: 27 }, // h3 official: 36
  { h3level: 7, hexArea: 4 }, // h3 official: 5
  { h3level: 8, hexArea: 0.6 }, // h3 official: 0.74
];

export default {
  name: "Map",

  components: {},

  data() {
    return {
      // map object
      map: null,
      mapCenter: [2791191.1823448315, 8117240.098736058],
      mapZoom: 6,
      layers: [],
      dggsLayersFeatures: [],
      mapExtent: [],
      mapArea: null,
      featuresQuantity: 0,
      layerLevel: 0,
      loading: false,
      corners: null,
    };
  },

  watch: {
    layerSelectedRasterComputed(newValue, oldValue) {
      this.createMap();
    },

    layersSelectedVectorComputed(newValue, oldValue) {
      this.createMap();
    },

    layerSelectedDGGSComputed(newValue, oldValue) {
      this.createMap();
    },

    mapZoom(newValue, oldValue) {
      this.$store.commit("layers/SET_MAP_ZOOM", this.mapZoom);
      this.mapArea = this.mapViewArea(this.map);
      // this.createMap();
    },
  },

  mounted() {
    this.createMap();
  },

  methods: {
    async createMap() {
      // start loading spinner
      this.loading = true;
      var ref = this;

      // remove HTML map container
      document.getElementById("openmap").innerHTML = "";

      // clean layers list
      this.layers = [];

      // map object
      this.map = new Map({
        target: this.$refs["map-gis"],
        interactions: defaults({ mouseWheelZoom: false }),
        layers: [],
        view: new View({
          center: this.mapCenter,
          zoom: this.mapZoom,
          constrainResolution: true,
        }),
      });

      // tile layer
      const tileLayer = new TileLayer({
        name: "osm",
        type: "raster",
        source: new XYZ({
          url: this.layerSelectedRasterComputed.url,
          attributions: this.layerSelectedRasterComputed.attributions,
        }),
      });
      // this.layers.push(tileLayer);
      ref.map.addLayer(tileLayer);

      // vector layers
      if (this.layersSelectedVectorComputed.length > 0) {
        this.layersSelectedVectorComputed.forEach((layer) => {
          let vectorLayer = new VectorLayer({
            source: new VectorSource({
              url: layer.url,
              format: new GeoJSON(),
            }),
            style: function (feature) {
              // console.log(feature);
              styleCountries.getText().setText(feature.get("name"));
              return styleCountries;
            },
          });
          this.layers.push(vectorLayer);
        });
      }

      // DGGS layers
      var layersChoroplethProperties = [];
      if (this.layerSelectedDGGSComputed.length > 0) {
        var layersComputed = this.layerSelectedDGGSComputed;
        var extent = this.mapExtent.toString();
        // loading all selected DGGS layers
        await Promise.all(
          // process each DGGS layer
          layersComputed.map(async (layer) => {
            var hexIDs = [];
            try {
              hexIDs = await this.$axios.get(
                "https://dggs-api-bozea3cspa-ew.a.run.app/dggs-api/collections/" +
                  layer.id +
                  "/zones",
                {
                  params: {
                    resolution: layer.level,
                    limit: 10000,
                    bbox: extent,
                  },
                  headers: {
                    "Content-Type": "application/json",
                  },
                }
              );
            } catch (error) {
              this.loading = false; // stop loading spinner
              console.log("error ", error.message);
            }

            // save received from API geatures to local variable
            let hexFeatures = hexIDs.data.features;
            var hexagons = []; // empty array for vector hexagon on the map
            var choroplethValues = []; // empty array for choropleth data

            // create vector feature, adding properties !!!!! improvements required
            hexFeatures.forEach((featureFromAPI) => {
              // vector hexagon on the map
              let hexagon = geojson2h3.h3ToFeature(featureFromAPI.id);
              // feature property for choropleth map
              // var featureProperty = "";
              // assign all attributes of featureFromAPI to vector hexagon
              Object.entries(featureFromAPI.properties).forEach((entry) => {
                const [key, value] = entry;
                hexagon.properties[key] = value;
                // if (key === layer.choroplethParameter) {
                //   featureProperty = key;
                // }
              });
              hexagons.push(hexagon);
              // select feature property
              choroplethValues.push(
                featureFromAPI.properties[layer.choroplethParameter]
              );
            });

            // layer choropleth parameters
            var layerChoroplethParameters = [""];
            // define hex attributes for cholopleth map
            Object.entries(hexFeatures[0].properties).forEach((entry) => {
              const [key, value] = entry;
              layerChoroplethParameters.push(key);
            });

            // sorted choropleth data
            var choroplethValuesSorted = choroplethValues.sort();
            // sorted choropleth data (not zero value)
            var choroplethValuesSortedFiltered = choroplethValuesSorted.filter(
              function (value) {
                return value > 0;
              }
            );

            // choropleth range breaks
            var limits = chroma.limits(
              choroplethValuesSortedFiltered,
              layer.choroplethRangesMode,
              layer.choroplethRanges
            );

            // function coloring the ranges !!!!!! impovements required: no data
            var colorFunction = chroma
              .scale(layer.choroplethColorPalette)
              .classes(limits);
            // helper attributes of layer
            this.featuresQuantity = hexagons.length;
            this.layerLevel = layer.level;

            // legend for layer
            let layerChoroplethLegend = [];
            limits.forEach((limit) => {
              let legendItem = { color: "", value: 0 };
              let color = colorFunction(limit).hex();
              legendItem.color = color;
              legendItem.value = limit;
              layerChoroplethLegend.push(legendItem);
            });

            // gejson to upload to the map
            let geoJsonObject = {
              type: "FeatureCollection",
              features: hexagons,
            };

            // DGGS layer source
            const vectorSource = new VectorSource({
              features: new GeoJSON().readFeatures(geoJsonObject, {
                featureProjection: "EPSG:3857",
              }),
            });

            // vectorSource.forEachFeature((feature) => {
            //   let a = feature.getGeometry();
            //   console.log(getArea(a) / 1000000);
            // });

            // DGGS vector layer
            const vectorLayer = new VectorLayer({
              name: layer.id,
              type: "vector",
              source: vectorSource,
              style: function (feature) {
                if (layer.choroplethParameter !== "") {
                  // feature label
                  let label = feature.get(layer.choroplethParameter).toFixed(2);
                  styleHexagonsChoropleth.getText().setText(label);
                  let color = colorFunction(
                    feature.get(layer.choroplethParameter)
                  ).hex();
                  styleHexagonsChoropleth.getFill().setColor(color);
                  return styleHexagonsChoropleth;
                } else {
                  styleHexagonsDefault
                    .getText()
                    .setText(feature.get(layer.choroplethParameter));
                  return styleHexagonsDefault;
                }
              },
              opacity: layer.opacity,
            });

            // adding DGGS layer to layers list
            this.layers.push(vectorLayer);

            let layerChoroplethProperties = {
              layerID: layer.id,
              choroplethParameters: layerChoroplethParameters,
              choroplethLegend: layerChoroplethLegend,
            };
            layersChoroplethProperties.push(layerChoroplethProperties);
          })
        );
      }
      // save choropleth properties to vuex
      this.layersChoroplethProperties(layersChoroplethProperties);

      // add all layers to the map
      this.layers.forEach((layer) => {
        ref.map.addLayer(layer);
      });

      this.mapArea = this.mapViewArea(this.map);

      // on move event
      this.map.on("moveend", (event) => {
        let map = event.map;
        this.mapCenter = map.getView().getCenter(); // view center
        this.mapZoom = map.getView().getZoom(); // view zoom
        let extent = map.getView().calculateExtent(); // view extent
        let extentCalc = transformExtent(extent, "EPSG:3857", "EPSG:4326");
        this.mapExtent = extentCalc;
      });

      // stop loading spinner
      this.loading = false;
    },

    // integer to formated string (1135726.85 => "1 135 726.85")
    numberWithSpaces(number) {
      var parts = number.toString().split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
      return parts.join(".");
    },

    layersChoroplethProperties(properties) {
      this.$store.commit("layers/LAYER_CHOROPLETH_PARAMETERS", properties);
    },

    // mapViewArea calculation
    mapViewArea(map) {
      // calculation the area (sq km) of map view
      let extentForPolygon = map.getView().calculateExtent();
      let bl = getBottomLeft(extentForPolygon); // [867424.0544635155, 7570562.472440477]
      let br = getBottomRight(extentForPolygon); // [4714958.310226148, 7570562.472440477]
      let tl = getTopLeft(extentForPolygon); // [867424.0544635155, 8663917.725031639]
      let tr = getTopRight(extentForPolygon); // [4714958.310226148, 8663917.725031639]
      let corners = [];
      corners.push(bl, tl, tr, br, bl);
      // creating polygon from view corners
      var polygonFeatureFromView = new Feature({
        geometry: new Polygon([corners]),
        name: "polygon",
      });
      var polygonFeatureGeometry = polygonFeatureFromView.getGeometry();
      // area of view calculation
      var viewAreaOnSphere = getArea(polygonFeatureGeometry) / 1000000;
      // area of view format to string "1 135 726.85"
      let areaStringFormatted = this.numberWithSpaces(
        viewAreaOnSphere.toFixed(2)
      );
      return areaStringFormatted;
    },
  },

  computed: {
    // map center
    mapCenterComputed: function () {
      let center = this.mapCenter;
      let centerCoords = toLonLat(center);
      return centerCoords;
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
