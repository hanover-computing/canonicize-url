import got from 'got'
import { gotScraping } from 'got-scraping'
import { gotSsrf } from 'got-ssrf'
import canonicizeHookGen from './canonicize.js'

export default function httpClient(normalize, gotOptions, canonicizeMemOpts) {
  return got
    .extend(gotOptions)
    .extend(gotSsrf)
    .extend(gotScraping)
    .extend({
      hooks: {
        afterResponse: [canonicizeHookGen(normalize, canonicizeMemOpts)]
      }
    })
}
