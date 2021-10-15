/*
export function someMutation (state) {
}
*/
// set selected vector layers
export function SET_LAYERS_SELECTED_VECTOR(state, layers) {
  state.layersSelectedVector = layers;
}

// set selected vector layers
export function SET_LAYERS_SELECTED_RASTER(state, layer) {
  state.layerSelectedRaster = layer;
}
