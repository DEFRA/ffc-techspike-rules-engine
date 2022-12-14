const GRASSLAND_SCHEME = 'Grassland Scheme'
const ARABLE_LAND_SCHEME = 'Arable Land Scheme'
const MOORLAND_SCHEME = 'Moorland Scheme'

const SCHEME_DISPLAY_NAME_DICTIONARY = {
  [GRASSLAND_SCHEME]: 'Grassland',
  [ARABLE_LAND_SCHEME]: 'Arable Land',
  [MOORLAND_SCHEME]: 'Moorland'
}

const SCHEME_DISPLAY_TEXT_DICTIONARY = {
  [GRASSLAND_SCHEME]: 'Improved Grassland soils',
  [ARABLE_LAND_SCHEME]: 'Arable and Horticultural soils',
  [MOORLAND_SCHEME]: 'Moorland soils'
}

const SCHEME_DISPLAY_HINT_DICTIONARY = {
  [GRASSLAND_SCHEME]: '£28.00 to £58.00 per hectare per year based on what actions you do',
  [ARABLE_LAND_SCHEME]:
    '£22.00 of £40.00 per hectare per year based on what actions you do.',
  [MOORLAND_SCHEME]: '£X.00 to £X.00 per hectare per year based on what actions you do'
}

module.exports = {
  ARABLE_LAND_SCHEME,
  GRASSLAND_SCHEME,
  MOORLAND_SCHEME,
  SCHEME_DISPLAY_NAME_DICTIONARY,
  SCHEME_DISPLAY_TEXT_DICTIONARY,
  SCHEME_DISPLAY_HINT_DICTIONARY
}
