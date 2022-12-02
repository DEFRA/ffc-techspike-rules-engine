const {
  LAND_SUMMARY_URL,
  SCHEME_SELECTION_URL,
  DYNAMIC_FORM_URL,
  SBI_SUMMARY_URL,
  APPLICATION_SUMMARY_URL,
  HOME_URL,
  WAITING_SCREEN,
} = require("../constants/endpoints");
const {
  PENDING,
  ACTIVE,
  COMPLETED,
} = require("../constants/JBPM-process-statuses");
const {
  jbpmSaveAnswer,
  jbpmSearchProcessByIdentifier,
  jbpmStartNewProcess,
  jbpmCreateNewProcess,
} = require("../helpers/JBPM-processes");
const { setYarValue, getYarValue } = require("../helpers/session");

const axios = require("axios").default;

const viewTemplate = "home";

module.exports = [
  {
    method: "GET",
    path: "/status-checker",
    handler: async (request, h) => {
      return {
        redirectUrl: "qwer",
      };
    },
  },
  {
    method: "POST",
    path: "/jbpm-communicator",
    handler: async (request, h) => {
      const referrerChunks = request.info.referrer.split("/");
      const referrer = referrerChunks[referrerChunks.length - 1];

      let redirectUrl;

      switch (referrer) {
        case HOME_URL: {
          const { sbi } = request.payload;

          let redirectUrl = `/${LAND_SUMMARY_URL}`;

          setYarValue(request, "sbi", sbi);

          const runningInstances = await jbpmSearchProcessByIdentifier(sbi);

          if (!runningInstances && !runningInstances.length) {
            await jbpmStartNewProcess();
            return h.redirect(WAITING_SCREEN);
          }

          const latestRunningInstace = runningInstances
            .sort(
              (a, b) => new Date(a["start-date"]) - new Date(b["start-date"])
            )
            .reverse()[0];

          //handle  latestRunningInstace["process-instance-state" undefined

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
                jbpmStartNewProcess();
              }

              if (
                typeof latestRunningInstace !== "undefined" &&
                !latestRunningInstace["validSummaryAnswers"]
              ) {
                // create new process
                jbpmCreateNewProcess();
              }

              if (
                typeof latestRunningInstace !== "undefined" &&
                latestRunningInstace["validSummaryAnswers"]
              ) {
                redirectUrl = SCHEME_SELECTION_URL;
              }
              break;
          }

          return h.redirect(redirectUrl);
        }
        case LAND_SUMMARY_URL: {
          const sbi = getYarValue(request, "sbi");
          const data = {
            summaryAnswerList: Object.keys(request.payload).map((key) => ({
              answer: request.payload[key],
              id: key,
            })),
          };

          await jbpmSaveAnswer(sbi, data);
          redirectUrl = SCHEME_SELECTION_URL;
          break;
        }

        case SCHEME_SELECTION_URL:
          redirectUrl = DYNAMIC_FORM_URL;
          break;

        case DYNAMIC_FORM_URL:
          redirectUrl = SBI_SUMMARY_URL;
          break;

        case SBI_SUMMARY_URL:
          redirectUrl = APPLICATION_SUMMARY_URL;
          break;

        default:
          redirectUrl = HOME_URL;
          break;
      }

      return h.redirect(redirectUrl);
    },
  },
];
