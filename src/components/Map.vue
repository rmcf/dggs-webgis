<template>
  <div class="q-pa-md">
    <div class="row">
      <div class="col-10">
        <div class="row items-start items-center q-gutter-md q-mb-md">
          <div>Map zoom: {{ mapZoom }}</div>
          <!-- <div>
            Map center: {{ mapCenterComputed[0].toFixed(5) }},
            {{ mapCenterComputed[1].toFixed(5) }}
          </div> -->
          <div>
            Hexagons quantity: {{ featuresQuantity }} at Level: {{ layerLevel }}
          </div>
          <div>Map extent: {{ mapExtent }}</div>
          <div>Map center: {{ mapCenterComputed }}</div>
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
    <!-- <div class="q-mb-md">DGGS layers features {{ dggsLayersFeatures }}</div> -->
    <div id="openmap" ref="map-gis" class="map-container"></div>
  </div>
</template>

<script>
import "ol/ol.css";
// import { geoToH3, polyfill, h3SetToMultiPolygon } from "h3-js";
import geojson2h3 from "geojson2h3";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import { fromLonLat, toLonLat } from "ol/proj";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { transformExtent } from "ol/proj";
// import Feature from "ol/Feature";
import { Fill, Stroke, Style, Text } from "ol/style";
import chroma from "chroma-js";

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

export default {
  name: "Map",

  props: { layer: Object },

  components: {},

  data() {
    return {
      // map object
      map: null,
      mapCenter: [2791191.1823448315, 8117240.098736058],
      mapZoom: 6,
      layers: [],
      dggsLayersFeatures: [],
      extent: null,
      mapExtent: [],
      featuresQuantity: 0,
      layerLevel: 0,
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

    mapZoom(newValue, oldValue) {
      this.$store.commit("layers/SET_MAP_ZOOM", this.mapZoom);
    },
  },

  mounted() {
    this.createMap();
  },

  methods: {
    async createMap() {
      // start loading spinner
      this.loading = true;

      // remove HTML map container
      document.getElementById("openmap").innerHTML = "";
      // clean layers list
      this.layers = [];

      // tile layer
      const tileLayer = new TileLayer({
        name: "osm",
        type: "raster",
        source: new XYZ({
          url: this.layerSelectedRasterComputed.url,
          attributions: this.layerSelectedRasterComputed.attributions,
        }),
      });
      this.layers.push(tileLayer);

      // vector layers
      if (this.layersSelectedVectorComputed.length > 0) {
        this.layersSelectedVectorComputed.forEach((layer) => {
          let vectorLayer = new VectorLayer({
            source: new VectorSource({
              url: layer.url,
              format: new GeoJSON(),
            }),
            style: function (feature) {
              styleCountries.getText().setText(feature.get("name"));
              return styleCountries;
            },
          });
          this.layers.push(vectorLayer);
        });
      }

      // DGGS layers
      if (this.layerSelectedDGGSComputed.length > 0) {
        var layersComputed = this.layerSelectedDGGSComputed;
        var extent = this.mapExtent.toString();

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
              console.log("error ", error.message);
            }
            // save received from API geatures to local variable
            let hexFeatures = hexIDs.data.features;
            var hexagons = []; // empty array for hex IDs
            var choroplethValues = []; // empty array for choropleth data
            // create vector feature, adding properties
            hexFeatures.forEach((feature) => {
              let hexID = feature.id;
              let hex = geojson2h3.h3ToFeature(hexID);
              hex.properties.id = feature.id;
              hex.properties.links = feature.links;
              hex.properties.elevation = feature.properties.elevation;
              hexagons.push(hex);
              choroplethValues.push(feature.properties.elevation);
            });
            var choroplethValuesSorted = choroplethValues.sort();
            var limits = chroma.limits(
              choroplethValuesSorted,
              layer.choroplethRangesMode,
              layer.choroplethRanges
            );
            var colorFunction = chroma
              .scale(layer.choroplethColorPalette)
              .classes(limits);
            // .nodata("#eee")(0.0);
            this.featuresQuantity = hexagons.length;
            this.layerLevel = layer.level;

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

            // DGGS vector layer
            const vectorLayer = new VectorLayer({
              name: layer.id,
              type: "vector",
              source: vectorSource,
              style: function (feature) {
                if (layer.choroplethStatus) {
                  // styleHexagons.getText().setText(feature.get("id"));
                  let color = colorFunction(feature.get("elevation")).hex();
                  styleHexagonsChoropleth.getFill().setColor(color);
                  return styleHexagonsChoropleth;
                } else {
                  return styleHexagonsDefault;
                }
              },
              // strategy: loadingstrategy.bbox,
              opacity: layer.opacity,
            });

            // saving vector layer to data section
            // this.extent = vectorLayer;

            // adding layer to layers list
            this.layers.push(vectorLayer);
          })
        );
      }

      // olmap.getView().calculateExtent(olmap.getSize());

      // map object
      this.map = new Map({
        target: this.$refs["map-gis"],
        layers: [],
        view: new View({
          center: this.mapCenter,
          zoom: this.mapZoom,
          constrainResolution: true,
        }),
      });

      this.layers.forEach((layer) => {
        let ref = this;
        ref.map.addLayer(layer);
      });

      // this.map.getLayers().forEach((layer) => {
      //   if (layer) {
      //     if (layer.get("type") !== "raster") {
      //       this.map.removeLayer(layer);
      //     }
      //   }
      // });

      this.map.getLayers().forEach((layer) => {
        console.log(layer.get("name"));
      });

      // extent map to last dggs layer
      // if (this.extent) {
      //   var extent = this.extent.getSource().getExtent();
      //   this.map.getView().fit(extent, this.map.getSize());
      // }

      // on move event
      this.map.on("moveend", (event) => {
        let ref = this;
        let map = event.map;
        this.mapCenter = map.getView().getCenter(); // view center
        this.mapZoom = map.getView().getZoom(); // view zoom
        // get extent
        let extent = this.map.getView().calculateExtent();
        let extentCalc = transformExtent(extent, "EPSG:3857", "EPSG:4326");
        this.mapExtent = extentCalc;
      });

      // https://www.w3schools.com/jsref/obj_mouseevent.asp

      // stop loading spinner
      this.loading = false;
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
    // map extent
    // mapExtent: function () {
    //   if (this.map) {
    //     let corners = [];
    //     let extent = this.map.getView().calculateExtent();
    //     let bl = getBottomLeft(extent);
    //     let tl = getTopLeft(extent);
    //     let tr = getTopRight(extent);
    //     let br = getBottomRight(extent);
    //     corners.push(bl, tl, tr, br, bl);
    //     return corners;
    //   } else {
    //     return null;
    //   }
    // },
  },
};
</script>

<style lang="scss" scoped>
.map-container {
  width: 100%;
  height: 75vh;
}
</style>
