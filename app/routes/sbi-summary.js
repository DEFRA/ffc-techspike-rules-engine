const viewTemplate = "sbi-summary";

module.exports = {
  method: "GET",
  path: "/sbi-summary",
  handler: (request, h) => {
    return h.view(viewTemplate);
  },
};
