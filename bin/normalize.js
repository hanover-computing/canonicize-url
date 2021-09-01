#!/usr/bin/env node
/* eslint-disable no-console */

import gen from '../index.js'
const normalize = gen()
const [, , ...args] = process.argv

;(async () => {
  console.log(await normalize(args[0]))
})()
