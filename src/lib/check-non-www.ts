import getDebug from './debug.js'
import clearWWW from './clear-www.js'

export type DNSLookup = (url: string) => Promise<unknown>

const debug = getDebug('lib:check-non-www')

/**
 * Checks whether a given URL can be reached via its non-WWW host.
 *
 * @param url the URL to check
 * @param dnsLookup the function to use for looking up DNS addresses
 * @returns whether the non-WWW host can be reached
 */
export default async function checkNonWWW(
  url: URL,
  dnsLookup: DNSLookup
): Promise<boolean> {
  const nonWWWHostname = clearWWW(url.hostname)

  try {
    await dnsLookup(nonWWWHostname)

    debug('Non-WWW hostname can be reached')
    return true
  } catch (err) {
    debug('Non-WWW hostname cannot be reached')
    return false
  }
}
