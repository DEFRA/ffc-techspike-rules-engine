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

module.exports = {
  method: "GET",
  path: "/{formId}",
  handler: async (request, h) => {
    // return await fetch(endpoint)
    //   .then((response) => response.json())
    //   .then(({ fields }) => {

    return h.view(viewTemplate, { formId: request.params.formId, fields });
    // })
    // .catch((err) => console.log(err));
  },
};
