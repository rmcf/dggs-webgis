<template>
  <q-page class="q-pa-lg">
    <div class="text-h4 text-center">Discrete Global Grid (DGG)</div>
    <div class="text-body1 q-mt-md q-mb-md">
      A Discrete Global Grid (DGG) is a mosaic which covers the entire Earth's
      surface. Mathematically it is a space partitioning: it consists of a set
      of non-empty regions that form a partition of the Earth's surface. In a
      usual grid-modeling strategy, to simplify position calculations, each
      region is represented by a point, abstracting the grid as a set of
      region-points. Each region or region-point in the grid is called a cell.
    </div>
    <div class="text-body1 q-mb-md">
      When each cell of a grid is subject to a recursive partition, resulting in
      a "series of discrete global grids with progressively finer resolution",
      forming a hierarchical grid, it is named Hierarchical DGG (sometimes
      "global hierarchical tessellation" or "DGG system").
    </div>
    <div class="text-body1 q-mb-md">
      Discrete Global Grids are used as the geometric basis for the building of
      geospatial data structures. Each cell is related with data objects or
      values, or (in the hierarchical case) may be associated with other cells.
      DGGs have been proposed for use in a wide range of geospatial
      applications, including vector and raster location representation, data
      fusion, and spatial databases.
    </div>
    <div class="text-body1 q-mb-md">
      The most usual grids are for horizontal position representation, using a
      standard datum, like WGS84. In this context, it is common also to use a
      specific DGG as foundation for geocoding standardization. In the context
      of a spatial index, a DGG can assign unique identifiers to each grid cell,
      using it for spatial indexing purposes, in geodatabases or for geocoding.
    </div>
  </q-page>
</template>

<script>
export default {
  name: "About",

  components: {},

  data() {
    return {};
  },

  mounted() {},

  methods: {},

  computed: {},
};
</script>

<style scoped></style>
