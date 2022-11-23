const viewTemplate = "standards-selection";

module.exports = {
  method: "GET",
  path: "/standards-selection",
  handler: (request, h) => {
    return h.view(viewTemplate);
  },
};
