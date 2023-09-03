import debug from 'debug'

const BASE = 'canonicize-url'

export default function getDebug(namespace?: string) {
  return namespace ? debug(`${BASE}:${namespace}`) : debug(BASE)
}
