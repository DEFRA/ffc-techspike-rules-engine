const { PROCESS_PENDING_URL } = require("../constants/endpoints");

module.exports = {
  method: "GET",
  path: `/${PROCESS_PENDING_URL}`,
  handler: (request, h) => {
    return h.view("process-pending");
  },
};
