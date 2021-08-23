import got from 'got-scraping'

export default function httpClient(gotOptions) {
  return got.gotScraping.extend(gotOptions)
}
