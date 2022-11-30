const { SCHEME_SELECTION_URL } = require("../constants/endpoints");
const {
  ARIABLE_LAND_SCHEME,
  GRASSLAND_SCHEME,
  MOORLAND_SCHEME,
  SCHEME_DISPLAY_DICTIONARY,
} = require("../constants/services-dictionary");

const viewTemplate = "standards-selection";

module.exports = {
  method: "GET",
  path: `/${SCHEME_SELECTION_URL}`,
  handler: (request, h) => {
    return h.view(viewTemplate, {
      ARIABLE_LAND_SCHEME,
      GRASSLAND_SCHEME,
      MOORLAND_SCHEME,
      SCHEME_DISPLAY_DICTIONARY,
    });
  },
};
