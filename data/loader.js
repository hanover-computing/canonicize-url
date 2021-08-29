// Literally the only reason this is its own module is because I want to mock it for testing
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

export default function loadRuleset() {
  const dirname = fileURLToPath(path.dirname(import.meta.url))
  const filePath = path.join(dirname, 'data.minify.json')
  const file = readFileSync(filePath)
  return Object.values(JSON.parse(file).providers)
}
