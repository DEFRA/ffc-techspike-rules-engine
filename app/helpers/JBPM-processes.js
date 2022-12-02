const axios = require("axios");
const parseString = require("xml2js").parseString;

const {
  JBPM_START_ELIGIBILITY_PROCESS,
  JBPM_LOAD_IN_PROGRESS_PROCESS,
  AUTH_HEADER,
  JBPM_SEARCH_PROCESS_BY_IDENTIFIER,
  JBPM_COMPLETE_SUMMARY_ANSWER,
} = require("../constants/endpoints");
const {
  PENDING,
  ACTIVE,
  COMPLETED,
  ABORTED,
  SUSPENDED,
} = require("../constants/JBPM-process-statuses");
const { generateChoiceOptions } = require("./generateChoiceOptions");

const jbpmSearchProcessByIdentifier = async (sbi) =>
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
      return response.data["process-instance"];
    });

const jbpmStartEligibilityProcess = async (sbi) =>
  await axios
    .post(
      JBPM_START_ELIGIBILITY_PROCESS,
      {
        sbi,
        processPrefix: process.env.PROCESS_SUFFIX,
      },
      AUTH_HEADER
    )
    .then(async (response) => {
      return response.data;
    })
    .catch(function (error) {
      console.log(error);
    });

const jbpmLoadInProgressProcess = async (sbi) => {
  let totalParcels = 0;
  let totalLand = 0;
  const totals = {};
  const questionsList = [];

  await axios
    .get(JBPM_LOAD_IN_PROGRESS_PROCESS(sbi), AUTH_HEADER)
    .then((response) => {
      const { landList, summaryQuestionList } =
        response.data["process-instance-variables"];

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
    });

  return { totalParcels, totalLand, totals, questionsList };
};

const jbpmSaveAnswer = async (taskId, data) => {
  await axios.put(JBPM_COMPLETE_SUMMARY_ANSWER(taskId), data, AUTH_HEADER);
};

const jbpmStartNewProcess = () => {};

const jbpmCreateNewProcess = () => {};

module.exports = {
  jbpmSearchProcessByIdentifier,
  jbpmStartEligibilityProcess,
  jbpmStartNewProcess,
  jbpmCreateNewProcess,
  jbpmLoadInProgressProcess,
  jbpmSaveAnswer,
};
