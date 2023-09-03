import getDebug from '../lib/debug.js'

import type { BeforeRequestHook } from 'got'

const debug = getDebug('hooks:prefer-https')

// Forces the request to be HTTPS
export const preferHTTPS: BeforeRequestHook = options => {
  debug('Forcing the request protocol to be HTTPS')
  ;(options.url as URL).protocol = 'https:'
}

// We unfortunately can't have a beforeRetry hook, in which we inspect the error and determine
// whether the error came from forcing the HTTPS protocol (i.e. whether the website is http-only),
// and set a flag to *not* force the HTTPS protocol on the next beforeRequest call
// (beforeRequest forces HTTPS -> request fails -> beforeRetry sets flag -> beforeRequest doesn't force HTTPS -> request is retried).
// This is because the beforeRetry hook doesn't pass options as a parameter,
// so there is no way to "pass" the information that the request failed to the beforeRequest hook.

// Blocked on: https://github.com/sindresorhus/got/issues/2295
