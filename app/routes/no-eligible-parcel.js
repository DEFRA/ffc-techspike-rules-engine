const viewTemplate = 'no-eligible-parcel'

module.exports = {
  method: 'GET',
  path: '/no-eligible-parcel',
  handler: (request, h) => {
    return h.view(viewTemplate)
  }
}
