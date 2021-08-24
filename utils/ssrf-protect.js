import { URL } from 'url'
import { parse } from 'ipaddr.js'

// Assume all URLs are properly formed at this point
export default function ssrfHookGen(globalOpts) {
  return async function (options) {
    if (!options.ssrfProtection) return

    const url = options.url

    // To prevent Server Side Request Forgery, we need to check the protocol.
    // Otherwise, you could end up making requests to internal services (e.g. the database)
    // that are within the same network but is not intended to be reached by the user.
    if (globalOpts.allowedProtocols) {
      if (
        !globalOpts.allowedProtocols.some(protocol => url.startsWith(protocol))
      )
        throw new Error('Invalid protocol!')
    }

    if (globalOpts.gotOptions.dnsCache) {
      // Another layer of protection against SSRF - ensure we're not hitting internal services
      const { hostname } = new URL(url)
      const { address } = await globalOpts.gotOptions.dnsCache.lookupAsync(
        hostname
      )
      // Try to match "reserved" IP ranges: https://en.wikipedia.org/wiki/Reserved_IP_addresses
      // https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html#case-2-application-can-send-requests-to-any-external-ip-address-or-domain-name
      // The function returns 'unicast' or the name of the reserved IP range, should it match any.
      // This in effect blocks all private IP Range: https://git.io/JWy3u, https://git.io/JWy3b
      if (parse(address).range() !== 'unicast')
        throw new Error('The IP of the domain is reserved!')
    }
  }
}
