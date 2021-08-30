<h1 align="center">Welcome to normalize-url-plus 👋</h1>

[![CircleCI](https://circleci.com/gh/JaneJeon/normalize-url-plus.svg?style=shield)](https://circleci.com/gh/JaneJeon/normalize-url-plus)
[![Version](https://img.shields.io/npm/v/normalize-url-plus)](https://www.npmjs.com/package/normalize-url-plus)
[![Downloads](https://img.shields.io/npm/dt/normalize-url-plus)](https://www.npmjs.com/package/normalize-url-plus)

> normalize-url plus additional features to supercharge link normalization!

While `normalize-url` is good enough for many normalization use cases, this library is akin to prettier or black in that it ABSOLUTELY normalizes links, including features like default www-stripping and default https (both of which fall back should such links do not exist - unlike `normalize-url`), stripping ALL trackers (courtesy of clearURLs), following redirects (even those that can't normally be automatically redirected without manual user intervention such as youtube redirect links), and even extracting canonical URLs.

### 🏠 [Homepage](https://github.com/JaneJeon/normalize-url-plus)

## Install

```sh
npm i normalize-url-plus
```

## Usage

```js
import gen from 'normalize-url-plus'
const normalizeUrl = gen(normalizeUrlOptions, gotOptions) // it is recommended to fill out the caching options for got

const longDisgustingTrackerFilledLink =
  'https://www.amazon.com/Blanket-Fleece-Cartoon-Printing-Napping/dp/B089G4JDVB/ref=sr_1_1?keywords=hello%20kitty&sr=8-1' // eww
normalizeUrl(longDisgustingTrackerFilledLink) // https://amazon.com/Blanket-Fleece-Cartoon-Printing-Napping/dp/B089G4JDVB
```

## Run tests

```sh
npm test
```

## Author

👤 **Jane Jeon <me@janejeon.dev>**

- Website: janejeon.dev
- Github: [@JaneJeon](https://github.com/JaneJeon)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/JaneJeon/normalize-url-plus/issues).

## Show your support

Give a ⭐️ if this project helped you!

## 📝 License

Copyright © 2021 [Jane Jeon <me@janejeon.dev>](https://github.com/JaneJeon).<br />
This project is [LGPL-3.0](https://github.com/JaneJeon/normalize-url-plus/blob/main/LICENSE) licensed.

---

_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
