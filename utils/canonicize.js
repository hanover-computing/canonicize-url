import cheerio from 'cheerio'
import trim from 'lodash/trim.js'
import leven from 'leven'
import parseTld from 'tld-extract'
import mem from 'p-memoize'
import urlIsAmp from './url-is-amp.js'
import logger from './logger.js'

const debug = logger('utils/canonicize.js')

export default function canonicizeGen(normalize, memOpts) {
  // Look for the canonical link (also un-AMP-ifies the canonical link)
  // Not writing a separate metascraper-canonical library for this, as the "standard" way of determining
  // canonical link includes looking at the HTTP header: https://developers.google.com/search/docs/advanced/crawling/consolidate-duplicate-urls
  async function getCanonical(res, normalizedUrl) {
    // Ripped from https://github.com/KilledMufasa/AmputatorBot/blob/master/helpers/canonical_methods.py
    const $ = cheerio.load(res.body)
    const matches = []

    // 5.1: rel=canonical <link> tag
    $('link[rel=canonical]').each(function () {
      const match = $(this).attr('href')
      matches.push(match)
      debug('Matched rel=canonical <link> tag: %s', match)
    })

    // 5.2: rel=canonical HTTP header
    if ('link' in res.headers) {
      debug('"Link" header exists, searching for rel=canonical...')

      // We're looking for something like:
      // Link: <https://example.com>; rel="canonical", ...
      res.headers.link.split(',').forEach(linkHeader => {
        const parts = linkHeader.split(';')
        if (parts.length !== 2) {
          debug('Not enough parts exist in the header: %s', linkHeader)
          return
        }

        const [linkStr, relStr] = parts
        debug('Extracted link fragment %s and rel fragment %s', linkStr, relStr)

        // rel="canonical", rel=canonical, rel canonical, etc.
        const relStrLower = relStr.toLowerCase()
        if (relStrLower.includes('rel') && relStrLower.includes('canonical')) {
          // <https://example.com>, https://example.com, etc.
          const url = trim(linkStr.trim(), ['<', '>', ' '])
          matches.push(url)
          debug('Found canonical in header: %s', url)
        }
      })
    }

    // 5.3: AMP variant
    $('a.amp-canurl').each(function () {
      const match = $(this).attr('href')
      matches.push(match)
      debug('Found non-AMP variant: %s', match)
    })

    // 5.4: OpenGraph
    $('meta[property="og:url"]').each(function () {
      const match = $(this).attr('content')
      matches.push(match)
      debug('Found OpenGraph og:url: %s', match)
    })

    // 5.5: Sitemap (I'm not doing this shit)

    // The only reason we want canonical is to make our job with normalization easier;
    // So we need to make sure the canonical link IS for the url we're trying to normalize!

    const { hostname: domain } = new URL(normalizedUrl)
    const { domain: baseDomain } = parseTld(normalizedUrl)
    debug(
      'Finding the best match for host %s and TLD %s...',
      domain,
      baseDomain
    )

    let result = normalizedUrl
    let minDist = Number.POSITIVE_INFINITY

    for (const match of matches) {
      let link = match

      // turn relative to absolute URL
      if (match.startsWith('/')) link = `${domain}${match}`
      debug('Considering match %s...', link)

      // Skip invalid links
      try {
        link = await normalize(link)
        debug('Normalized match to %s', link)

        // Ensure that every match is a valid URL w/ a matching domain
        // In this case, we're only matching the "top-level" domain -
        // e.g. subdomain.(domain.com) - as a lot of sites host their shit on amp.(site.com)
        // so we want to include references to www.site.com (actually *prefer* those)
        const { domain: matchDomain } = parseTld(link)
        if (matchDomain !== baseDomain) {
          debug(
            'The domain %s does not match the base domain %s',
            matchDomain,
            baseDomain
          )
          continue
        }

        // Then, ensure that links aren't AMP'd
        if (urlIsAmp(link)) {
          debug('Link %s is AMP, skipping...', link)
          continue
        }
      } catch (err) {
        debug('Error %s while considering match %s', err, match)
        continue
      }

      // Then, sort by similarity to the normalized URL of the page we ended up in
      const dist = leven(normalizedUrl, link)
      if (dist < minDist) {
        minDist = dist
        result = link
      }
    }

    debug('Found best match %s', result)
    return result
  }

  const memCanonical = mem(getCanonical, {
    ...memOpts,
    cacheKey: args => args[1] // we want to cache by the normalized url in order to raise the hit rate
  })

  return async function canonicizeHook(res) {
    // Normalize the "final" URL up front
    const normalizedUrl = await normalize(res.url)
    debug('Normalized res.url %s to %s', res.url, normalizedUrl)

    res.url = await memCanonical(res, normalizedUrl)

    return res
  }
}
