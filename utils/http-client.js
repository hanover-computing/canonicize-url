import { gotScraping } from 'got-scraping'
import { gotSsrf } from 'got-ssrf'

export default function httpClient(gotOptions) {
  return gotScraping.extend(gotOptions, gotSsrf)
}
