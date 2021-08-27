import { gotScraping } from 'got-scraping'
import { gotSsrf } from 'got-ssrf'
import { canonicizeHook } from './canonicize'

export default function httpClient(gotOptions) {
  return gotScraping
    .extend(gotOptions, gotSsrf)
    .extend({ hooks: { afterResponse: [canonicizeHook] } })
}
