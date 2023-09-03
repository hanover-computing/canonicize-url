import RE2 from 're2'

import dataFile from './data.minify.json'

import type { Entries } from 'type-fest'

export type Provider = {
  name: string
  urlPattern: RE2
  completeProvider?: boolean
  rules?: RE2[]
  rawRules?: RE2[]
  exceptions?: RE2[]
  redirections?: RE2[]
  forceRedirection?: boolean
  referralMarketing?: RE2[]
}

export const providers: Provider[] = (
  Object.entries(dataFile.providers) as Entries<typeof dataFile.providers>
).map(([name, provider]) => {
  const result: Provider = {
    name,
    urlPattern: new RE2(provider.urlPattern)
  }

  if ('completeProvider' in provider) {
    result.completeProvider = provider.completeProvider
  }

  if ('rules' in provider) {
    result.rules = provider.rules.map(str => new RE2(str))
  }

  if ('rawRules' in provider) {
    result.rawRules = provider.rawRules.map(str => new RE2(str))
  }

  if ('exceptions' in provider) {
    result.exceptions = provider.exceptions.map(str => new RE2(str))
  }

  if ('redirections' in provider) {
    result.redirections = provider.redirections.map(str => new RE2(str))
  }

  if ('forceRedirection' in provider) {
    result.forceRedirection = provider.forceRedirection
  }

  if ('referralMarketing' in provider) {
    result.referralMarketing = provider.referralMarketing.map(
      str => new RE2(str)
    )
  }

  return result
})
