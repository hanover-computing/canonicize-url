import type { BeforeRequestHook } from 'got'

import getDebug from '../lib/debug.js'
import { providers } from '../data/index.js'
import cleanUrl from '../lib/clear-url.js'

const debug = getDebug('hooks:handle-redirections')

// Handles redirections that would normally require user interaction
// e.g. youtube outbound links.
export const handleRedirections: BeforeRequestHook = options => {
  // Even the got author himself casts this incorrect type: https://github.com/sindresorhus/got/blob/b1d61c173a681755ac23afb2f155f08801c1e7e4/source/core/index.ts#L1121
  const url = (options.url as URL).toString()

  const cleanedUrl = cleanUrl(url, providers, true)

  debug('Replaced URL %s with %s', url, cleanedUrl)
  options.url = new URL(cleanedUrl)
}
