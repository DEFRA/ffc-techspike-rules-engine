const {
  LAND_SUMMARY_URL,
  SCHEME_SELECTION_URL,
  DYNAMIC_FORM_URL,
  SBI_SUMMARY_URL,
  APPLICATION_SUMMARY_URL,
  HOME_URL,
  PROCESS_PENDING_URL
} = require('../constants/endpoints')
const { PENDING, ACTIVE, COMPLETED, ABORTED, SUSPENDED } = require('../constants/JBPM-process-statuses')
const {
  jbpmSaveAnswer,
  jbpmSearchProcessByIdentifier,
  jbpmStartEligibilityProcess,
  jbpmLoadInProgressProcess
} = require('../helpers/JBPM-processes')
const { setYarValue, getYarValue } = require('../helpers/session')

module.exports = [
  {
    method: 'GET',
    path: '/jbpm-status-checker',
    handler: async (request, h) => {
      const jbpmProcessId = getYarValue(request, 'jbpmProcessId')
      let redirectUrl

      const responseData = await jbpmLoadInProgressProcess(jbpmProcessId)

      if (!responseData) {
        redirectUrl = 'unhandled-error'
      } else {
        switch (responseData.processInstanceState) {
          case PENDING:
            redirectUrl = PROCESS_PENDING_URL
            break

          case ACTIVE:
            if (typeof responseData.parcelDetailsReceived !== 'undefined' && responseData.parcelDetailsReceived === 'false') {
              redirectUrl = PROCESS_PENDING_URL
              break
            }

            if (
              typeof responseData !== 'undefined' &&
              responseData.jbpmTaskId
            ) {
              setYarValue(request, 'jbpmTaskId', responseData.jbpmTaskId)
              redirectUrl = `${LAND_SUMMARY_URL}`
            }
            break

          case COMPLETED:
            if (typeof responseData.leastOneParcelEligible !== 'undefined' && responseData.leastOneParcelEligible === 'false') {
              redirectUrl = 'no-eligible-parcel'
              break
            }

            if (typeof responseData.validSummaryAnswers !== 'undefined' && responseData.validSummaryAnswers === 'false') {
              redirectUrl = 'cannot-proceed'
              break
            }

            if (responseData.validSummaryAnswers === 'true') {
              redirectUrl = SCHEME_SELECTION_URL
            }
            break

          case SUSPENDED:
          case ABORTED: {
            redirectUrl = 'unhandled-error'
            break
          }
        }
      }

      return {
        redirectUrl: `${process.env.BASE_URL}/${redirectUrl}`
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

          const runningInstances = await jbpmSearchProcessByIdentifier(sbi, [
            ACTIVE,
            COMPLETED,
            PENDING
          ])

          const latestRunningInstace = runningInstances
            .sort((a, b) => new Date(a['start-date']) - new Date(b['start-date']))
            .reverse()[0]

          let jbpmProcessId

          if (!runningInstances.length) {
            jbpmProcessId = await jbpmStartEligibilityProcess(sbi)
          } else {
            jbpmProcessId = latestRunningInstace['process-instance-id']
          }

          const responseData = await jbpmLoadInProgressProcess(
            jbpmProcessId
          )

          if (typeof responseData.processInstanceState === 'undefined') {
            jbpmProcessId = await jbpmStartEligibilityProcess(sbi)

            setYarValue(request, 'jbpmProcessId', jbpmProcessId)

            redirectUrl = PROCESS_PENDING_URL
          } else {
            switch (responseData.processInstanceState) {
              case PENDING:
                redirectUrl = PROCESS_PENDING_URL
                break

              case ACTIVE:
                if (typeof responseData.parcelDetailsReceived !== 'undefined' && responseData.parcelDetailsReceived === 'false') {
                  redirectUrl = PROCESS_PENDING_URL
                  break
                }

                if (responseData.jbpmTaskId) {
                  setYarValue(request, 'jbpmTaskId', responseData.jbpmTaskId)
                  setYarValue(request, 'jbpmProcessId', jbpmProcessId)
                  redirectUrl = `${LAND_SUMMARY_URL}`
                }
                break

              case COMPLETED:
                if (typeof responseData.leastOneParcelEligible !== 'undefined' && responseData.leastOneParcelEligible === 'false') {
                  jbpmProcessId = await jbpmStartEligibilityProcess(sbi)

                  setYarValue(request, 'jbpmProcessId', jbpmProcessId)

                  redirectUrl = PROCESS_PENDING_URL
                  break
                }

                if (typeof responseData.validSummaryAnswers !== 'undefined' && responseData.validSummaryAnswers === 'false') {
                  jbpmProcessId = await jbpmStartEligibilityProcess(sbi)

                  setYarValue(request, 'jbpmProcessId', jbpmProcessId)

                  redirectUrl = PROCESS_PENDING_URL
                  break
                }

                if (responseData.validSummaryAnswers === 'true') {
                  setYarValue(request, 'jbpmProcessId', jbpmProcessId)
                  redirectUrl = SCHEME_SELECTION_URL
                }
                break

              case SUSPENDED:
              case ABORTED: {
                const jbpmProcessId = await jbpmStartEligibilityProcess(sbi)

                setYarValue(request, 'jbpmProcessId', jbpmProcessId)

                redirectUrl = PROCESS_PENDING_URL
                break
              }
            }
          }

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
