// const Joi = require("joi");
const axios = require("axios");
const parseString = require("xml2js").parseString;

const {
  LAND_SUMMARY_URL,
  JBPM_SEARCH_PROCESS_BY_IDENTIFIER,
  AUTH_HEADER,
  WAITING_SCREEN,
  SCHEME_SELECTION_URL,
} = require("../constants/endpoints");
const {
  PENDING,
  ACTIVE,
  COMPLETED,
  ABORTED,
  SUSPENDED,
} = require("../constants/JBPM-process-statuses");
const { setYarValue } = require("../helpers/session");
const standardsSelection = require("./standards-selection");

module.exports = {
  method: "POST",
  path: "/sbi",
  options: {
    validate: {
      options: { abortEarly: false },
      // payload: Joi.object({
      //   sbiID: Joi.string().required(),
      // }),
      failAction: (request, h, err) => {
        return "sbiID not supplied";
      },
    },
    handler: async (request, h) => {
      const { sbi } = request.payload;

      let redirectUrl = `/${LAND_SUMMARY_URL}`;

      // setYarValue(request, "sbi", sbi);
      await axios
        .get(
          JBPM_SEARCH_PROCESS_BY_IDENTIFIER(sbi, [
            PENDING,
            ACTIVE,
            COMPLETED,
            ABORTED,
            SUSPENDED,
          ]),
          AUTH_HEADER
        )
        .then((response) => {
          const runningInstances = response.data["process-instance"];

          if (!runningInstances) {
          }

          if (runningInstances && runningInstances.length > 0) {
            const latestRunningInstace = runningInstances
              .sort(
                (a, b) => new Date(a["start-date"]) - new Date(b["start-date"])
              )
              .reverse()[0];
            console.log({ latestRunningInstace });

            switch (latestRunningInstace["process-instance-state"]) {
              case PENDING:
                redirectUrl = WAITING_SCREEN;
                break;
              case ACTIVE:
                if (
                  typeof latestRunningInstace !== "undefined" &&
                  typeof latestRunningInstace["parcelDetailsReceived"] !==
                    "undefined" &&
                  !latestRunningInstace["parcelDetailsReceived"]
                ) {
                  redirectUrl = WAITING_SCREEN;
                }
                if (
                  typeof latestRunningInstace !== "undefined" &&
                  latestRunningInstace["task-id"]
                ) {
                  redirectUrl = `/${LAND_SUMMARY_URL}`;
                }
                break;
              case COMPLETED:
                if (
                  typeof latestRunningInstace !== "undefined" &&
                  !latestRunningInstace["leastOneParcelEligible"]
                ) {
                  // start new process
                }

                if (
                  typeof latestRunningInstace !== "undefined" &&
                  !latestRunningInstace["validSummaryAnswers"]
                ) {
                  // create new process
                }

                if (
                  typeof latestRunningInstace !== "undefined" &&
                  latestRunningInstace["validSummaryAnswers"]
                ) {
                  redirectUrl = SCHEME_SELECTION_URL;
                }
                break;
            }
          }
        });

      return h.redirect(redirectUrl);
    },
  },
};
