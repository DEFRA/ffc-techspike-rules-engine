module.exports = {
  method: 'GET',
  path: '/assets/{path*}',
  options: {
    auth: false,
    handler: {
      directory: {
        path: ['app/frontend/dist', 'node_modules/govuk-frontend/govuk/assets'],
        listing: true
      }
    },
    cache: {
      privacy: 'private'
    }
  }
}
