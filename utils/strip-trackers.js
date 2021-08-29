import { URL } from 'url'
import load from '../data/loader'

const providers = load()

export default function clearUrl(url) {
  // Clean the given URL with the provided rules data.
  // URLs matching a provider's `urlPattern` and one or more of that
  // provider's redirection patterns will cause the URL to be replaced
  // with the match's first matched group

  // Shamelessly adopted from https://gitlab.com/CrunchBangDev/cbd-cogs/-/blob/master/Scrub/scrub.py
  // TODO: benchmark regex search
  // TODO: cache new RegExp() calls...?
  // For now, this is a version written w/o any performance shit in mind

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

    // At this point, all of the querystrings *should* be sorted by normalize-url (the vanilla one)

    // Rebuild valid URI string with remaining query parameters
    url = parsedUrl.toString()

    // Strip raw fragments with rawRules
    for (const rule of provider.rawRules || []) {
      const regex = new RegExp(rule)
      url = url.replace(regex, '')
    }
  })

  return url
}
