import { URL } from 'url'
import { lookup as nativeLookup } from 'dns/promises'
import { promisify } from 'util'
import logger from './logger.js'

const debug = logger('utils/dns-lookup.js')

export default gotOptions => {
  let lookup
  if (gotOptions.dnsCache) {
    debug('Using dnsCache.lookupAsync for DNS lookups')
    lookup = gotOptions.dnsCache.lookupAsync
  } else if (gotOptions.dnsLookup) {
    debug('Promisifying user-provided dnsLookup')
    lookup = promisify(gotOptions.dnsLookup)
  } else {
    debug('dnsCache does not exist, falling back to dns/promises')
    lookup = nativeLookup
  }

  return async url => {
    debug('Looking up DNS for %s', url)
    try {
      const { hostname } = new URL(url)
      await lookup(hostname)
      debug('Lookup of host %s successful', hostname)
      return true
    } catch (err) {
      debug('Lookup of %s unsuccessful', url)
      return false
    }
  }
}
