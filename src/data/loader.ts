// Literally the only reason this is its own module is because I want to mock it for testing
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

export type Provider = {
  urlPattern: string // regex
  completeProvider?: boolean
  rules?: string[] // can be regex
  rawRules?: string[] // regex
  exceptions?: string[] // regex
  redirections?: string[] // regex
  forceRedirection?: boolean
  referralMarketing?: string[] // can be regex
}

export default function loadRuleset(): Provider[] {
  const dirname = fileURLToPath(path.dirname(import.meta.url))
  const filePath = path.join(dirname, 'data.minify.json')
  const file = readFileSync(filePath).toString()
  return Object.values(JSON.parse(file).providers)
}
