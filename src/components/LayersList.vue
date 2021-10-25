<template>
  <div>
    <transition
      appear
      enter-active-class="animated fadeIn"
      leave-active-class="animated fadeOut"
    >
      <div v-if="currentRouterPath === '/map'">
        <!-- list of DGGS layers -->
        <div>
          <q-list>
            <div v-for="layer in layersDGGS" :key="layer.id">
              <!-- checkbox and label -->
              <q-item tag="label" class="row items-start">
                <!-- checkbox -->
                <q-item-section avatar>
                  <q-checkbox
                    v-model="layersSelectedDGGS"
                    :disable="disableLayers(layer['dggs-id'])"
                    :val="layer"
                    color="primary"
                  />
                </q-item-section>
                <!-- title and description -->
                <q-item-section>
                  <q-item-label class="text-black">{{
                    layer.title
                  }}</q-item-label>
                  <q-item-label caption>{{ layer.description }}</q-item-label>
                </q-item-section>
              </q-item>
              <!-- layer properties setting -->
              <q-item v-if="layerSelected(layer)" class="row items-start">
                <q-item-section avatar> </q-item-section>
                <q-item-section>
                  <!-- opacity -->
                  <div>
                    <div>
                      <q-select
                        dense
                        outlined
                        v-model="layer.opacity"
                        :options="[
                          0, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1,
                        ]"
                        label="Opacity"
                      />
                    </div>
                  </div>
                  <!-- level of hexagons -->
                  <div class="q-mt-md">
                    <q-select
                      dense
                      outlined
                      v-model="layer.level"
                      :options="
                        this.filterHexLevels(layer.resolutions, this.mapZoom)
                      "
                      label="Level"
                    />
                  </div>
                  <!-- chroropleth map-->
                  <div class="q-mt-md">
                    <q-checkbox
                      dense
                      v-model="layer.choroplethStatus"
                      label="Choropleth map"
                    />
                  </div>
                  <div v-if="layer.choroplethStatus">
                    <!-- chropleth ranges quantity -->
                    <div class="q-mt-md">
                      <q-select
                        dense
                        outlined
                        v-model="layer.choroplethRanges"
                        :options="[2, 3, 4, 5, 6, 7, 8, 9, 10]"
                        label="Classes"
                      />
                    </div>
                    <!-- chropleth ranges mode -->
                    <div class="q-mt-md">
                      <q-select
                        dense
                        outlined
                        v-model="layer.choroplethRangesMode"
                        :options="rangesMode"
                        label="Classification"
                        emit-value
                        map-options
                      />
                    </div>
                    <!-- chropleth color palette -->
                    <div class="q-mt-md">
                      <q-select
                        dense
                        outlined
                        v-model="layer.choroplethColorPalette"
                        :options="['OrRd', 'BuGn', 'YlOrBr', 'Purples']"
                        label="Color palette"
                        emit-value
                        map-options
                      />
                    </div>
                  </div>
                </q-item-section>
              </q-item>

              <!-- tooltip -->
              <q-tooltip v-if="disableLayers(layer['dggs-id'])">
                The {{ layer["dggs-id"] }} DGGS system is currently not
                supported.
              </q-tooltip>
            </div>
          </q-list>
        </div>
        <!-- list of vector layers -->
        <div>
          <q-item
            v-for="layer in layersVector"
            :key="layer.id"
            tag="label"
            v-ripple
          >
            <q-item-section avatar>
              <q-checkbox
                v-model="layersSelectedVector"
                :val="layer"
                color="primary"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-black">{{ layer.title }}</q-item-label>
              <q-item-label caption>{{ layer.description }}</q-item-label>
            </q-item-section>
          </q-item>
        </div>
        <!-- list of raster layers -->
        <div>
          <q-list>
            <q-item
              v-for="layer in layersRaster"
              :key="layer.id"
              tag="label"
              v-ripple
            >
              <q-item-section avatar>
                <q-radio
                  v-model="layerSelectedRaster"
                  :val="layer"
                  color="primary"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ layer.title }}</q-item-label>
                <q-item-label caption>{{ layer.description }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
var filter = require("lodash.filter");
var cloneDeep = require("lodash.clonedeep");

const staticLayers = [
  {
    id: "countries",
    title: "Countries of the World",
    description: "List of all countries of the World from public source",
    attributions: "",
    url: "https://openlayers.org/en/latest/examples/data/geojson/countries.geojson",
    type: "vector", // available values: vector, raster, wms, tms
    format: "geojson",
    projection: "EPSG:4326",
  },
  {
    id: "osm",
    title: "Open Street Map",
    description:
      "Collaborative project to create a free editable geographic database of the world",
    attributions: "",
    url: "https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    type: "raster", // available values: vector, raster, wms, tms
    format: "png",
    projection: "EPSG:4326",
  },
  {
    id: "esri_world_imagery",
    title: "ESRI World Imagery",
    description: "ESRI World Imagery",
    attributions:
      "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}.png",
    type: "raster", // available values: vector, raster, wms, tms
    format: "png",
    projection: "EPSG:4326",
  },
  {
    id: "wikimedia",
    title: "Wikimedia maps",
    description: "A general colour map wikimedia maps",
    attributions: "",
    url: "https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png",
    type: "raster", // available values: vector, raster, wms, tms
    format: "png",
    projection: "EPSG:4326",
  },
  {
    id: "cartodb",
    title: "CartoDB Light",
    description: "Good for sticking color star ratings over the top of.",
    attributions: "",
    url: "https://{a-c}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
    type: "raster", // available values: vector, raster, wms, tms
    format: "png",
    projection: "EPSG:4326",
  },
  {
    id: "argistopomap",
    title: "ArcGIS World Topo Map",
    description: "ArcGIS REST tile services are supported by ol/source/XYZ",
    attributions: "",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    type: "raster", // available values: vector, raster, wms, tms
    format: "png",
    projection: "EPSG:4326",
  },
];

export default {
  name: "LayersList",

  components: {},

  data() {
    return {
      rangesMode: [
        { label: "equidistant", value: "e" },
        { label: "quantile", value: "q" },
      ],
      layersAll: staticLayers,
      layersDGGS: [],
      layerSelectedRaster: null,
      layersSelectedVector: [],
      layersSelectedDGGS: [],
    };
  },

  watch: {
    // watch for selected vector layers
    layersSelectedVector(newValue, oldValue) {
      this.addSelectedLayersVector(this.layersSelectedVector);
    },

    // watch for selected raster layers
    layerSelectedRaster(newValue, oldValue) {
      this.addSelectedLayersRaster(this.layerSelectedRaster);
    },

    // watch for selected DGGS layers
    layersSelectedDGGS: {
      handler(newValue, oldValue) {
        let selectedDGGSlayers = cloneDeep(this.layersSelectedDGGS);
        this.addSelectedLayersDGGS(selectedDGGSlayers);
      },
      deep: true,
    },
  },

  created() {
    // set default raster layer
    let layerRasterDefault = filter(this.layersAll, function (layer) {
      return layer.id === "osm";
    });
    this.layerSelectedRaster = layerRasterDefault[0];
    this.getDGGSlayersList();
  },

  methods: {
    // add selected raster layers to Vuex
    addSelectedLayersRaster(selectedLayer) {
      this.$store.commit("layers/SET_LAYERS_SELECTED_RASTER", selectedLayer);
    },

    // add selected vector layers to Vuex
    addSelectedLayersVector(selectedLayers) {
      this.$store.commit("layers/SET_LAYERS_SELECTED_VECTOR", selectedLayers);
    },

    // add selected DGGS layer to Vuex
    addSelectedLayersDGGS(selectedLayers) {
      this.$store.commit("layers/SET_LAYERS_SELECTED_DGGS", selectedLayers);
    },

    // check is layers is selected
    layerSelected(layer) {
      if (
        this.layersSelectedVector.includes(layer) ||
        this.layersSelectedDGGS.includes(layer)
      ) {
        return true;
      } else {
        return false;
      }
    },

    // get DGGS layers
    getDGGSlayersList() {
      this.loading = true;
      let ref = this;
      this.$axios
        .get("https://dggs-api-bozea3cspa-ew.a.run.app/dggs-api/collections", {
          params: {},
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          // save layers received from API
          let layers = response.data["dggs-list"];
          // adding additional fields to each layer
          layers.forEach((layer, i, arr) => {
            layer.level = "3";
            layer.opacity = 0.7;
            layer.choroplethStatus = false;
            layer.choroplethParameter = "";
            layer.choroplethRanges = 5;
            layer.choroplethRangesMode = "q";
            layer.choroplethColorPalette = "OrRd";
            layer.zIndex = i + 2;
          });
          ref.layersDGGS = layers;
          // stop loading progress
          ref.loading = false;
        })
        .catch(function (error) {
          // stop loading progress
          ref.loading = false;
        });
    },

    // disable layers wich are not H3
    disableLayers(dggsID) {
      if (dggsID !== "H3") {
        return true;
      } else {
        return false;
      }
    },

    // filter levels of hexagons depends on zoom
    filterHexLevels(array, zoom) {
      console.log("zoom: " + zoom);
      var levels = [];
      if (zoom <= 9) {
        levels = array.filter(function (level) {
          return level <= 6;
        });
        return levels;
      }
      if (zoom <= 10) {
        levels = array.filter(function (level) {
          return level <= 7;
        });
        return levels;
      }
      if (zoom <= 11) {
        levels = array.filter(function (level) {
          return level <= 8;
        });
        return levels;
      }
      if (zoom <= 18) {
        levels = array.filter(function (level) {
          return level;
        });
        return levels;
      }
      return levels;
    },
  },

  computed: {
    currentRouterPath: function () {
      return this.$route.path;
    },

    layersVector: function () {
      let allLayers = this.layersAll;
      let vectorLayers = filter(allLayers, function (layer) {
        return layer.type === "vector";
      });
      return vectorLayers;
    },

    layersRaster: function () {
      let allLayers = this.layersAll;
      let rasterLayers = filter(allLayers, function (layer) {
        return layer.type === "raster";
      });
      return rasterLayers;
    },

    // map zoom
    mapZoom: function () {
      return this.$store.state.layers.zoom;
    },
  },
};
</script>

<style scoped></style>
