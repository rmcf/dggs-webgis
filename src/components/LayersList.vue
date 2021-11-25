<template>
  <div>
    <transition
      appear
      enter-active-class="animated fadeIn"
      leave-active-class="animated fadeOut"
    >
      <div v-if="currentRouterPath === '/map'">
        <!-- spinnner -->
        <transition
          appear
          enter-active-class="animated fadeIn"
          leave-active-class="animated fadeOut"
        >
          <div
            v-if="layersLoading"
            style="
              height: 30px;
              position: relative;
              margin-top: 1rem;
              margin-bottom: 1rem;
            "
          >
            <q-inner-loading :showing="layersLoading">
              <q-spinner-ios color="primary" size="30px" />
            </q-inner-loading>
          </div>
        </transition>
        <!-- list of DGGS layers -->
        <div v-if="!layersLoading">
          <q-list>
            <div v-for="layer in layersDGGS" :key="layer.id">
              <!-- checkbox and label -->
              <q-item tag="label" class="row items-start">
                <!-- checkbox -->
                <q-item-section avatar>
                  <q-checkbox
                    v-model="layersSelectedDGGS"
                    :disable="disableLayers(layer.crs)"
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
                  <!-- opacity and level of hexagons -->
                  <div class="row q-col-gutter-sm q-mb-sm">
                    <!-- opacity -->
                    <div class="col-6">
                      <q-select
                        dense
                        outlined
                        v-model="layer.opacity"
                        :options="[
                          0, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1,
                        ]"
                        :label="$t('opacity')"
                      />
                    </div>
                    <!-- level of hexagons -->
                    <div class="col-6">
                      <q-select
                        dense
                        outlined
                        v-model="layer.level"
                        :options="layer.levels"
                        :label="$t('level')"
                      />
                    </div>
                  </div>

                  <!-- z-index -->
                  <div class="q-mb-sm">
                    <q-select
                      dense
                      outlined
                      v-model="layer.zIndex"
                      :options="[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]"
                      :label="$t('z_index')"
                      emit-value
                      map-options
                    />
                  </div>

                  <!-- choropleth parameters -->
                  <div
                    v-for="choroplethProperty in layerChoroplethParameters"
                    :key="choroplethProperty.layerID"
                  >
                    <div
                      v-if="choroplethProperty.layerID === layer.id"
                      class="q-mb-sm"
                    >
                      <!-- choropleth parameter -->
                      <div class="q-mb-sm">
                        <q-select
                          dense
                          outlined
                          v-model="layer.choroplethParameter"
                          :options="choroplethProperty.choroplethParameters"
                          :label="$t('choropleth_parameter')"
                        />
                      </div>

                      <div v-if="layer.choroplethParameter !== ''">
                        <!-- choropleth scale type -->
                        <div class="q-mb-sm">
                          <q-select
                            dense
                            outlined
                            emit-value
                            map-options
                            @update:model-value="changeColorPalette(layer.id)"
                            v-model="layer.choroplethScale"
                            :options="[
                              { label: $t('continuous'), value: 'continuous' },
                              { label: $t('classified'), value: 'classified' },
                            ]"
                            :label="$t('choropleth_scale_type')"
                          />
                        </div>

                        <div
                          v-if="layer.choroplethScale === 'continuous'"
                          class="q-mb-sm"
                        >
                          <!-- chropleth ranges mode -->
                          <div>
                            <q-select
                              dense
                              outlined
                              v-model="layer.choroplethRangesMode"
                              :options="[
                                { label: $t('equidistant'), value: 'e' },
                                { label: $t('quantile'), value: 'q' },
                              ]"
                              :label="$t('classification')"
                              emit-value
                              map-options
                            />
                          </div>
                        </div>

                        <!-- chropleth classes quantity -->
                        <div
                          v-if="layer.choroplethScale === 'continuous'"
                          class="q-mb-sm"
                        >
                          <q-select
                            dense
                            outlined
                            v-model="layer.choroplethRanges"
                            :options="[2, 3, 4, 5, 6, 7, 8, 9, 10]"
                            :label="$t('classes')"
                          />
                        </div>

                        <!-- chropleth color continuous palette -->
                        <div
                          v-if="layer.choroplethScale === 'continuous'"
                          class="q-mb-sm"
                        >
                          <q-select
                            dense
                            outlined
                            v-model="layer.choroplethColorPalette"
                            :options="['OrRd', 'BuGn', 'YlOrBr']"
                            :label="$t('color_palette')"
                            emit-value
                            map-options
                          />
                        </div>

                        <!-- chropleth color classified palette -->
                        <div
                          v-if="layer.choroplethScale === 'classified'"
                          class="q-mb-sm"
                        >
                          <q-select
                            dense
                            outlined
                            v-model="layer.choroplethColorPalette"
                            :options="[
                              'BrBG',
                              'PiYG',
                              'PRGn',
                              'PuOr',
                              'RdBu',
                              'RdGy',
                              'RdYlBu',
                              'RdYlGn',
                            ]"
                            label="Color palette"
                            emit-value
                            map-options
                          />
                        </div>

                        <!-- choropleth zero values -->
                        <div class="q-mb-sm">
                          <q-toggle
                            v-model="layer.choroplethParameterZeroValue"
                            checked-icon="check"
                            color="primary"
                            label="zero values"
                            unchecked-icon="clear"
                          />
                        </div>

                        <!-- choropleth labels -->
                        <div class="q-mb-sm">
                          <q-checkbox
                            v-model="layer.choroplethLabels"
                            :label="$t('labels')"
                          />
                        </div>

                        <!-- choropleth legend -->
                        <div>
                          <div
                            v-for="choroplethProperty in layerChoroplethParameters"
                            :key="choroplethProperty.layerID"
                          >
                            <div v-if="choroplethProperty.layerID === layer.id">
                              <!-- colors and values -->
                              <div
                                v-for="(
                                  range, index
                                ) in choroplethProperty.choroplethLegend"
                                :key="index"
                              >
                                <div class="row items-center q-mb-xs">
                                  <div
                                    style="width: 50px; height: 25px"
                                    :style="'background-color:' + range.color"
                                  ></div>
                                  <div class="q-ml-md">
                                    {{ range.value }}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </q-item-section>
              </q-item>
              <!-- tooltip -->
              <q-tooltip v-if="disableLayers(layer.crs)">
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
var max = require("lodash.max");

