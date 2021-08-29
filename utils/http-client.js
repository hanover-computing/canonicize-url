import got from 'got'
import { gotScraping } from 'got-scraping'
import { gotSsrf } from 'got-ssrf'
import canonicizeHook from './canonicize.js'

export default function httpClient(gotOptions) {
  return got
    .extend(gotOptions)
    .extend(gotSsrf)
    .extend(gotScraping)
    .extend({
      hooks: {
        afterResponse: [canonicizeHook]
      }
    })
}
