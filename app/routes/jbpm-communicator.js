const {
  LAND_SUMMARY_URL,
  SCHEME_SELECTION_URL,
  DYNAMIC_FORM_URL,
  SBI_SUMMARY_URL,
  APPLICATION_SUMMARY_URL,
  HOME_URL,
  PROCESS_PENDING_URL
} = require('../constants/endpoints')
const {
  jbpmSaveAnswer,
  jbpmCheckExistingProcesses
} = require('../helpers/JBPM-processes')
const { setYarValue, getYarValue } = require('../helpers/session')

module.exports = [
  {
    method: 'GET',
    path: '/jbpm-status-checker',
    handler: async (request, h) => {
      const sbi = getYarValue(request, 'sbi')

      const redirectUrl = await jbpmCheckExistingProcesses(sbi)

      return {
        redirectUrl
      }
    }
  },
  {
    method: 'POST',
    path: '/jbpm-communicator',
    handler: async (request, h) => {
      const referrerChunks = request.info.referrer.split('/')
      const referrer = referrerChunks[referrerChunks.length - 1]

      let redirectUrl

      switch (referrer) {
        case HOME_URL: {
          const { sbi } = request.payload

          setYarValue(request, 'sbi', sbi)

          const redirectUrl = await jbpmCheckExistingProcesses(sbi)

          return h.redirect(redirectUrl)
        }
        case LAND_SUMMARY_URL: {
          const jbpmTaskId = getYarValue(request, 'jbpmTaskId')

          const data = {
            summaryAnswerList: Object.keys(request.payload).map((key) => ({
              answer: request.payload[key],
              id: key
            }))
          }

          await jbpmSaveAnswer(jbpmTaskId, data)

          redirectUrl = PROCESS_PENDING_URL
          break
        }

        case SCHEME_SELECTION_URL:
          redirectUrl = DYNAMIC_FORM_URL
          break

        case DYNAMIC_FORM_URL: {
          const jbpmTaskId = getYarValue(request, 'jbpmTaskId')

          const data = {
            summaryAnswerList: Object.keys(request.payload).map((key) => ({
              answer: request.payload[key],
              id: key
            }))
          }

          await jbpmSaveAnswer(jbpmTaskId, data)

          redirectUrl = SBI_SUMMARY_URL
          break
        }
        case SBI_SUMMARY_URL:
          redirectUrl = APPLICATION_SUMMARY_URL
          break

        default:
          redirectUrl = HOME_URL
          break
      }

      return h.redirect(redirectUrl)
    }
  }
]
