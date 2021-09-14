import { expect, describe, it } from '@jest/globals'
import gen from './normalize-url'
import EmptyCache from './__fixtures__/empty-cache'

const normalize = gen(
  { stripHash: true, removeQueryParameters: [] },
  async hostname => {
    // throw if non-WWW versions aren't available
    if (hostname === 'test2.com' || hostname === 'test3.com') throw new Error()
  },
  {
    head: async url => {
      // throw if site doesn't support HTTPS
      if (url === 'https://www.test3.com/asdf') throw new Error()
    }
  },
  { cache: new EmptyCache() }
)

describe('link normalization', () => {
  it('defaults to non-www, https', async () => {
    const url = await normalize('http://www.test1.com/asdf')
    expect(url).toBe('https://test1.com/asdf')
  })

  it('falls back to www if DNS cannot be resolved', async () => {
    const url = await normalize('www.test2.com/asdf')
    expect(url).toBe('https://www.test2.com/asdf')
  })

  it('falls back to http if https version cannot be reached', async () => {
    const url = await normalize('www.test3.com/asdf')
    expect(url).toBe('http://www.test3.com/asdf')
  })
})
