import QuickLRU from 'quick-lru'
import pTimeout from 'p-timeout'
import normalizeUrl from './utils/normalize-url.js'
import httpClientGen from './utils/http-client.js'
import dnsLookupGen from './utils/dns-lookup.js'
import logger from './utils/logger.js'

const debug = logger('index.js')

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
  },
  timeoutMs = 15000 // global timeout for the ENTIRE function, because I'm afraid of blocking the event loop w/ some of the more compute-intensive shit
) => {
  const httpClient = httpClientGen(gotOptions)
  const dnsLookup = dnsLookupGen(gotOptions.dnsCache)
  const normalize = normalizeUrl(normalizeUrlOptions, dnsLookup, httpClient)

  // Normalize URL so that we can search by URL.
  async function normalizePlus(url = '') {
    debug('Normalizing URL %s', url)

    // 1. "Base" normalization using normalize-url + stripping trackers
    // When an invalid link is passed, it will throw.
    const link = await normalize(url)
    debug('Normalization first pass: %s', url)

    // 2. Follow redirects to deal with "intermediate" links (such as the links on google search results)
    const res = await httpClient.get(link, { context: { normalize } })
    debug('Normalization second pass: %s', res.url)

    // At this point, the link will be completely normalized based on canonical links (if one exists)
    return res.url
  }

  return url => pTimeout(normalizePlus(url), timeoutMs)
}
