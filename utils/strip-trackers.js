import { URL } from 'url'
import ref from '../data/data.minify.json'
import httpClient from './http-client'

const CLEARURLS_RULESET = 'https://rules2.clearurls.xyz/data.minify.json'
let providers = Object.values(ref.providers)

httpClient(CLEARURLS_RULESET)
  .json()
  .then(res => {
    // eslint-disable-next-line no-console
    console.log('Updated clearURLs ruleset with the latest file')
    providers = Object.values(res.providers)
  })
  .catch(err => {
    // eslint-disable-next-line no-console
    console.error('Failed to fetch clearURLs ruleset: ', err)
  })

export default function cleanUrl(url) {
  // Clean the given URL with the provided rules data.
  // URLs matching a provider's `urlPattern` and one or more of that
  // provider's redirection patterns will cause the URL to be replaced
  // with the match's first matched group

  // Shamelessly adopted from https://gitlab.com/CrunchBangDev/cbd-cogs/-/blob/master/Scrub/scrub.py
  // TODO: benchmark regex search
  // TODO: cache new RegExp() calls...?
  // For now, this is a version written w/o any performance shit in mind
  url = url.toLowerCase()

  providers.forEach(provider => {
    // Check provider urlPattern against provided URI
    if (!new RegExp(provider.urlPattern).test(url)) return

    // completeProvider is a boolean that determines if every url that
    // matches will be blocked. If you want to specify rules, exceptions
    // and/or redirections, the value of completeProvider must be false.
    if (provider.completeProvider) throw new Error('Link is blocked')

    // If any exceptions are matched, this provider is skipped
    if (
      (provider.exceptions || []).some(exception =>
        new RegExp(exception).test(url)
      )
    )
      return

    // ignore redirections since we already follow the links directly

    // Explode query paramters to be checked against rules
    const parsedUrl = new URL(url)

    // Check regular rules and referral marketing rules
    for (const rule of provider.rules || []) {
      const regex = new RegExp(rule)
      for (const param of parsedUrl.searchParams.keys()) {
        if (regex.test(param)) {
          parsedUrl.searchParams.delete(param)
        }
      }
    }
    for (const rule of provider.referralMarketing || []) {
      const regex = new RegExp(rule)
      for (const param of parsedUrl.searchParams.keys()) {
        if (regex.test(param)) {
          parsedUrl.searchParams.delete(param)
        }
      }
    }

    // Rebuild valid URI string with remaining query parameters
    url = parsedUrl.toString()
  })

  return url
}
