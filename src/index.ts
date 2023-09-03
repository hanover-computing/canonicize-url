import got from 'got'

import { overrideSettings } from './hooks/settings.js'
import { handleRedirections } from './hooks/handle-redirections.js'

export const canonicizeUrl = got.extend({
  hooks: {
    init: [overrideSettings],
    beforeRequest: [handleRedirections]
  }
})
