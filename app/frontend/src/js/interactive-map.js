import 'ol/ol.css'
import Map from 'ol/Map'
import View from 'ol/View'
import { defaults } from 'ol/interaction'
import { initiateMap } from './map-static'
import { buildRasterLayers, tilegrid } from './layers/raster-layers'
import { buildParcelLayers } from './layers/parcel-layers'

export function displayInteractiveMap (
  apiKey,
  sfi,
  parcels,
  amendedParcels,
  coordinates,
  selectedParcels = [],
  allowSelect = false,
  target = 'map'
) {
  initiateMap('parcelCoverMap', apiKey, coordinates)

  const rasterLayer = buildRasterLayers(apiKey)
  const { parcelLayer, parcelSource } = buildParcelLayers(parcels)

  const view = new View({
    center: coordinates,
    zoom: 7,
    extent: [-238375.0, 0.0, 900000.0, 1376256.0],
    resolutions: tilegrid.getResolutions()
  })

  const map = new Map({
    // eslint-disable-line no-unused-vars
    interactions: defaults({
      dragPan: false
    }),
    layers: [...rasterLayer, parcelLayer],
    target,
    view
  })

  map
    .getView()
    .fit(parcelSource.getExtent(), { size: map.getSize(), maxZoom: 16 })
  selectMapStyle(rasterLayer)
}
