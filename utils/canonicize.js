import cheerio from 'cheerio'
import trim from 'lodash/trim.js'
import leven from 'leven'
import parseTld from 'tld-extract'
import urlIsAmp from './url-is-amp.js'

// Look for the canonical link (also un-AMP-ifies the canonical link)
// Not writing a separate metascraper-canonical library for this, as the "standard" way of determining
// canonical link includes looking at the HTTP header: https://developers.google.com/search/docs/advanced/crawling/consolidate-duplicate-urls
export default async function canonicizeHook(res) {
  if (!res.request.options.context.normalize) return
  const { normalize } = res.request.options.context

  // Normalize the "final" URL up front
  const normalizedUrl = await normalize(res.url)

  // Ripped from https://github.com/KilledMufasa/AmputatorBot/blob/master/helpers/canonical_methods.py
  const $ = cheerio.load(res.body)
  const matches = []

  // 5.1: rel=canonical <link> tag
  $('link[rel=canonical]').each(function () {
    matches.push($(this).attr('href'))
  })

  // 5.2: rel=canonical HTTP header
  if ('link' in res.headers) {
    // We're looking for something like:
    // Link: <https://example.com>; rel="canonical", ...
    res.headers.link.split(',').forEach(linkHeader => {
      const parts = linkHeader.split(';')
      if (parts.length !== 2) return

      const [linkStr, relStr] = parts

      // rel="canonical", rel=canonical, rel canonical, etc.
      const relStrLower = relStr.toLowerCase()
      if (relStrLower.includes('rel') && relStrLower.includes('canonical')) {
        // <https://example.com>, https://example.com, etc.
        const url = trim(linkStr.trim(), ['<', '>', ' '])
        matches.push(url)
      }
    })
  }

  // 5.3: AMP variant
  $('a.amp-canurl').each(function () {
    matches.push($(this).attr('href'))
  })

  // 5.4: OpenGraph
  $('meta[property="og:url"]').each(function () {
    matches.push($(this).attr('content'))
  })

  // 5.5: Sitemap (I'm not doing this shit)

  // The only reason we want canonical is to make our job with normalization easier;
  // So we need to make sure the canonical link IS for the url we're trying to normalize!

  const { hostname: domain } = new URL(normalizedUrl)
  const { domain: baseDomain } = parseTld(normalizedUrl)

  let result = normalizedUrl
  let minDist = Number.POSITIVE_INFINITY

  for (const match of matches) {
    let link = match

    // turn relative to absolute URL
    if (match.startsWith('/')) link = `${domain}${match}`

    // Skip invalid links
    try {
      link = await normalize(link)

      // Ensure that every match is a valid URL w/ a matching domain
      // In this case, we're only matching the "top-level" domain -
      // e.g. subdomain.(domain.com) - as a lot of sites host their shit on amp.(site.com)
      // so we want to include references to www.site.com (actually *prefer* those)
      if (parseTld(link).domain !== baseDomain) continue

      // Then, ensure that links aren't AMP'd
      if (urlIsAmp(link)) continue
    } catch (err) {
      continue
    }

    // Then, sort by similarity to the normalized URL of the page we ended up in
    const dist = leven(normalizedUrl, link)
    if (dist < minDist) {
      minDist = dist
      result = link
    }
  }

  res.url = result

  return res
}
