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
              <div>
                <q-item tag="label" class="row items-start">
                  <!-- checkbox -->
                  <q-item-section avatar>
                    <q-checkbox
                      v-model="layersSelectedDGGS"
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
              </div>
              <!-- layer properties setting -->
              <q-item class="row items-start">
                <!-- level -->
                <q-item-section avatar> </q-item-section>
                <q-item-section
                  ><div>
                    <q-select
                      dense
                      outlined
                      v-model="layer.level"
                      :options="layer.resolutions"
                      label="Level"
                    /></div></q-item-section
              ></q-item>
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
          let layers = response.data["dggs-list"];
          layers.forEach((layer, i, arr) => {
            layer.level = "3";
            layer.zIndex = i + 2;
            ref.layersDGGS = layers;
          });
          this.loading = false;
        })
        .catch(function (error) {
          this.loading = false;
        });
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
  },
};
</script>

<style scoped></style>
