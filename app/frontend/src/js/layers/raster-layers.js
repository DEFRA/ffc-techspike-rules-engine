import { Tile as TileLayer } from 'ol/layer'
import { XYZ } from 'ol/source'
import TileGrid from 'ol/tilegrid/TileGrid'
import { mapStyles } from './map-style-layers'

const tilegrid = new TileGrid({
  resolutions: [896.0, 448.0, 224.0, 112.0, 56.0, 28.0, 14.0, 7.0, 3.5, 1.75],
  origin: [-238375.0, 1376256.0]
})

const buildRasterLayers = (apiKey) => {
  const layers = []

  const mapStyleLayers = mapStyles.length

  for (let i = 0; i < mapStyleLayers; ++i) {
    layers.push(
      new TileLayer({
        title: 'Road',
        type: 'base',
        visible: false,
        source: new XYZ({
          url: `https://api.os.uk/maps/raster/v1/zxy/${mapStyles[i]}/{z}/{x}/{y}.png?key=${apiKey}`,
          tileGrid: tilegrid
        }),
        className: 'grayscale-invert'
      })
    )
  }

  return layers
}

export {
  buildRasterLayers,
  tilegrid
}
