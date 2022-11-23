import GeoJSON from 'ol/format/GeoJSON'
import { Vector as VectorSource } from 'ol/source'
import { Vector as VectorLayer } from 'ol/layer'
import { landParcelStyles } from '../styles/map-styles'

const buildParcelLayers = (parcels) => {
  const features = new GeoJSON().readFeatures(parcels)
  const parcelSource = new VectorSource({ features })
  const parcelLayer = new VectorLayer({
    source: parcelSource,
    style: landParcelStyles.Polygon
  })

  return { parcelLayer, parcelSource }
}

export {
  buildParcelLayers
}
