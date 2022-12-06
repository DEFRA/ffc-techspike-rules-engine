const { setYarValue, getYarValue } = require('../helpers/session')
const {
  SCHEME_DISPLAY_NAME_DICTIONARY
} = require('../constants/services-dictionary')
const {
  SCHEME_SELECTION_URL,
  DYNAMIC_FORM_URL,
  JBPM_DMN_SCHEME_TEMPLATES,
  AUTH_HEADER
} = require('../constants/endpoints')
const { generateChoiceOptions } = require('../helpers/generateChoiceOptions')
const axios = require('axios')

const viewTemplate = 'form'

module.exports = [
  {
    method: 'GET',
    path: `/${DYNAMIC_FORM_URL}`,
    handler: async (request, h) => {
      const selectedSchemes = getYarValue(request, 'selectedSchemes')

      if (!selectedSchemes) {
        return h.redirect(SCHEME_SELECTION_URL)
      }

      return await axios
        .post(
          JBPM_DMN_SCHEME_TEMPLATES,
          {
            'model-namespace':
              'https://kiegroup.org/dmn/_004C4682-598B-4815-B2F9-781D6F4F6E3E',
            'model-name': 'SchemeListTemplateFields',
            'decision-name': 'SchemeListTemplateFields',
            'dmn-context': {
              SchemeListInput: { selectedSchemes }
            }
          },
          AUTH_HEADER
        )
        .then((response) => {
          const decisionResults =
            response.data.result['dmn-evaluation-result'][
              'decision-results'
            ]

          let retrievedFields =
            decisionResults[Object.keys(decisionResults)[0]].result

          if (typeof retrievedFields.length === 'undefined') {
            const originalRetrievedFields = retrievedFields
            retrievedFields = []
            retrievedFields.push(originalRetrievedFields)
          }

          const fields = { shared: [] }

          // add items to combobox and radio groups
          retrievedFields.forEach((retrievedField) => {
            generateChoiceOptions(retrievedField)
          })

          // group fields by sections
          if (
            selectedSchemes &&
            typeof selectedSchemes === 'object' &&
            selectedSchemes.length > 1
          ) {
            retrievedFields.forEach((retrievedField) => {
              // assume that a field without applicable schemes belongs in shared category
              if (retrievedField.applicableSchemes == null) {
                fields.shared.push(retrievedField)
                return
              }

              // if every applicable scheme is in the selected schemes list add it to a shared section
              // if (
              //   retrievedField.applicableSchemes.length > 1 &&
              //   retrievedField.applicableSchemes.every((applicableScheme) =>
              //     selectedSchemes.includes(applicableScheme)
              //   )
              // ) {
              //   fields.shared.push(retrievedField);
              //   return;
              // }

              // group fields base on scheme type
              if (retrievedField.applicableSchemes.length === 1) {
                // if field only has one applicable scheme add it to its own section
                if (!fields[retrievedField.applicableSchemes[0]]) {
                  fields[retrievedField.applicableSchemes[0]] = []
                }
                fields[retrievedField.applicableSchemes[0]].push(
                  retrievedField
                )
                return
              }

              fields.shared.push(retrievedField)
            })
          } else {
            fields.shared = retrievedFields
          }

          return h.view(viewTemplate, {
            formId: request.params.formId,
            fields,
            SCHEME_DISPLAY_NAME_DICTIONARY
          })
        })
    }
  },
  {
    method: 'POST',
    path: `/${DYNAMIC_FORM_URL}`,
    options: {
      handler: async (request, h) => {
        const { selectedSchemes } = request.payload

        setYarValue(request, 'selectedSchemes', selectedSchemes)

        return h.redirect(DYNAMIC_FORM_URL)
      }
    }
  }
]
