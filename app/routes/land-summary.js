const axios = require("axios");

const {
  LAND_SUMMARY_URL,
  JBPM_START_POC_ELIGIBILITY_PROCESS,
  JBPM_LOAD_IN_PROGRESS_PROCESS,
  HOME_URL,
  AUTH_HEADER,
} = require("../constants/endpoints");
const { generateChoiceOptions } = require("../helpers/generateChoiceOptions");
const {
  jbpmLoadInProgressProcess,
  jbpmStartEligibilityProcess,
} = require("../helpers/JBPM-processes");
const { getYarValue } = require("../helpers/session");

module.exports = [
  {
    method: "GET",
    path: `/${LAND_SUMMARY_URL}`,
    handler: async (request, h) => {
      const sbi = getYarValue(request, "sbi");

      const jbpmProcessId = await jbpmStartEligibilityProcess(sbi);

      const inProgressProcess = await jbpmLoadInProgressProcess(jbpmProcessId);
      console.log({ respones: inProgressProcess });

      const { totalParcels, totalLand, totals, questionsList } = inProgressProcess;

      return h.view("land-summary", {
        totalParcels,
        totalLand,
        totals,
        questionsList,
      });
    },
  },
];
