import got from 'got'

import { overrideSettings } from './hooks/settings.js'

export const canonicizeUrl = got.extend({
  hooks: {
    init: [overrideSettings]
  }
})
