import QuickLRU from 'quick-lru'
import normalizeUrl from './utils/normalize-url.js'
import httpClientGen from './utils/http-client.js'
import dnsLookupGen from './utils/dns-lookup.js'

export default (
  normalizeUrlOptions = {
    stripHash: true,
    removeQueryParameters: []
  },
  gotOptions = {
    followRedirect: true,
    maxRedirects: 10,
    throwHttpErrors: true,
    timeout: {
      request: 14000 // global timeout
    },
    cache: new QuickLRU({ maxSize: 1000 })
  }
) => {
  const httpClient = httpClientGen(gotOptions)
  const dnsLookup = dnsLookupGen(gotOptions.dnsCache)
  const normalize = normalizeUrl(normalizeUrlOptions, dnsLookup, httpClient)

  // Normalize URL so that we can search by URL.
  return async function normalizePlus(url = '') {
    // 1. "Base" normalization using normalize-url + stripping trackers
    // When an invalid link is passed, it will throw.
    const link = await normalize(url)

    // 2. Follow redirects to deal with "intermediate" links (such as the links on google search results)
    const res = await httpClient.get(link, { context: { normalize } })

    // At this point, the link will be completely normalized based on canonical links (if one exists)
    return res.url
  }
}
