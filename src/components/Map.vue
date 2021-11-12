<template>
  <div class="q-pl-md q-pr-md q-pb-md">
    <div class="row justify-between items-center q-mb-md">
      <div>Map zoom: {{ mapZoom }}</div>
      <div>Map area: {{ mapAreaComputedFormated }} km<sup>2</sup></div>
      <div>
        Hexagons quantity: {{ featuresQuantity }} at Level: {{ layerLevel }}
      </div>
      <div style="padding-right: 100px">
        <div style="height: 30px; position: relative">
          <q-inner-loading :showing="loading">
            <q-spinner-ios color="primary" size="30px" />
          </q-inner-loading>
        </div>
      </div>
      <!-- <div>Map extent (bbox): {{ mapExtent }}</div>
          <div>Map center: {{ mapCenterComputed }}</div> -->
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
// import { defaults } from "ol/interaction";
import {
  getBottomLeft,
  getBottomRight,
  getTopLeft,
  getTopRight,
} from "ol/extent";
import { Fill, Stroke, Style, Text } from "ol/style";
import chroma from "chroma-js";
// lodash modules
var uniq = require("lodash.uniq");
var sum = require("lodash.sum");

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
    color: "#0000ff",
  }),
  stroke: new Stroke({
    color: "transparent",
    width: 0,
  }),
  text: new Text({
    font: "8px Calibri,sans-serif",
    fill: new Fill({
      color: "#000",
    }),
    stroke: new Stroke({
      color: "#fff",
      width: 3,
    }),
  }),
});

