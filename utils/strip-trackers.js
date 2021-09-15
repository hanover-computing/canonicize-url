import { URL } from 'url'
import mem from 'mem'
import load from '../data/loader.js'
import logger from './logger.js'

const providers = load()
const debug = logger('utils/strip-trackers.js')

const cachedRegex = mem(pattern => new RegExp(pattern))

function clearUrl(url) {
  debug('Stripping trackers for %s', url)

  // Clean the given URL with the provided rules data.
  // URLs matching a provider's `urlPattern` and one or more of that
  // provider's redirection patterns will cause the URL to be replaced
  // with the match's first matched group

  // Shamelessly adopted from https://gitlab.com/CrunchBangDev/cbd-cogs/-/blob/master/Scrub/scrub.py
  // TODO: benchmark regex search

  providers.forEach(provider => {
    // Check provider urlPattern against provided URI
    if (!cachedRegex(provider.urlPattern).test(url)) return
    debug('Matched a provider %s', provider.urlPattern)

    // completeProvider is a boolean that determines if every url that
    // matches will be blocked. If you want to specify rules, exceptions
    // and/or redirections, the value of completeProvider must be false.
    if (provider.completeProvider) throw new Error('Link is blocked')

    // If any exceptions are matched, this provider is skipped
    for (const exception of provider.exceptions || []) {
      if (cachedRegex(exception).test(url)) {
        debug('Matched an exception %s. Skipping...', exception)
        return
      }
    }

    // the redirections from this handles cases like youtube redirects where you literally CAN'T be redirected by an HTTP call because youtube is a piece of fucking shit
    for (const redir of provider.redirections || []) {
      const regex = cachedRegex(redir)
      const match = regex.exec(url)
      if (match && match.length > 1) {
        url = decodeURIComponent(match[1])
        debug('Matched a redirect! %s', url)
      }
    }

    // Explode query paramters to be checked against rules
    const parsedUrl = new URL(url)

    // Check regular rules and referral marketing rules
    for (const rule of provider.rules || []) {
      const regex = cachedRegex(rule)
      for (const param of parsedUrl.searchParams.keys()) {
        if (regex.test(param)) {
          parsedUrl.searchParams.delete(param)
          debug('Deleting a query parameter %s', param)
        }
      }
    }
    for (const rule of provider.referralMarketing || []) {
      const regex = cachedRegex(rule)
      for (const param of parsedUrl.searchParams.keys()) {
        if (regex.test(param)) {
          parsedUrl.searchParams.delete(param)
          debug('Debugging a marketing query parameter %s', param)
        }
      }
    }

    // At this point, all of the querystrings *should* be sorted by normalize-url (the vanilla one)

    // Rebuild valid URI string with remaining query parameters
    url = parsedUrl.toString()
    debug('Reformed URL %s', url)

    // Strip raw fragments with rawRules
    for (const rule of provider.rawRules || []) {
      const regex = cachedRegex(rule)
      url = url.replace(regex, '')
      debug('Stripped raw fragment %s to get %s', rule, url)
    }
  })

  return url
}

export default function clearUrlGen(memOpts) {
  return mem(clearUrl, memOpts)
}
