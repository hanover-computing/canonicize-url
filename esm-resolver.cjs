// temporary workaround while we wait for https://github.com/facebook/jest/issues/9771
const resolver = require('enhanced-resolve').create.sync({
  conditionNames: ['require', 'node', 'default'],
  extensions: ['.js', '.json', '.node', '.ts', '.tsx']
})

module.exports = function (request, options) {
  // Jest can't fucking pick up fucking ESM module mocks fucking fuck why the fuck won't it work with custom modules and not built-ins
  if (request.includes('data/loader'))
    request = request.replace('data/loader', 'data/__mocks__/loader.js')

  // list global module that must be resolved by defaultResolver here
  if (
    [
      'dns/promises',
      'dns',
      'util',
      'url',
      'tls',
      'http',
      'https',
      'stream',
      'events',
      'net',
      'fs',
      'path'
    ].includes(request)
  ) {
    return options.defaultResolver(request, options)
  }
  return resolver(options.basedir, request)
}
