import cheerio from 'cheerio'
import trim from 'lodash/trim'
import leven from 'leven'
import getDomain from './get-domain'
import urlIsAmp from './url-is-amp'

export default function canonicize(body, headers, normalizedUrl, normalize) {
  // Ripped from https://github.com/KilledMufasa/AmputatorBot/blob/master/helpers/canonical_methods.py
  const $ = cheerio.load(body)
  const matches = []

  // 5.1: rel=canonical <link> tag
  $('link[rel=canonical]').each(function () {
    matches.push($(this).attr('href'))
  })

  // 5.2: rel=canonical HTTP header
  if ('link' in headers) {
    // We're looking for something like:
    // Link: <https://example.com>; rel="canonical", ...
    headers.link.split(',').forEach(linkHeader => {
      const parts = linkHeader.split(';')
      if (parts.length !== 2) return

      const [linkStr, relStr] = parts

      // rel="canonical", rel=canonical, rel canonical, etc.
      const relStrLower = relStr.toLowerCase()
      if (relStrLower.includes('rel') && relStrLower.includes('canonical')) {
        // <https://example.com>, https://example.com, etc.
        const url = trim(linkStr.trim(), ['<', '>'])
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

  const baseDomain = getDomain(normalizedUrl)
  let result = normalizedUrl
  let minDist = Number.POSITIVE_INFINITY

  matches
    .map(link => {
      // Before processing, we need to make sure all the URLs are in absolute form
      if (link.startsWith('//')) {
        return `https:${link}`
      } else if (link.startsWith('/')) {
        return `${baseDomain}${link}`
      } else {
        return link
      }
    })
    .filter(link => {
      // First, ensure that every match is a valid URL w/ a matching domain
      try {
        return getDomain(link) === baseDomain
      } catch (err) {
        return false
      }
    })
    .filter(link => {
      // Then, ensure that links aren't AMP'd
      return !urlIsAmp(link)
    })
    .map(link => {
      // Then, normalize
      return normalize(link)
    })
    .forEach(normalizedLink => {
      const dist = leven(normalizedUrl, normalizedLink)
      if (dist < minDist) {
        minDist = dist
        result = normalizedLink
      }
    })

  return result
}
