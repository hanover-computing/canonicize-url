import getDebug from './debug.js'

import type { Provider } from '../data/index.js'

const debug = getDebug('lib:clear-url')

/**
 * Consumes the clearURLs "providers" dataset to clean the URL.
 *
 * Shamelessly adopted from https://gitlab.com/CrunchBangDev/cbd-cogs/-/blob/master/Scrub/scrub.py
 *
 * @param initialUrl the url to check
 * @param providers the list of providers to check
 * @param redirectOnly whether to only look at redirects (and skip tracker stripping)
 * @returns cleaned URL (or the provided URL, if nothing matches)
 */
export function cleanUrl(
  initialUrl: string,
  providers: Provider[],
  redirectOnly: boolean
): string {
  let url = initialUrl

  // Go through the list of providers and check if there's any match
  for (const provider of providers) {
    if (!provider.urlPattern.test(url)) continue
    debug('Found a matching provider %s', provider.name)

    // completeProvider is a boolean that determines if every url that
    // matches will be blocked. If you want to specify rules, exceptions
    // and/or redirections, the value of completeProvider must be false.
    if (provider.completeProvider) {
      debug('Halting request due to matching completeProvider')
      throw new Error('Link is blocked')
    }

    // If any exceptions are matched, this provider is skipped
    const exceptionMatched = (provider.exceptions || []).some(exception =>
      exception.test(url)
    )
    if (exceptionMatched) {
      debug('Matched an exception; skipping provider')
      continue
    }

    // We return the first redirect that we match
    for (const redirection of provider.redirections || []) {
      const match = redirection.exec(url)
      if (!match || match.length <= 1) continue

      const newUrl = decodeURIComponent(match[1]!)

      debug('Matched a redirect %s', newUrl)
      return newUrl
    }

    // If we want to check only for redirects, don't run the rest of the code
    if (redirectOnly) continue

    // Explode query paramters to be checked against rules
    const parsedUrl = new URL(url)

    // Check regular rules
    for (const rule of provider.rules || []) {
      for (const param of parsedUrl.searchParams.keys()) {
        if (!rule.test(param)) continue

        debug('Matched rule for query parameter %s', param)
        parsedUrl.searchParams.delete(param)
      }
    }

    // Check referral marketing rules
    for (const rule of provider.referralMarketing || []) {
      for (const param of parsedUrl.searchParams.keys()) {
        if (!rule.test(param)) continue

        debug('Matched marketing rule for query parameter %s', param)
        parsedUrl.searchParams.delete(param)
      }
    }

    // At this point, all of the querystrings *should* be sorted by normalize-url (the vanilla one)

    // Rebuild valid URI string with remaining query parameters
    url = parsedUrl.toString()
    debug('Reformed URL %s', url)

    // Strip raw fragments with rawRules
    for (const rule of provider.rawRules || []) {
      url = url.replace(rule, '')
      debug('Stripped raw fragment %s', rule)
    }
  }

  return url
}
