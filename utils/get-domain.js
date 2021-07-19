import { URL } from 'url'

export default function getDomain(link) {
  return new URL(link).hostname
}
