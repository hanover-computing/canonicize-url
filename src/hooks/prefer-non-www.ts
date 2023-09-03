import { promisify } from 'util'

import { lookup as nativeLookup } from 'dns/promises'
import checkNonWWW, { DNSLookup } from '../lib/check-non-www.js'
import clearWWW from '../lib/clear-www.js'
import getDebug from '../lib/debug.js'

import type { BeforeRequestHook } from 'got'
import type CacheableLookup from 'cacheable-lookup'
import type { IContext } from '../types.js'

const debug = getDebug('hooks:prefer-non-www')

// Checks if the non-WWW version is reachable;
// if so, records it in context, and modifies the request to request the non-WWW version.
export const preferNonWww: BeforeRequestHook = async options => {
  // Copy-pasted from got-ssrf: https://github.com/hanover-computing/got-ssrf/blob/master/index.ts#L16
  let lookup: DNSLookup
  if (options.dnsCache) {
    debug('Using user-provided dnsCache.lookupAsync')
    lookup = (options.dnsCache as CacheableLookup).lookupAsync
  } else if (options.dnsLookup) {
    debug('Promisifying user-provided dnsLookup')
    lookup = promisify(
      options.dnsLookup
    ) as unknown as CacheableLookup['lookupAsync']
  } else {
    debug('Falling back to native dns/promises lookup')
    lookup = nativeLookup
  }

  const originalUrl = options.url as URL
  const nonWWWExists = await checkNonWWW(originalUrl, lookup)

  // Record the hostname observation
  ;(options.context as unknown as IContext).nonWWWExists = nonWWWExists

  // Modify the request to the non-WWW version
  if (nonWWWExists) {
    const newURL = new URL(originalUrl)
    newURL.hostname = clearWWW(newURL.hostname)

    options.url = newURL
  }
}
