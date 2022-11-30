const { setYarValue, getYarValue } = require("../helpers/session");
const {
  ARIABLE_LAND_SCHEME,
  GRASSLAND_SCHEME,
  MOORLAND_SCHEME,
  SCHEME_DISPLAY_DICTIONARY,
} = require("../constants/services-dictionary");
const {
  SCHEME_SELECTION_URL,
  DYNAMIC_FORM_URL,
} = require("../constants/endpoints");

const viewTemplate = "form";
const containerID = 0;
const tInstanceId = 0;
const endpoint = `server/containers/${containerID}/forms/tasks/${tInstanceId}`;

const fields = [
  {
    placeHolder: "Reason",
    rows: 4,
    id: "field_332058348325587E12",
    name: "reason",
    label: "Reason",
    required: false,
    readOnly: true,
    validateOnChange: true,
    binding: "reason",
    standaloneClassName: "java.lang.String",
    code: "TextArea",
    serializedFieldClassName:
      "org.kie.workbench.common.forms.fields.shared.fieldTypes.basic.textArea.definition.TextAreaFieldDefinition",
  },
  {
    placeHolder: "Performance",
    maxLength: 100,
    id: "field_336003622256354E12",
    name: "performance",
    label: "Performance",
    required: true,
    readOnly: false,
    validateOnChange: true,
    binding: "performance",
    standaloneClassName: "java.lang.Integer",
    code: "IntegerBox",
    serializedFieldClassName:
      "org.kie.workbench.common.forms.fields.shared.fieldTypes.basic.integerBox.definition.IntegerBoxFieldDefinition",
  },
];

module.exports = [
  {
    method: "GET",
    path: `/${DYNAMIC_FORM_URL}`,
    handler: async (request, h) => {
      const selectedSchemes = getYarValue(request, "selectedSchemes");

      if (!selectedSchemes) {
        return h.redirect(SCHEME_SELECTION_URL);
      }
      // return await fetch(endpoint)
      //   .then((response) => response.json())
      //   .then(({ fields }) => {
      const decisionResults =
        sampleResponse.result["dmn-evaluation-result"]["decision-results"];

      let retrievedFields =
        decisionResults[Object.keys(decisionResults)[0]].result;

      let fields = { shared: [] };

      // add items to combobox and radio groups
      retrievedFields.forEach((retrievedField) => {
        if (["CheckBox", "RadioGroup"].includes(retrievedField.fieldType)) {
          retrievedField.items = retrievedField.choiceOptions
            .split(";")
            .map((option) => {
              const options = option.split(":");

              return {
                value: options[0],
                text: options[1],
              };
            });
        }
      });

      // group fields by sections
      if (
        selectedSchemes &&
        typeof selectedSchemes === "object" &&
        selectedSchemes.length > 1
      ) {
        retrievedFields.forEach((retrievedField) => {
          // assume that a field without applicable schemes belongs in shared category
          if (retrievedField.applicableSchemes == null) {
            fields.shared.push(retrievedField);
            return;
          }

          // group fields base on scheme type
          if (
            retrievedField.applicableSchemes.length === 1
          ) {
            // if field only has one applicable scheme add it to its own section
            if (!fields[retrievedField.applicableSchemes[0]]) {
              fields[retrievedField.applicableSchemes[0]] = [];
            }
            fields[retrievedField.applicableSchemes[0]].push(retrievedField);
            return;
          }

          fields.shared.push(retrievedField);
        });
      } else {
        fields.shared = retrievedFields;
      }

      return h.view(viewTemplate, {
        formId: request.params.formId,
        fields,
        SCHEME_DISPLAY_DICTIONARY,
      });
      // })
    },
  },
  {
    method: "POST",
    path: `/${DYNAMIC_FORM_URL}`,
    options: {
      handler: async (request, h) => {
        const { selectedSchemes } = request.payload;

        setYarValue(request, "selectedSchemes", selectedSchemes);

        return h.redirect(DYNAMIC_FORM_URL);
      },
    },
  },
];
