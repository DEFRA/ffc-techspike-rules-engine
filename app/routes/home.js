const viewTemplate = "home";

module.exports = {
  method: "GET",
  path: "/",
  handler: (request, h) => {
    //send BMI to jbpm endpoint and get list of land parcels

    return h.view(viewTemplate);
  },
};
