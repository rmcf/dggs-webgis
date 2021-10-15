<template>
  <q-layout view="hHh Lpr fFf">
    <!-- navbar -->
    <q-header elevated class="bg-grey-1 text-grey-8">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />
        <q-toolbar-title> DGGS web-GIS </q-toolbar-title>
        <div>SPA</div>
      </q-toolbar>
    </q-header>

    <!-- drawer -->
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list class="q-mt-lg">
        <!-- page About link -->
        <q-item
          to="/"
          exact
          clickable
          v-ripple
          :active="link === 'about'"
          @click="link = 'about'"
          active-class="active-link"
        >
          <q-item-section avatar>
            <q-icon name="info_outline" />
          </q-item-section>
          <q-item-section>About project</q-item-section>
        </q-item>

        <!-- page DGGS web-GIS link -->
        <q-item
          to="map"
          exact
          clickable
          v-ripple
          :active="link === 'map'"
          @click="link = 'map'"
          active-class="active-link"
        >
          <q-item-section avatar>
            <q-icon name="public" />
          </q-item-section>
          <q-item-section>DGGS web-GIS</q-item-section>
        </q-item>

        <!-- layers list -->
        <LayersList />
      </q-list>
    </q-drawer>

    <!-- page container -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import LayersList from "components/LayersList.vue";

export default {
  name: "MainLayout",

  components: {
    LayersList,
  },

  data() {
    return {
      leftDrawerOpen: false,
      color: "",
      link: "home",
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

  methods: {},

  computed: {},
};
</script>

<style lang="scss" scoped>
.active-link {
  background-color: $grey-2;
  color: $amber-10;
}
</style>

<style lang="scss"></style>
