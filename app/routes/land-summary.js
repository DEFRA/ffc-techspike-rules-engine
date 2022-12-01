const axios = require("axios");
const parseString = require("xml2js").parseString;

const {
  LAND_SUMMARY_URL,
  JBPM_START_POC_ELIGIBILITY_PROCESS,
  JBPM_LOAD_IN_PROGRESS_PROCESS,
  HOME_URL,
  AUTH_HEADER,
} = require("../constants/endpoints");
const { generateChoiceOptions } = require("../helpers/generateChoiceOptions");
const { getYarValue } = require("../helpers/session");

module.exports = [
  {
    method: "GET",
    path: `/${LAND_SUMMARY_URL}`,
    handler: async (request, h) => {
      const sbi = getYarValue(request, "sbi");

      // if (!sbi) {
      //   return h.redirect(`/${HOME_URL}`);
      // }

      let totalParcels = 0;
      let totalLand = 0;
      const totals = {};

      return await axios
        .post(
          JBPM_START_POC_ELIGIBILITY_PROCESS,
          {
            sbi,
            processPrefix: process.env.PROCESS_SUFFIX,
          },
          AUTH_HEADER
        )
        .then(async (response) => {
          return await axios
            .get(JBPM_LOAD_IN_PROGRESS_PROCESS(response.data), AUTH_HEADER)
            .then((response) => {
              let { landList, summaryQuestionList } =
                response.data["process-instance-variables"];
              let questionsList = [];

              parseString(summaryQuestionList, (err, result) => {
                if (err) {
                  return;
                }
                result.summaryQuestionList.summaryQuestionList.forEach(
                  ({ choiceOptions, fieldType, id, text }) => {
                    questionsList.push(
                      generateChoiceOptions({
                        choiceOptions: choiceOptions[0],
                        fieldType: fieldType[0],
                        fieldId: id[0],
                        fieldLabel: text[0],
                      })
                    );
                  }
                );
              });

              parseString(landList, (err, result) => {
                if (err) {
                  return;
                }
                totalParcels = result.landList.landList.length;
                result.landList.landList.forEach((ll) => {
                  const parcelArea = ll.parcelArea[0];
                  const landType = ll.landType[0];
                  const landCover = ll.landCover[0];
                  const groupName = `${landCover} ${landType}`;
                  totalLand += +parcelArea;
                  if (typeof totals[groupName] === "undefined") {
                    totals[groupName] = {
                      parcels: 0,
                      hectares: 0,
                    };
                  }
                  totals[groupName].parcels++;
                  totals[groupName].hectares += +parcelArea;
                });
              });

              return h.view("land-summary", {
                totalParcels,
                totalLand,
                totals,
                questionsList,
              });
            });
        })
        .catch(function (error) {
          console.log(error);
        });
    },
  },
];
