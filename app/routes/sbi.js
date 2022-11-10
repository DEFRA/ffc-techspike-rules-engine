const Joi = require("joi");
const { setYarValue, getYarValue } = require("../helpers/session");

const viewTemplate = "sbi";
const sbiData = {
  1: {
    properties: [
      {
        name: "property 1",
      },
      {
        name: "property 2",
      },
    ],
  },
  2: {
    properties: [
      {
        name: "property 3",
      },
      {
        name: "property 4",
      },
    ],
  },
};

module.exports = [
  {
    method: "GET",
    path: "/sbi/",
    handler: (request, h) => {
      const sbiID = getYarValue(request, "sbiID");
      const properties = sbiData[sbiID].properties;

      return h.view(viewTemplate, { properties, sbiID });
    },
  },
  {
    method: "POST",
    path: "/sbi",
    options: {
      validate: {
        options: { abortEarly: false },
        payload: Joi.object({
          sbiID: Joi.string().required(),
        }),
        failAction: (request, h, err) => {
          return "oh dear";
        },
      },
      handler: async (request, h) => {
        const { sbiID } = request.payload;

        setYarValue(request, "sbiID", sbiID);

        return h.view(viewTemplate, { sbiID });
      },
    },
  },
];
