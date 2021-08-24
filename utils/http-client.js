import got from 'got-scraping'
import ssrfHookGen from './ssrf-protect'

export default function httpClient(globalOpts) {
  let instance = got.gotScraping.extend(globalOpts.gotOptions)
  if (!globalOpts.gotOptions.proxyUrl) {
    // This is only for people who don't want to set up proxy
    instance = instance.extend({
      hooks: {
        beforeRequest: [ssrfHookGen(globalOpts)]
      }
    })
  }
  return instance
}
