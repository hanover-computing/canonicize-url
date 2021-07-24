import normalizeUrl from 'normalize-url'
import stripTrackers from './strip-trackers'

export default function gen(normalizeUrlOptions) {
  return function normalize(url, stripTrackersOption) {
    if (stripTrackersOption) url = stripTrackers(url)
    return normalizeUrl(url, normalizeUrlOptions)
  }
}
