const viewTemplate = 'unhandled-error'

module.exports = {
  method: 'GET',
  path: '/unhandled-error',
  handler: (request, h) => {
    return h.view(viewTemplate)
  }
}
