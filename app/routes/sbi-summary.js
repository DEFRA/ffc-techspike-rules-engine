const { SBI_SUMMARY_URL } = require("../constants/endpoints");

const viewTemplate = "sbi-summary";

module.exports = {
  method: "GET",
  path: `/${SBI_SUMMARY_URL}`,
  handler: (request, h) => {
    return h.view(viewTemplate);
  },
};
