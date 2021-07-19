import { URL } from 'url'
import { parse } from 'ipaddr.js'
import QuickLRU from 'quick-lru'
import normalizeUrl from './utils/normalize-url'
import httpClientGen from './utils/http-client'
import dnsCacheGen from './utils/dns-lookup'
import canonicize from './utils/canonicize'

export default ({
  normalizeUrlOptions = {
    forceHttps: true,
    stripHash: true,
    removeQueryParameters: []
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
  dnsCacheStore = new QuickLRU({ maxSize: 100000 }) // this is out of the "got" configuration since it's used for manual DNS lookups as well
}) => {
  const dnsCache = dnsCacheGen(dnsCacheStore)
  const httpClient = httpClientGen({ ...gotOptions, dnsCache })
  const normalize = normalizeUrl(normalizeUrlOptions)

  // Normalize URL so that we can search by URL.
  return async function normalizePlus(url = '') {
    let link

    // 1. "Base" normalization using normalize-url
    // When an invalid link is passed, it will throw.
    link = normalize(url)

    // 2. To prevent Server Side Request Forgery, we need to check the protocol.
    // Otherwise, you could end up making requests to internal services (e.g. the database)
    // that are within the same network but is not intended to be reached by the user.
    if (!allowedProtocols.some(protocol => link.startsWith(protocol)))
      throw new Error('Invalid protocol!')

    // 3. Another layer of protection against SSRF - ensure we're not hitting internal services
    const { hostname } = new URL(link)
    const { address } = await dnsCache.lookupAsync(hostname)
    // Try to match "reserved" IP ranges: https://en.wikipedia.org/wiki/Reserved_IP_addresses
    // https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html#case-2-application-can-send-requests-to-any-external-ip-address-or-domain-name
    // The function returns 'unicast' or the name of the reserved IP range, should it match any.
    // This in effect blocks all private IP Range: https://git.io/JWy3u, https://git.io/JWy3b
    if (parse(address).range() !== 'unicast')
      throw new Error('The IP of the domain is reserved!')

    // 4. Follow redirects to deal with "intermediate" links (such as the links on google search results)
    const res = await httpClient.get(link)
    link = normalize(res.url)

    // 5. Look for the canonical link (also un-AMP-ifies the canonical link)
    // Not writing a separate metascraper-canonical library for this, as the "standard" way of determining
    // canonical link includes looking at the HTTP header: https://developers.google.com/search/docs/advanced/crawling/consolidate-duplicate-urls
    // // TODO: cache this shit
    link = canonicize(res.body, res.headers, link, normalize)

    // 6. Clear out trackers (utm is taken care of in `normalize-url`, but also there may be other trackers)
    // TODO:
    return link
  }
}
