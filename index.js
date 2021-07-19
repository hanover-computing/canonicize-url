import { URL } from 'url'
import normalizeUrl from 'normalize-url'
import { parse } from 'ipaddr.js'
import got from 'got'
import CacheableLookup from 'cacheable-lookup'
import QuickLRU from 'quick-lru'

export default ({
  normalizeUrlOptions = {
    forceHttps: true,
    stripHash: true,
    removeQueryParameters: [/^utm_\w+/i]
  },
  allowedProtocols = ['https://'],
  gotOptions = {
    cache: new QuickLRU({ maxSize: 100 }),
    followRedirect: true,
    maxRedirects: 10,
    httpsOptions: {
      rejectUnauthorized: true
    },
    hooks: [],
    timeout: {
      request: 10000 // global timeout
    }
  },
  dnsCache = new QuickLRU({ maxSize: 100000 }) // this is out of the "got" configuration since it's used for manual DNS lookups as well
}) => {
  const cachedLookup = new CacheableLookup({ cache: dnsCache })
  const httpClient = got.extend({ ...gotOptions, dnsCache: cachedLookup })

  // Normalize URL so that we can search by URL.
  return async function normalizePlus(url = '') {
    // 1. "Base" normalization using normalize-url
    // When an invalid link is passed, it will throw.
    const pass1 = normalizeUrl(url, normalizeUrlOptions)

    // 2. To prevent Server Side Request Forgery, we need to check the protocol.
    // Otherwise, you could end up making requests to internal services (e.g. the database)
    // that are within the same network but is not intended to be reached by the user.
    if (!allowedProtocols.some(protocol => pass1.startsWith(protocol)))
      throw new Error('Invalid protocol!')

    // 3. Another layer of protection against SSRF - ensure we're not hitting internal services
    const { hostname } = new URL(pass1)
    const { address } = await cachedLookup.lookupAsync(hostname)
    // Try to match "reserved" IP ranges: https://en.wikipedia.org/wiki/Reserved_IP_addresses
    // https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html#case-2-application-can-send-requests-to-any-external-ip-address-or-domain-name
    // The function returns 'unicast' or the name of the reserved IP range, should it match any.
    // This in effect blocks all private IP Range: https://git.io/JWy3u, https://git.io/JWy3b
    if (parse(address).range() !== 'unicast')
      throw new Error('The IP of the domain is reserved!')

    // 4. "Follow" links to deal with "intermediate" links (such as the links on google search results)
    // eslint-disable-next-line no-unused-vars
    const { url: pass2, body } = await httpClient.get(pass1)

    // 5. Look for the canonical link (and if present, exit early)

    // 6. Clear out trackers (utm is taken care of in `normalize-url`, but also there may be other trackers)

    // 7. un-AMP-ify links
  }
}
