const viewTemplate = "cannot-proceed";

module.exports = {
  method: "GET",
  path: "/cannot-proceed",
  handler: (request, h) => {
    return h.view(viewTemplate);
  },
};
