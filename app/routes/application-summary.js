const viewTemplate = "application-summary";

module.exports = {
  method: "GET",
  path: "/application-summary",
  handler: (request, h) => {
    return h.view(viewTemplate);
  },
};
