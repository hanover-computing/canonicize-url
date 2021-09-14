import { expect, describe, it } from '@jest/globals'
import got from 'got'
import nock from 'nock'
import hookGen from './canonicize'
import EmptyCache from './__fixtures__/empty-cache'

nock.disableNetConnect()

async function mockNormalize(url) {
  // just append protocol, do nothing else
  return url.startsWith('http') || url.startsWith('https')
    ? url
    : `http://${url}`
}

describe('extracting canonical links', () => {
  const httpClient = got.extend({
    hooks: {
      afterResponse: [
        hookGen(mockNormalize, {
          cache: new EmptyCache()
        })
      ]
    }
  })

  it('picks up rel=canonical in HTML body', async () => {
    nock('http://asdf.com')
      .get('/somepage')
      .reply(
        200,
        `<!DOCTYPE html>
        <html lang="en">
            <head>
                <link rel="canonical" href="http://asdf.com/canonical" />
                <title>Simple HTML document</title>
            </head>
            <body>
                <h1>Hello World!</h1>
            </body>
        </html>`
      )

    const { url } = await httpClient.get('http://asdf.com/somepage')
    expect(url).toBe('http://asdf.com/canonical')
  })

  it('picks up rel=canonical in HTTP header', async () => {
    nock('http://asdf.com')
      .get('/somepage')
      .reply(
        200,
        `<!DOCTYPE html>
        <html lang="en">
            <head>
                <title>Simple HTML document</title>
            </head>
            <body>
                <h1>Hello World!</h1>
            </body>
        </html>`,
        {
          link: '< http://asdf.com/canonical>; rel="canonical"'
        }
      )

    const { url } = await httpClient.get('http://asdf.com/somepage')
    expect(url).toBe('http://asdf.com/canonical')
  })

  it("picks up de-AMP'd links", async () => {
    nock('http://asdf.com')
      .get('/somepage')
      .reply(
        200,
        `<!DOCTYPE html>
        <html lang="en">
            <head>
                <title>Simple HTML document</title>
                <a class="amp-canurl" href="http://asdf.com/canonical" />
            </head>
            <body>
                <h1>Hello World!</h1>
            </body>
        </html>`
      )

    const { url } = await httpClient.get('http://asdf.com/somepage')
    expect(url).toBe('http://asdf.com/canonical')
  })

  it('picks up opengraph links', async () => {
    nock('http://asdf.com')
      .get('/somepage')
      .reply(
        200,
        `<!DOCTYPE html>
        <html lang="en">
            <head>
                <title>Simple HTML document</title>
                <meta property="og:url" content="http://asdf.com/canonical" />
            </head>
            <body>
                <h1>Hello World!</h1>
            </body>
        </html>`
      )

    const { url } = await httpClient.get('http://asdf.com/somepage')
    expect(url).toBe('http://asdf.com/canonical')
  })

  it('puts all relative links in absolute form', async () => {
    nock('http://sub.asdf.com')
      .get('/somepage')
      .reply(
        200,
        `<!DOCTYPE html>
        <html lang="en">
            <head>
                <link rel="canonical" href="/canonical" />
                <title>Simple HTML document</title>
            </head>
            <body>
                <h1>Hello World!</h1>
            </body>
        </html>`
      )

    const { url } = await httpClient.get('http://sub.asdf.com/somepage')
    expect(url).toBe('http://sub.asdf.com/canonical')
  })

  it('ignores invalid matches (domain)', async () => {
    nock('http://sub.asdf.com')
      .get('/somepage')
      .reply(
        200,
        `<!DOCTYPE html>
        <html lang="en">
            <head>
                <link rel="canonical" href="http://sub.com/canonical" />
                <title>Simple HTML document</title>
            </head>
            <body>
                <h1>Hello World!</h1>
            </body>
        </html>`
      )

    const { url } = await httpClient.get('http://sub.asdf.com/somepage')
    expect(url).toBe('http://sub.asdf.com/somepage')
  })

  it('ignores invalid matches (amp)', async () => {
    nock('http://asdf.com')
      .get('/somepage')
      .reply(
        200,
        `<!DOCTYPE html>
        <html lang="en">
            <head>
                <link rel="canonical" href="http://amp.asdf.com/canonical" />
                <title>Simple HTML document</title>
            </head>
            <body>
                <h1>Hello World!</h1>
            </body>
        </html>`
      )

    const { url } = await httpClient.get('http://asdf.com/somepage')
    expect(url).toBe('http://asdf.com/somepage')
  })

  it('returns the most "relevant" link', async () => {
    nock('http://amp.asdf.com')
      .get('/somepage')
      .reply(
        200,
        `<!DOCTYPE html>
        <html lang="en">
            <head>
                <link rel="canonical" href="http://asdf.com/some" />
                <title>Simple HTML document</title>
                <a class="amp-canurl" href="http://asdf.com" />
                <meta property="og:url" content="http://asdf.com/somepage" />
            </head>
            <body>
                <h1>Hello World!</h1>
            </body>
        </html>`,
        {
          link: '< http://asdf.com/canonical>; rel="canonical"'
        }
      )

    const { url } = await httpClient.get('http://amp.asdf.com/somepage')
    expect(url).toBe('http://asdf.com/somepage')
  })
})
