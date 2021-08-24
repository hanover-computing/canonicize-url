import QuickLRU from 'quick-lru'
import CacheableLookup from 'cacheable-lookup'
import normalizeUrl from './utils/normalize-url'
import httpClientGen from './utils/http-client'
import canonicize from './utils/canonicize'

export default (
  globalOpts = {
    normalizeUrlOptions: {
      forceHttps: true,
      stripHash: true,
      removeQueryParameters: []
    },
    gotOptions: {
      followRedirect: true,
      maxRedirects: 10,
      httpsOptions: {
        rejectUnauthorized: true
      },
      throwHttpErrors: true,
      timeout: {
        request: 14000 // global timeout
      },
      dnsCache: new CacheableLookup({
        cache: new QuickLRU({ maxSize: 10000 })
      }),
      cache: new QuickLRU({ maxSize: 1000 }),
      ssrfProtection: true
      // for production, set proxyUrl to avoid SSRF: https://github.com/apify/got-scraping#got-scraping-extra-options
    },
    allowedProtocols: ['http://', 'https://']
  }
) => {
  const httpClient = httpClientGen(globalOpts)
  const normalize = normalizeUrl(globalOpts.normalizeUrlOptions)

  // Normalize URL so that we can search by URL.
  async function normalizePlus(url = '') {
    let link

    // 1. "Base" normalization using normalize-url
    // When an invalid link is passed, it will throw.
    link = normalize(url, false) // simple normalization to start off with

    // 4. Follow redirects to deal with "intermediate" links (such as the links on google search results)
    const res = await httpClient.get(link)
    link = normalize(res.url, true) // strip off trackers to serve as "base"

    // 5. Look for the canonical link (also un-AMP-ifies the canonical link)
    // Not writing a separate metascraper-canonical library for this, as the "standard" way of determining
    // canonical link includes looking at the HTTP header: https://developers.google.com/search/docs/advanced/crawling/consolidate-duplicate-urls
    // // TODO: cache this shit
    link = canonicize(res.body, res.headers, link, normalize)

    return link

    // TODO: literally just embed the list of tracked URLs in the database right within the library layer so that we can run a similarity search?
  }

  // this HTTP Client contains URL normalization, SSRF protection, etc
  return { normalizePlus, httpClient }
}
