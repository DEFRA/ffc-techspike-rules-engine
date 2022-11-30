const { HOME_URL } = require("../constants/endpoints");

const viewTemplate = "home";

module.exports = {
  method: "GET",
  path: `/${HOME_URL}`,
  handler: (request, h) => {
    //send BMI to jbpm endpoint and get list of land parcels

    return h.view(viewTemplate);
  },
};
