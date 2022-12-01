const generateChoiceOptions = (field) => {
  if (["CheckBox", "RadioGroup"].includes(field.fieldType)) {
    field.items = field.choiceOptions.split(";").map((option) => {
      const options = option.split(":");

      return {
        value: options[0],
        text: options[1],
      };
    });
  }

  return field;
};

module.exports = { generateChoiceOptions };
