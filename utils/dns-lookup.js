import CacheableLookup from 'cacheable-lookup'

export default function dnsCache(cache) {
  return new CacheableLookup({ cache })
}
