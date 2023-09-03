/**
 * Just a little helper to strip the WWW from the hostname.
 *
 * Copied from https://github.com/sindresorhus/normalize-url/blob/12e3b1b23730651c8c6c527454da8fd9b4b01738/index.js#L210
 *
 * @param hostname
 */
export default function clearWWW(hostname: string): string {
  return hostname.replace(/^www\./, '')
}
