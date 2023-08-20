<h1 align="center">Welcome to canonicize-url 👋</h1>

[![GitHub Actions](https://github.com/hanover-computing/canonicize-url/actions/workflows/ci.yml/badge.svg)](https://github.com/hanover-computing/canonicize-url/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/JaneJeon/canonicize-url/branch/master/graph/badge.svg)](https://codecov.io/gh/JaneJeon/canonicize-url)
[![Version](https://img.shields.io/npm/v/canonicize-url)](https://www.npmjs.com/package/canonicize-url)
[![Downloads](https://img.shields.io/npm/dt/canonicize-url)](https://www.npmjs.com/package/canonicize-url)

> Get a stable, canonical version of any URL!

### Why

While `normalize-url` is good enough for many normalization use cases, this library is akin to prettier or black in that it goes even further and canonicizes links, such that for any "version" of a link, we reduce it down to its "base", canonical form.

This means you can essentially "deduplicate" N "variations" of links into its canonical form, which is really helpful when you need to do some amount of work for each link (i.e. you go from O(N) to O(1)).

Some of the "tricks" we use to canonicize URLs (beyond just what `normalize-url` provides you) include:

- default www-stripping and default https (both of which fallback to the original when the www-stripped or https versions do not exist - unlike `normalize-url`)
- stripping tracking search params in the querystring
- following redirects (even those that can't normally be automatically redirected without manual user intervention such as youtube redirect links)
- extracting canonical URLs that web pages use to indicate to web crawlers (e.g. Google) what the _canonical_ version of the link is

### 🏠 [Homepage](https://github.com/JaneJeon/canonicize-url)

## Install

```sh
npm i canonicize-url
```

## Usage

Note that this package is ESM-only; see https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c for what to do if you're using CJS (i.e. `require()`).

```js
import gen from 'canonicize-url'
const normalizeUrl = gen(normalizeUrlOptions, gotOptions) // it is recommended to fill out the caching options for got

const longDisgustingTrackerFilledLink =
  'https://www.amazon.com/Blanket-Fleece-Cartoon-Printing-Napping/dp/B089G4JDVB/ref=sr_1_1?keywords=hello%20kitty&sr=8-1' // eww
await normalizeUrl(longDisgustingTrackerFilledLink) // https://amazon.com/Blanket-Fleece-Cartoon-Printing-Napping/dp/B089G4JDVB
```

## Run tests

```sh
npm test
```

## Author

👤 **Jane Jeon <git@janejeon.com>**

- Website: janejeon.dev
- Github: [@JaneJeon](https://github.com/JaneJeon)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/JaneJeon/canonicize-url/issues).

## Show your support

Give a ⭐️ if this project helped you!

## 📝 License

Copyright © 2023 [Jane Jeon <git@janejeon.com>](https://github.com/JaneJeon).<br />
This project is [LGPL-3.0](https://github.com/JaneJeon/canonicize-url/blob/main/LICENSE) licensed.

TL;DR: you are free to import and use this library "as-is" in your code, without needing to make your code source-available or to license it under the same license as this library; however, if you do change this library and you distribute it (directly or as part of your code consuming this library), please do contribute back any improvements for this library and this library alone.
