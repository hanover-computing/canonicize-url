import normalizeUrl from 'normalize-url'
import stripTrackers from './strip-trackers.js'
import { URL } from 'url'
import logger from './logger.js'

const debug = logger('utils/normalize-url.js')

export default function gen(normalizeUrlOptions, dnsLookup, httpClient) {
  return async function normalize(originalUrl) {
    // We default to non-www, https links
    const preferredOptions = {
      stripWWW: true,
      forceHttps: true
    }

    // Pass 1: try to force as much normalization as possible, knowing that this may break some links
    let url = normalizeUrl(originalUrl, {
      ...normalizeUrlOptions,
      ...preferredOptions
    })
    debug('Normalization pass 1: %s', url)

    // Check 1: if the www-stripped domain exists...
    if (originalUrl.includes('www')) {
      debug('Checking if www-stripped domain exists...')
      const { hostname } = new URL(url)
      try {
        await dnsLookup(hostname)
        debug('www-stripped domain exists!')
      } catch (err) {
        // Pass 2: we can't resolve the www-stripped host at the DNS level, so we enable it
        preferredOptions.stripWWW = false
        url = normalizeUrl(originalUrl, {
          ...normalizeUrlOptions,
          ...preferredOptions
        })
        debug('non-www domain does not exist, using %s', url)
      }
    }

    // Check 2: if the site doesn't support HTTPS...
    debug('Checking if https version exists...')
    try {
      await httpClient.head(url)
      debug('https version exists!')
    } catch (err) {
      // Pass 3: we can't reach the URL via HTTP HEAD request, so try downgrading to http
      preferredOptions.forceHttps = false
      url = normalizeUrl(originalUrl, {
        ...normalizeUrlOptions,
        ...preferredOptions
      })
      debug('https version does not exist, using %s', url)
    }

    // always strip trackers for consistency (even if it means worse performance)!
    debug('stripping trackers from %s', url)
    return stripTrackers(url)
  }
}
