// Literally the only reason this is its own module is because I want to mock it for testing
import { readFileSync } from 'fs'
import path from 'path'

export default function loadRuleset() {
  const dirname = path.dirname(import.meta.url)
  const file = readFileSync(path.join(dirname, 'data.minify.json'))
  return Object.values(JSON.parse(file).providers)
}