// relations between H3-level & hex area
const h3LevelHexArea = [
  { h3level: 2, hexArea: 69000 }, // h3 official: 86745
  { h3level: 3, hexArea: 10000 }, // h3 official: 12392
  { h3level: 4, hexArea: 1350 }, // h3 official: 1770
  { h3level: 5, hexArea: 190 }, // h3 official: 252
  { h3level: 6, hexArea: 27 }, // h3 official: 36
  { h3level: 7, hexArea: 4 }, // h3 official: 5
  { h3level: 8, hexArea: 0.6 }, // h3 official: 0.74
];

const staticLayers = [
  // {
  //   id: "countries",
  //   title: "Countries of the World",
  //   description: "List of all countries of the World from public source",
  //   attributions: "",
  //   url: "https://openlayers.org/en/latest/examples/data/geojson/countries.geojson",
  //   type: "vector", // available values: vector, raster, wms, tms
  //   format: "geojson",
  //   projection: "EPSG:4326",
  // },
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
      collectionsAPI:
        "https://dggs-api-bozea3cspa-ew.a.run.app/dggs-api/collections",
      layersAll: staticLayers,
      layersDGGS: [],
      layerSelectedRaster: null,
      layersSelectedVector: [],
      layersSelectedDGGS: [],
      layersLoading: true,
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
        // this.addSelectedLayersDGGS(selectedDGGSlayers);
        this.$store.commit(
          "layers/SET_LAYERS_SELECTED_DGGS",
          selectedDGGSlayers
        );
      },
      deep: true,
    },

    // whatch for map area changes
    mapZoom(newValue, oldValue) {
      if (this.layersSelectedDGGS.length > 0) {
        this.layersDGGS.forEach((layer) => {
          layer.levels = this.layerAvailableeReslutions(
            layer.resolutions,
            this.mapArea
          );
          layer.level = max(
            this.layerAvailableeReslutions(layer.resolutions, this.mapArea)
          );
        });
      }
    },
  },

  created() {
    // set default raster layer
    let layerRasterDefault = filter(this.layersAll, function (layer) {
      return layer.id === "esri_world_imagery";
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

    // layer available resolutions
    layerAvailableeReslutions(levelResolutions, area) {
      // layer H3 resolution in number format
      // const layerH3Resolutions = levelResolutions.map((level) => {
      //   return Number(level);
      // });

      // temporal constant array
      // ============================================================
      const layerH3Resolutions = [2, 3, 4, 5, 6, 7, 8];
      // calculated available H3 resolutions for layer
      const availableLeveles = [];
      // calculating available levels
      layerH3Resolutions.forEach((resolution) => {
        let h3Level = filter(h3LevelHexArea, function (level) {
          return level.h3level === resolution;
        });
        let hexQuantity = area / h3Level[0].hexArea;
        // console.log(h3Level[0].h3level + " : " + hexQuantity);
        if (hexQuantity < 3000) {
          availableLeveles.push(resolution);
        }
      });
      return availableLeveles;
    },

    // get DGGS layers
    getDGGSlayersList() {
      let ref = this;
      this.$axios
        .get(ref.collectionsAPI, {
          params: {},
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          // save layers received from API
          let layers = response.data.collections;
          // adding additional fields to each layer
          layers.forEach((layer, i, arr) => {
            layer.type = "vector";
            layer.level = 4;
            layer.levels = [2, 3, 4, 5];
            layer.opacity = 0.7;
            layer.choroplethParameter = "";
            layer.choroplethParameterZeroValue = true;
            layer.choroplethScale = "continuous"; // "continuous", "classified"
            layer.choroplethRanges = 5;
            layer.choroplethRangesMode = "q";
            layer.choroplethLabels = false;
            layer.choroplethColorPalette = "YlOrBr";
            layer.zIndex = i + 2;
          });
          ref.layersDGGS = layers;
          // stop loading progress
          ref.layersLoading = false;
        })
        .catch(function (error) {
          // stop loading progress
          ref.layersLoading = false;
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

    // change color palettes for "continuous" and "classified"
    changeColorPalette(layerID) {
      let layers = filter(this.layersDGGS, { id: layerID });
      let layer = layers[0];
      if (layer.choroplethScale === "classified") {
        layer.choroplethColorPalette = "YlOrBr";
      } else layer.choroplethColorPalette = "RdBu";
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

    // layer choropleth parameters
    layerChoroplethParameters: function () {
      return this.$store.state.layers.layerChoroplethParameters;
    },

    // map area
    mapArea: function () {
      return this.$store.state.layers.mapArea;
    },
  },
};
</script>

<style scoped></style>