export default {
  name: "Map",

  components: {},

  data() {
    return {
      map: null,
      mapCenter: [2791191.1823448315, 8117240.098736058],
      mapZoom: null,
      mapExtent: [],
      mapArea: null,
      layers: [],
      dggsLayersFeatures: [],
      featuresQuantity: 0,
      layerLevel: 0,
      corners: null,
      loading: false,
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

    // mapZoom(newValue, oldValue) {
    //   this.$store.commit("layers/SET_MAP_ZOOM", this.mapZoom);
    //   this.$store.commit("layers/MAP_AREA", this.mapAreaComputed);
    // },

    // mapCenter(newValue, oldValue) {
    //   let isEqual = newValue.toString() === oldValue.toString();
    //   if (!isEqual) {
    //     this.createMap();
    //   }
    // },

    mapZoomAndCenter: {
      handler(newValue, oldValue) {
        // check if zoom changed
        if (oldValue.zoom !== newValue.zoom) {
          this.$store.commit("layers/SET_MAP_ZOOM", this.mapZoom);
          this.$store.commit("layers/MAP_AREA", this.mapAreaComputed);
          return;
        }
        // chek if center changed
        let isEqual = newValue.center.toString() === oldValue.center.toString();
        if (!isEqual) {
          this.createMap();
          return;
        }
      },
      deep: true,
    },
  },

  created() {},

  mounted() {
    this.mapZoom = this.$store.state.layers.zoom;
    this.createMap();
  },

  unmounted() {},

  methods: {
    async createMap() {
      // start loading spinner
      this.loading = true;
      this.map = null;
      var ref = this;

      // remove HTML map container
      document.getElementById("openmap").innerHTML = "";

      // map object
      this.map = new Map({
        target: this.$refs["map-gis"],
        // interactions: defaults({ mouseWheelZoom: false }),
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
          let vectorLayerJSON = new VectorLayer({
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
          // this.layers.push(vectorLayerJSON);
          ref.map.addLayer(vectorLayerJSON);
        });
      }

      // basic extent values for bbox query
      let extentBasic = this.map.getView().calculateExtent(); // view extent
      let extentCalcBasic = transformExtent(
        extentBasic,
        "EPSG:3857",
        "EPSG:4326"
      );
      this.mapExtent = extentCalcBasic;

      // array of choropleth properties of all dggs layers
      var layersChoroplethProperties = [];

      // DGGS layers
      if (this.layerSelectedDGGSComputed.length > 0) {
        var layersDGGSComputed = this.layerSelectedDGGSComputed;
        var extent = this.mapExtent.toString();
        // loading all selected DGGS layers
        await Promise.all(
          // process each DGGS layer
          layersDGGSComputed.map(async (layer) => {
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

            // create vector feature, adding properties
            hexFeatures.forEach((featureFromAPI) => {
              // vector hexagon on the map
              let hexagon = geojson2h3.h3ToFeature(featureFromAPI.id);
              // assign all attributes of featureFromAPI to vector hexagon
              Object.entries(featureFromAPI.properties).forEach((entry) => {
                const [key, value] = entry;
                hexagon.properties[key] = value;
              });
              hexagons.push(hexagon);
              // select feature property
              choroplethValues.push(
                featureFromAPI.properties[layer.choroplethParameter]
              );
            });

            // layer choropleth parameters, basic value
            var layerChoroplethParameters = [""];
            // define hex attributes for cholopleth map
            if (hexFeatures.length > 0) {
              Object.entries(hexFeatures[0].properties).forEach((entry) => {
                const [key, value] = entry;
                layerChoroplethParameters.push(key);
              });
            }

            // sorted choropleth data
            var choroplethValuesSorted = choroplethValues.sort();

            // choropleth continuous case
            // ==================================================================

            if (layer.choroplethScale === "continuous") {
              // choropleth range breaks
              var limits = chroma.limits(
                choroplethValuesSorted,
                layer.choroplethRangesMode,
                layer.choroplethRanges
              );

              // function coloring the ranges !!!!!! impovements required: no data
              var colorFunctionContinuous = chroma
                .scale(layer.choroplethColorPalette)
                .classes(limits);

              // legend for layer
              let layerChoroplethLegend = [];

              limits.forEach((limit) => {
                let legendItem = { color: "", value: 0 };
                let color = colorFunctionContinuous(limit).hex();
                legendItem.color = color;
                legendItem.value = limit.toFixed(2);
                layerChoroplethLegend.push(legendItem);
              });

              // create layer choropleth properties
              let layerChoroplethProperties = {
                layerID: layer.id,
                choroplethParameters: layerChoroplethParameters,
                choroplethLegend: layerChoroplethLegend,
              };
              layersChoroplethProperties.push(layerChoroplethProperties);

              // gejson to upload to the map
              let geoJsonObject = {
                type: "FeatureCollection",
                features: hexagons,
              };

              // DGGS layer source
              const vectorSourceDGGS = new VectorSource({
                features: new GeoJSON().readFeatures(geoJsonObject, {
                  featureProjection: "EPSG:3857",
                }),
              });

              // DGGS vector layer
              const vectorLayerDGGS = new VectorLayer({
                name: layer.id,
                type: "vector",
                source: vectorSourceDGGS,
                renderer: "canvas",
                zIndex: layer.zIndex,
                style: function (feature) {
                  // style for choropleth
                  if (layer.choroplethParameter !== "") {
                    // feature labels
                    if (layer.choroplethLabels) {
                      let labelFormatted = null;
                      let label = feature.get(layer.choroplethParameter);
                      if (label) {
                        labelFormatted = label.toFixed(2);
                      } else {
                        labelFormatted = label;
                      }
                      styleHexagonsChoropleth
                        .getText()
                        .setText(labelFormatted + "");
                    } else {
                      styleHexagonsChoropleth.getText().setText("");
                    }
                    // feature colors
                    let color = colorFunctionContinuous(
                      feature.get(layer.choroplethParameter)
                    ).hex();
                    styleHexagonsChoropleth.getFill().setColor(color);
                    return styleHexagonsChoropleth;
                  } else {
                    // default style
                    return styleHexagonsDefault;
                  }
                },
                opacity: layer.opacity,
              });

              // adding DGGS layer to layers list
              ref.map.addLayer(vectorLayerDGGS);

              // choropleth classes case
              // ==================================================================
            } else {
              // uniq classes
              const choroplethValuesSortedUniq = uniq(choroplethValuesSorted);

              // sum of uni values
              const choroplethValuesSortedUniqSum = sum(
                choroplethValuesSortedUniq
              );

              // function coloring the ranges !!!!!! impovements required: no data
              var colorFunctionClasses = chroma
                .scale(layer.choroplethColorPalette)
                .classes(choroplethValuesSortedUniq.length);

              // legend for layer
              const layerChoroplethLegend = [];

              choroplethValuesSortedUniq.forEach((legendClass, index) => {
                let legendItem = { color: "", value: 0, normVal: 0 };
                legendItem.value = legendClass;
                legendItem.normVal = index / choroplethValuesSortedUniq.length;
                legendItem.color = colorFunctionClasses(legendItem.normVal);
                layerChoroplethLegend.push(legendItem);
              });

              // layer choropleth parameters, basic value
              var layerChoroplethParameters = [""];
              // define hex attributes for cholopleth map
              if (hexFeatures.length > 0) {
                Object.entries(hexFeatures[0].properties).forEach((entry) => {
                  const [key, value] = entry;
                  layerChoroplethParameters.push(key);
                });
              }

              // create layer choropleth properties
              let layerChoroplethProperties = {
                layerID: layer.id,
                choroplethParameters: layerChoroplethParameters,
                choroplethLegend: layerChoroplethLegend,
              };
              layersChoroplethProperties.push(layerChoroplethProperties);

              // gejson to upload to the map
              let geoJsonObject = {
                type: "FeatureCollection",
                features: hexagons,
              };

              // DGGS layer source
              const vectorSourceDGGS = new VectorSource({
                features: new GeoJSON().readFeatures(geoJsonObject, {
                  featureProjection: "EPSG:3857",
                }),
              });

              // DGGS vector layer
              const vectorLayerDGGS = new VectorLayer({
                name: layer.id,
                type: "vector",
                source: vectorSourceDGGS,
                renderer: "canvas",
                style: function (feature) {
                  const featureValue = feature.get(layer.choroplethParameter);
                  // style for choropleth
                  if (layer.choroplethParameter !== "") {
                    // feature labels
                    if (layer.choroplethLabels) {
                      let labelFormatted = null;
                      let label = feature.get(layer.choroplethParameter);
                      if (label) {
                        labelFormatted = label;
                      } else {
                        labelFormatted = label;
                      }
                      styleHexagonsChoropleth
                        .getText()
                        .setText(labelFormatted + "");
                    } else {
                      styleHexagonsChoropleth.getText().setText("");
                    }
                    // feature color
                    const colorFeature = ref.featureColor(
                      featureValue,
                      layerChoroplethLegend
                    );
                    styleHexagonsChoropleth.getFill().setColor(colorFeature);
                    return styleHexagonsChoropleth;
                  } else {
                    // default style
                    return styleHexagonsDefault;
                  }
                },
                opacity: layer.opacity,
              });

              // adding DGGS layer to layers list
              ref.map.addLayer(vectorLayerDGGS);
            }
          })
        );
      }

      // save choropleth properties to vuex
      this.layersChoroplethProperties(layersChoroplethProperties);

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

    featureColor(featureValue, legend) {
      let color = "#000";
      legend.forEach((legendClass) => {
        if (legendClass.value == featureValue) {
          color = legendClass.color;
        } else return "#000";
      });
      return color;
    },
  },

  computed: {
    // map center
    mapCenterComputed: function () {
      let center = this.mapCenter;
      let centerCoords = toLonLat(center);
      return centerCoords;
    },
    // mapViewArea calculation
    mapAreaComputed: function () {
      if (this.map && this.mapZoom) {
        // calculation the area (sq km) of map view
        let extentForPolygon = this.map.getView().calculateExtent();
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
        return viewAreaOnSphere;
      } else {
        return null;
      }
    },

    // area of view format to string "1 135 726.85"
    mapAreaComputedFormated: function () {
      if (this.mapAreaComputed) {
        let area = this.mapAreaComputed;
        let areaFormated = area.toFixed(2);
        return this.numberWithSpaces(areaFormated);
      } else {
        return null;
      }
    },

    mapZoomAndCenter: function () {
      return { zoom: this.mapZoom, center: this.mapCenter };
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
  height: 85vh;
}
</style>
