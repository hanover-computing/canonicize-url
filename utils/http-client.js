import { gotScraping } from 'got-scraping'
import { gotSsrf } from 'got-ssrf'

export default function httpClient(globalOpts) {
  return gotScraping.extend(globalOpts.gotOptions, gotSsrf)
}
