import got from 'got'

export default function httpClient(gotOptions) {
  return got.extend(gotOptions)
}
