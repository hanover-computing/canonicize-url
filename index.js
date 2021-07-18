import normalizeUrl from 'normalize-url'
import { lookup } from 'dns/promises'
import { parse } from 'ipaddr.js'
// import got from 'got'

export default ({
  normalizeUrlOptions = {
    forceHttps: true,
    stripHash: true,
    removeQueryParameters: [/^utm_\w+/i]
  },
  allowedProtocols = ['https://']
  // cache = new Map()
}) => {
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
    const noProtocol = normalizeUrl(pass1, {
      ...normalizeUrlOptions,
      stripProtocol: true
    })
    const { address } = await lookup(noProtocol)
    // Try to match "reserved" IP ranges: https://en.wikipedia.org/wiki/Reserved_IP_addresses
    // https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html#case-2-application-can-send-requests-to-any-external-ip-address-or-domain-name
    // The function returns 'unicast' or the name of the reserved IP range, should it match any.
    // This in effect blocks all private IP Range: https://git.io/JWy3u, https://git.io/JWy3b
    if (parse(address).range() !== 'unicast')
      throw new Error('The IP of the domain is reserved!')

    // 4.
    // - canonical tag (need to actually visit the website for this - use fetch/axios/got/etc)
    // - clear out trackers (utm is taken care of in `normalize-url`, but also there may be other trackers)
    // - un-AMP-ify links
    // - "Follow" links to deal with "intermediate" links (e.g. links on Google search engine) - this would also require us to actually visit the website for this
  }
}
