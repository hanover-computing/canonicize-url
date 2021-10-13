import QuickLRU from 'quick-lru'
import pTimeout from 'p-timeout'
import normalizeUrl from './utils/normalize-url.js'
import httpClientGen from './utils/http-client.js'
import dnsLookupGen from './utils/dns-lookup.js'
import logger from './utils/logger.js'
import CacheableLookup from 'cacheable-lookup'
import { gotSsrf } from 'got-ssrf'

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
    cache: new QuickLRU({ maxSize: 10000 }),
    dnsCache: new CacheableLookup({ cache: new QuickLRU({ maxSize: 100000 }) })
  },
  timeoutMs = 15000,
  canonicizeMemOpts = { cache: new QuickLRU({ maxSize: 100000 }) },
  stripTrackersMemOpts = { cache: new QuickLRU({ maxSize: 100000 }) }
  // The cache numbers are pulled from the most reliable source on the internet: my ass.
) => {
  const dnsLookup = dnsLookupGen(gotOptions)
  const normalize = normalizeUrl(
    normalizeUrlOptions,
    dnsLookup,
    gotSsrf.extend(gotOptions), // don't really need to mimic browser behaviour or canonicize shit
    stripTrackersMemOpts
  )
  const httpClient = httpClientGen(normalize, gotOptions, canonicizeMemOpts)

  // Normalize URL so that we can search by URL.
  async function normalizePlus(url = '') {
    debug('Normalizing URL %s', url)

    // 1. "Base" normalization using normalize-url + stripping trackers
    // When an invalid link is passed, it will throw.
    const link = await normalize(url)
    debug('Normalization first pass: %s', url)

    // 2. Follow redirects to deal with "intermediate" links (such as the links on google search results)
    const res = await httpClient.get(link)
    debug('Normalization second pass: %s', res.url)

    // At this point, the link will be completely normalized based on canonical links (if one exists)
    return res.url
  }

  // global timeout for the ENTIRE function, because I'm afraid of blocking the event loop w/ some of the more compute-intensive shit
  return url => pTimeout(normalizePlus(url), timeoutMs)
}
