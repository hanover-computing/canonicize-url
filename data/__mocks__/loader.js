export default function loadRuleset() {
  return [
    {
      urlPattern: '^https://thisshouldthrow.com',
      completeProvider: true
    },
    {
      urlPattern: '^https://thisshouldmatch.com',
      rules: ['fuckthis'],
      exceptions: ['^https://thisshouldmatch.com/butnotthis']
    },
    {
      urlPattern: '^https://trackerstripping.com',
      rules: ['rule'],
      referralMarketing: ['rawRule']
    },
    {
      urlPattern: '^https://rawtest.com',
      rawRules: ['\\/ref=[^/?]*']
    }
  ]
}
