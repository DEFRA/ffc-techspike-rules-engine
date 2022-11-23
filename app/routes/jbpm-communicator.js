const axios = require("axios").default;

const viewTemplate = "home";

module.exports = {
  method: "POST",
  path: "/jbpm-communicator",
  handler: async (request, h) => {
    const referrerChunks = request.info.referrer.split("/");
    const referrer = referrerChunks[referrerChunks.length - 1];

    let redirectUrl;

    switch (referrer) {
      case "land-summary":
        redirectUrl = "standards-selection";
        break;
      case "standards-selection":
        redirectUrl = "form";
        break;
      case "form":
        redirectUrl = "sbi-summary";
        break;
      case "sbi-summary":
        redirectUrl = "application-summary";
        break;
      default:
        redirectUrl = "/";
        break;
    }

    return h.redirect(redirectUrl);
  },
};
