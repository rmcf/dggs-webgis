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
            <q-item
              v-for="layer in dggsLayers"
              :key="layer.id"
              tag="label"
              v-ripple
            >
              <q-item-section avatar>
                <q-checkbox
                  v-model="layersSelectedDGGS"
                  :val="layer"
                  color="primary"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-black">{{
                  layer.title
                }}</q-item-label>
                <q-item-label caption>{{ layer.description }}</q-item-label>
              </q-item-section>
            </q-item>
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

export default {
  name: "LayersList",

  components: {},

  data() {
    return {
      layersSelectedVector: [],
      layerSelectedRaster: null,
      layerDGGS: null,
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
    layersSelectedDGGS(newValue, oldValue) {
      this.addSelectedLayersDGGS(this.layersSelectedDGGS);
    },
  },

  created() {
    // set default raster layer
    let layers = this.$store.state.layers.layersAll;
    let layerRasterDefault = filter(layers, function (layer) {
      return layer.id === "osm";
    });
    this.layerSelectedRaster = layerRasterDefault[0];
    this.getDGGSlayersList();
  },

  methods: {
    // add selected vector layers to Vuex
    addSelectedLayersVector(selectedLayers) {
      this.$store.commit("layers/SET_LAYERS_SELECTED_VECTOR", selectedLayers);
    },

    // add selected raster layers to Vuex
    addSelectedLayersRaster(selectedLayer) {
      this.$store.commit("layers/SET_LAYERS_SELECTED_RASTER", selectedLayer);
    },

    // add selected DGGS layer to Vuex
    addSelectedLayersDGGS(selectedLayers) {
      this.$store.commit("layers/SET_LAYERS_SELECTED_DGGS", selectedLayers);
    },

    // add DGGS layers
    addDGGSlayers(layers) {
      this.$store.commit("layers/SET_LAYERS_DGGS", layers);
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
          ref.addDGGSlayers(response.data["dggs-list"]);
          this.loading = false;
        })
        .catch(function (error) {
          this.loading = false;
        });
    },
  },

  computed: {
    layersAll: function () {
      return this.$store.state.layers.layersAll;
    },

    dggsLayers: function () {
      return this.$store.state.layers.layersDGGS;
    },

    layerSelectedDGGS: function () {
      return this.$store.state.layers.layerSelectedDGGS;
    },

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
