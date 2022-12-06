const { APPLICATION_SUMMARY_URL } = require('../constants/endpoints')

const viewTemplate = 'application-summary'

module.exports = {
  method: 'GET',
  path: `/${APPLICATION_SUMMARY_URL}`,
  handler: (request, h) => {
    return h.view(viewTemplate)
  }
}
