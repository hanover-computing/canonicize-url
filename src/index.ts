import got from 'got'

import { overrideSettings } from './hooks/settings.js'
import { handleRedirections } from './hooks/handle-redirections.js'
import { preferNonWww } from './hooks/prefer-non-www.js'

export const canonicizeUrl = got.extend({
  hooks: {
    init: [overrideSettings],
    beforeRequest: [handleRedirections, preferNonWww]
  }
})
