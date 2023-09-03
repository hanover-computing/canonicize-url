import type { InitHook } from 'got'

// Sets default settings, such as the number of redirects, and the number of retries.
// We need to follow the redirect to get the true "end" URL,
// and we need to allow at least one retry since we want to prefer HTTPS version
// and make the request with it, but if it fails, we need to retry it with the non-HTTPS version.
export const overrideSettings: InitHook = (plainRequestOptions, options) => {
  options.followRedirect = true
  if (!options.retry.limit) options.retry.limit = 1
}
