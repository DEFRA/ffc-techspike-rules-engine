const axios = require('axios')
const parseString = require('xml2js').parseString

const {
  JBPM_START_ELIGIBILITY_PROCESS,
  JBPM_LOAD_IN_PROGRESS_PROCESS_WITH_VARS,
  AUTH_HEADER,
  JBPM_SEARCH_PROCESS_BY_IDENTIFIER,
  JBPM_COMPLETE_SUMMARY_ANSWER,
  LAND_SUMMARY_URL,
  PROCESS_PENDING_URL,
  SCHEME_SELECTION_URL,
  JBPM_LOAD_IN_PROGRESS_PROCESS
} = require('../constants/endpoints')
const {
  PENDING,
  ACTIVE,
  COMPLETED,
  ABORTED,
  SUSPENDED
} = require('../constants/JBPM-process-statuses')
const { generateChoiceOptions } = require('./generateChoiceOptions')

const jbpmSearchProcessByIdentifier = async (sbi) =>
  await axios
    .get(
      JBPM_SEARCH_PROCESS_BY_IDENTIFIER(sbi, [
        PENDING,
        ACTIVE,
        COMPLETED,
        ABORTED,
        SUSPENDED
      ]),
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

const jbpmLoadInProgressProcess = async (sbi) => {
  let totalParcels = 0
  let totalLand = 0
  const totals = {}
  const questionsList = []
  let schemes = []

  await axios
    .get(JBPM_LOAD_IN_PROGRESS_PROCESS_WITH_VARS(sbi), AUTH_HEADER)
    .then((response) => {
      const { landList, summaryQuestionList, schemeEligibilityListP } =
        response.data['process-instance-variables']

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

  return { totalParcels, totalLand, totals, questionsList, schemes }
}

const jbpmSaveAnswer = async (jbpmProcessId, data) => {
  if (!jbpmProcessId) {
    return false
  }

  const res = await axios
    .put(JBPM_COMPLETE_SUMMARY_ANSWER(jbpmProcessId), data, AUTH_HEADER)
    .catch((err) => {
      console.log(err)
    })

  return res
}

const jbpmCheckExistingProcesses = async (sbi) => {
  const runningInstances = await jbpmSearchProcessByIdentifier(sbi)

  if (!runningInstances && !runningInstances.length) {
    await jbpmStartEligibilityProcess()
    return h.redirect(PROCESS_PENDING_URL)
  }

  const latestRunningInstace = runningInstances
    .sort((a, b) => new Date(a['start-date']) - new Date(b['start-date']))
    .reverse()[0]

  // handle  latestRunningInstace["process-instance-state" undefined

  const responseData = jbpmGetProcessStatus(
    474 /* latestRunningInstace["process-instance-id"] */
  )

  const redirectUrl = jbpmLatestProcessRunningInstance(
    latestRunningInstace,
    responseData
  )

  return redirectUrl
}

const jbpmGetProcessStatus = async (sbi) =>
  await axios
    .get(JBPM_LOAD_IN_PROGRESS_PROCESS(sbi), AUTH_HEADER)
    .then((response) => {
      const parsedResponse = {}

      response.data['variable-instance'].forEach((statusData) => {
        if (
          [
            'leastOneParcelEligible',
            'validSummaryAnswers',
            'parcelDetailsReceived'
          ].includes(statusData.name)
        ) {
          parsedResponse[statusData.name] = statusData.value
        }
      })

      return parsedResponse
    })

const jbpmLatestProcessRunningInstance = (
  latestRunningInstace,
  responseData
) => {
  let redirectUrl = `/${LAND_SUMMARY_URL}`

  if (typeof latestRunningInstace['process-instance-state'] === 'undefined') {
    jbpmStartEligibilityProcess()
    redirectUrl = PROCESS_PENDING_URL
  }

  switch (latestRunningInstace['process-instance-state']) {
    case PENDING:
      redirectUrl = PROCESS_PENDING_URL
      break

    case ACTIVE:
      if (!responseData?.parcelDetailsReceived) {
        redirectUrl = PROCESS_PENDING_URL
      }

      if (
        typeof latestRunningInstace !== 'undefined' &&
        latestRunningInstace['task-id']
      ) {
        redirectUrl = `/${LAND_SUMMARY_URL}`
      }
      break

    case COMPLETED:
      if (!responseData?.leastOneParcelEligible) {
        jbpmStartEligibilityProcess()
        redirectUrl = PROCESS_PENDING_URL
      }

      if (!responseData?.validSummaryAnswers) {
        jbpmStartEligibilityProcess()
        redirectUrl = PROCESS_PENDING_URL
      }

      if (responseData.validSummaryAnswers) {
        redirectUrl = SCHEME_SELECTION_URL
      }
      break
  }

  return redirectUrl
}

module.exports = {
  jbpmSearchProcessByIdentifier,
  jbpmStartEligibilityProcess,
  jbpmCheckExistingProcesses,
  jbpmLoadInProgressProcess,
  jbpmSaveAnswer
}
