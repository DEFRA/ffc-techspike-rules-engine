const { SCHEME_SELECTION_URL } = require('../constants/endpoints')
const {
  ARABLE_LAND_SCHEME,
  GRASSLAND_SCHEME,
  MOORLAND_SCHEME,
  SCHEME_DISPLAY_NAME_DICTIONARY,
  SCHEME_DISPLAY_TEXT_DICTIONARY,
  SCHEME_DISPLAY_HINT_DICTIONARY
} = require('../constants/services-dictionary')
const { jbpmLoadInProgressProcess } = require('../helpers/JBPM-processes')
const { getYarValue } = require('../helpers/session')

const viewTemplate = 'standards-selection'

module.exports = {
  method: 'GET',
  path: `/${SCHEME_SELECTION_URL}`,
  handler: async (request, h) => {
    const jbpmProcessId = getYarValue(request, 'jbpmProcessId')

    if (!jbpmProcessId) {
      return 'Please return to start and enter SBI'
    }

    const inProgressProcess = await jbpmLoadInProgressProcess(jbpmProcessId)

    const { schemes } = inProgressProcess
    let availableSchemes = schemes.map((scheme) => ({
      value: scheme,
      text: SCHEME_DISPLAY_TEXT_DICTIONARY[scheme],
      hint: {
        text: [SCHEME_DISPLAY_HINT_DICTIONARY[scheme]]
      }
    }))

    availableSchemes = [...new Set(availableSchemes.map(obj => JSON.stringify(obj)))].map(str => JSON.parse(str))

    return h.view(viewTemplate, {
      ARABLE_LAND_SCHEME,
      GRASSLAND_SCHEME,
      MOORLAND_SCHEME,
      SCHEME_DISPLAY_NAME_DICTIONARY,
      availableSchemes
    })
  }
}
