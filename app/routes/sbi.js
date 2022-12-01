// const Joi = require("joi");
const { LAND_SUMMARY_URL } = require("../constants/endpoints");
const { setYarValue } = require("../helpers/session");

module.exports = {
  method: "POST",
  path: "/sbi",
  options: {
    validate: {
      options: { abortEarly: false },
      // payload: Joi.object({
      //   sbiID: Joi.string().required(),
      // }),
      failAction: (request, h, err) => {
        return "sbiID not supplied";
      },
    },
    handler: async (request, h) => {
      const { sbi } = request.payload;

      setYarValue(request, "sbi", sbi);

      return h.redirect(`/${LAND_SUMMARY_URL}`);
    },
  },
};
