import { URL } from 'url'

export default dnsCache => {
  return async url => {
    if (!dnsCache) return true

    try {
      const { hostname } = new URL(url)
      await dnsCache.lookupAsync(hostname)
      return true
    } catch (err) {
      return false
    }
  }
}
