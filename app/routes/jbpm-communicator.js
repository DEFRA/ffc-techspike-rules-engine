const {
  LAND_SUMMARY_URL,
  SCHEME_SELECTION_URL,
  DYNAMIC_FORM_URL,
  SBI_SUMMARY_URL,
  APPLICATION_SUMMARY_URL,
  HOME_URL,
} = require("../constants/endpoints");

const axios = require("axios").default;

const viewTemplate = "home";

module.exports = [
  {
    method: "GET",
    path: "/status-checker",
    handler: async (request, h) => {
      return {
        redirectUrl: "qwer",
      };
    },
  },
  {
    method: "POST",
    path: "/jbpm-communicator",
    handler: async (request, h) => {
      const referrerChunks = request.info.referrer.split("/");
      const referrer = referrerChunks[referrerChunks.length - 1];

      let redirectUrl;

      switch (referrer) {
        case LAND_SUMMARY_URL:
          redirectUrl = SCHEME_SELECTION_URL;
          break;
        case SCHEME_SELECTION_URL:
          redirectUrl = DYNAMIC_FORM_URL;
          break;
        case DYNAMIC_FORM_URL:
          redirectUrl = SBI_SUMMARY_URL;
          break;
        case SBI_SUMMARY_URL:
          redirectUrl = APPLICATION_SUMMARY_URL;
          break;
        default:
          redirectUrl = HOME_URL;
          break;
      }

      return h.redirect(redirectUrl);
    },
  },
];
