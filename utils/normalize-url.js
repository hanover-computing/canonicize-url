import normalizeUrl from 'normalize-url'
import stripTrackers from './strip-trackers.js'
import { URL } from 'url'

export default function gen(normalizeUrlOptions, dnsLookup, httpClient) {
  return async function normalize(originalUrl) {
    // We default to non-www, https links
    const preferredOptions = {
      stripWWW: true,
      forceHttps: true
    }
    // always strip trackers for consistency (even if it means worse performance)!
    const cleanUrl = stripTrackers(originalUrl)

    // Pass 1: try to force as much normalization as possible, knowing that this may break some links
    let url = normalizeUrl(cleanUrl, {
      ...normalizeUrlOptions,
      ...preferredOptions
    })

    // Check 1: if the www-stripped domain exists...
    if (originalUrl.includes('www')) {
      const { hostname } = new URL(url)
      try {
        await dnsLookup(hostname)
      } catch (err) {
        // Pass 2: we can't resolve the www-stripped host at the DNS level, so we enable it
        preferredOptions.stripWWW = false
        url = normalizeUrl(originalUrl, {
          ...normalizeUrlOptions,
          ...preferredOptions
        })
      }
    }

    // Check 2: if the site doesn't support HTTPS...
    try {
      await httpClient.head(url)
    } catch (err) {
      // Pass 3: we can't reach the URL via HTTP HEAD request, so try downgrading to http
      preferredOptions.forceHttps = false
      url = normalizeUrl(cleanUrl, {
        ...normalizeUrlOptions,
        ...preferredOptions
      })
    }

    return url
  }
}
