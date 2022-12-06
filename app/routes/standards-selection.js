const { SCHEME_SELECTION_URL } = require("../constants/endpoints");
const {
  ARIABLE_LAND_SCHEME,
  GRASSLAND_SCHEME,
  MOORLAND_SCHEME,
  SCHEME_DISPLAY_NAME_DICTIONARY,
  SCHEME_DISPLAY_TEXT_DICTIONARY,
  SCHEME_DISPLAY_HINT_DICTIONARY,
} = require("../constants/services-dictionary");
const { jbpmLoadInProgressProcess } = require("../helpers/JBPM-processes");
const { getYarValue } = require("../helpers/session");

const viewTemplate = "standards-selection";

module.exports = {
  method: "GET",
  path: `/${SCHEME_SELECTION_URL}`,
  handler: async (request, h) => {
    const jbpmProcessId = getYarValue(request, "jbpmProcessId");

    if (!jbpmProcessId) {
      return "Please return to start and enter SBI";
    }

    const inProgressProcess = await jbpmLoadInProgressProcess(jbpmProcessId);

    const { schemes } = inProgressProcess;
    const availableSchemes = schemes.map((scheme) => ({
      value: SCHEME_DISPLAY_NAME_DICTIONARY[scheme],
      text: SCHEME_DISPLAY_TEXT_DICTIONARY[scheme],
      hint: {
        text: [SCHEME_DISPLAY_HINT_DICTIONARY[scheme]],
      },
    }));

    return h.view(viewTemplate, {
      ARIABLE_LAND_SCHEME,
      GRASSLAND_SCHEME,
      MOORLAND_SCHEME,
      SCHEME_DISPLAY_NAME_DICTIONARY,
      availableSchemes,
    });
  },
};
