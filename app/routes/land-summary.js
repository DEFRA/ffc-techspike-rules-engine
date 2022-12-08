const { LAND_SUMMARY_URL } = require('../constants/endpoints')
const { jbpmLoadInProgressProcess } = require('../helpers/JBPM-processes')
const { getYarValue } = require('../helpers/session')

module.exports = [
  {
    method: 'GET',
    path: `/${LAND_SUMMARY_URL}`,
    handler: async (request, h) => {
      const jbpmProcessId = getYarValue(request, 'jbpmProcessId')
      const jbpmTaskId = getYarValue(request, 'jbpmTaskId')

      if (!jbpmProcessId && !jbpmTaskId) {
        return 'Please return to start and enter SBI'
      }

      const inProgressProcess = await jbpmLoadInProgressProcess(jbpmProcessId)

      const { totalParcels, totalLand, totals, questionsList } =
        inProgressProcess

      return h.view('land-summary', {
        totalParcels,
        totalLand,
        totals,
        questionsList
      })
    }
  }
]
