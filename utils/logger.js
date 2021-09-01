import debug from 'debug'

const BASE = 'normalize'
export default function (name) {
  const fullName = `${BASE}:${name}`
  return debug(fullName)
}
