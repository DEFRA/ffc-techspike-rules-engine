const axios = require('axios')
const parseString = require('xml2js').parseString

const {
  JBPM_START_ELIGIBILITY_PROCESS,
  JBPM_LOAD_IN_PROGRESS_PROCESS_WITH_VARS,
  AUTH_HEADER,
  JBPM_SEARCH_PROCESS_BY_IDENTIFIER,
  JBPM_COMPLETE_SUMMARY_ANSWER
} = require('../constants/endpoints')
const { generateChoiceOptions } = require('./generateChoiceOptions')

const jbpmSearchProcessByIdentifier = async (sbi, statuses) =>
  await axios
    .get(
      JBPM_SEARCH_PROCESS_BY_IDENTIFIER(sbi, statuses),
      AUTH_HEADER
    )
    .then((response) => {
      return response.data['process-instance']
    })

const jbpmStartEligibilityProcess = async (sbi) =>
  await axios
    .post(
      JBPM_START_ELIGIBILITY_PROCESS,
      {
        sbi,
        processPrefix: process.env.PROCESS_SUFFIX
      },
      AUTH_HEADER
    )
    .then(async (response) => {
      return response.data
    })
    .catch(function (err) {
      console.log(err)
    })

const jbpmLoadInProgressProcess = async (jbpmProcessId) => {
  let totalParcels = 0
  let totalLand = 0
  const totals = {}
  const questionsList = []
  let schemes = []
  let jbpmTaskId = null
  let leastOneParcelEligible
  let validSummaryAnswers
  let parcelDetailsReceived
  let processInstanceState

  await axios
    .get(JBPM_LOAD_IN_PROGRESS_PROCESS_WITH_VARS(jbpmProcessId), AUTH_HEADER)
    .then((response) => {
      const { landList, summaryQuestionList, schemeEligibilityListP } =
        response.data['process-instance-variables']

      processInstanceState = response.data['process-instance-state']

      leastOneParcelEligible = response.data['process-instance-variables'].leastOneParcelEligible
      validSummaryAnswers = response.data['process-instance-variables'].validSummaryAnswers
      parcelDetailsReceived = response.data['process-instance-variables'].parcelDetailsReceived

      if (response.data['active-user-tasks'] != null && typeof response.data['active-user-tasks'] !== 'undefined' && response.data['active-user-tasks']['task-summary'] != null && typeof response.data['active-user-tasks']['task-summary'] !== 'undefined') {
        const filteredData = response.data['active-user-tasks']['task-summary'].filter(task => task['task-name'] === 'Get Summary Answer')
        if (filteredData.length) {
          jbpmTaskId = filteredData[0]['task-id']
        }
      }

      parseString(summaryQuestionList, (err, result) => {
        if (err) {
          return
        }
        result.summaryQuestionList.summaryQuestionList.forEach(
          ({ choiceOptions, expectedAnswer, fieldType, id, text }) => {
            questionsList.push(
              generateChoiceOptions({
                choiceOptions: choiceOptions[0],
                fieldType: fieldType[0],
                fieldId: id[0],
                fieldLabel: text[0]
                // expectedAnswer
              })
            )
          }
        )
      })

      parseString(landList, (err, result) => {
        if (err) {
          return
        }
        totalParcels = result.landList.landList.length
        result.landList.landList.forEach((ll) => {
          const parcelArea = ll.parcelArea[0]
          const landType = ll.landType[0]
          const landCover = ll.landCover[0]
          const groupName = `${landCover} ${landType}`
          totalLand += +parcelArea
          if (typeof totals[groupName] === 'undefined') {
            totals[groupName] = {
              parcels: 0,
              hectares: 0
            }
          }
          totals[groupName].parcels++
          totals[groupName].hectares += +parcelArea
        })
      })

      parseString(schemeEligibilityListP, (err, result) => {
        if (err) {
          return
        }

        schemes = result.schemeEligibilityList.schemeEligibilityList
          .filter((scheme) => scheme.eligibility.includes('true'))
          .map((scheme) => scheme.eligibleScheme[0])
      })
    })

  return { totalParcels, totalLand, totals, questionsList, schemes, jbpmTaskId, leastOneParcelEligible, validSummaryAnswers, parcelDetailsReceived, processInstanceState }
}

const jbpmSaveAnswer = async (jbpmTaskId, data) => {
  if (!jbpmTaskId) {
    return false
  }

  const res = await axios
    .put(JBPM_COMPLETE_SUMMARY_ANSWER(jbpmTaskId), data, AUTH_HEADER)
    .catch((err) => {
      console.log(err)
    })

  return res
}

module.exports = {
  jbpmSearchProcessByIdentifier,
  jbpmStartEligibilityProcess,
  jbpmLoadInProgressProcess,
  jbpmSaveAnswer
}
