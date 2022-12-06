const { LAND_SUMMARY_URL } = require('../constants/endpoints')
const {
  jbpmLoadInProgressProcess,
  jbpmStartEligibilityProcess
} = require('../helpers/JBPM-processes')
const { getYarValue, setYarValue } = require('../helpers/session')

module.exports = [
  {
    method: 'GET',
    path: `/${LAND_SUMMARY_URL}`,
    handler: async (request, h) => {
      const sbi = getYarValue(request, 'sbi')

      if (!sbi) {
        return 'Please return to start and enter SBI'
      }

      const jbpmProcessId = await jbpmStartEligibilityProcess(sbi)

      setYarValue(request, 'jbpmProcessId', jbpmProcessId)

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
