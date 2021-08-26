import { URL } from 'url'
import { lookup as nativeLookup } from 'dns/promises'

export default dnsCache => {
  const lookup = dnsCache ? dnsCache.lookupAsync : nativeLookup

  return async url => {
    try {
      const { hostname } = new URL(url)
      await lookup(hostname)
      return true
    } catch (err) {
      return false
    }
  }
}
