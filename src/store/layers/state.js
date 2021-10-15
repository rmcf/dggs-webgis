export default function () {
  return {
    layersSelectedVector: [],
    layerSelectedRaster: null,
    layersAll: [
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
    ],
  };
}
