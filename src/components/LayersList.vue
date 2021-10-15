<template>
  <div>
    <transition
      appear
      enter-active-class="animated fadeIn"
      leave-active-class="animated fadeOut"
    >
      <div v-if="currentRouterPath === '/map'">
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
  },

  created() {
    // set default raster layer
    let layers = this.$store.state.layers.layersAll;
    let layerRasterDefault = filter(layers, function (layer) {
      return layer.id === "osm";
    });
    this.layerSelectedRaster = layerRasterDefault[0];
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
  },

  computed: {
    layersAll: function () {
      return this.$store.state.layers.layersAll;
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
