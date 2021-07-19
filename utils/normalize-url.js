import normalizeUrl from 'normalize-url'

export default function gen(normalizeUrlOptions) {
  return function normalize(url) {
    return normalizeUrl(url, normalizeUrlOptions)
  }
}
