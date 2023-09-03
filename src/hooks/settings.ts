import type { InitHook } from 'got'

// Sets default settings.
export const overrideSettings: InitHook = (plainRequestOptions, options) => {
  // Throw on HTTPS cert errors
  options.https.rejectUnauthorized = true

  // We need to follow the redirect to get the true "end" URL
  options.followRedirect = true

  // We need to allow at least one retry since we want to prefer HTTPS version and make the request with it,
  // but if it fails, we need to retry it with the non-HTTPS version.
  if (!options.retry.limit) options.retry.limit = 1
}
