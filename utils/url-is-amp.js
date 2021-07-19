// Ripped from https://github.com/KilledMufasa/AmputatorBot/blob/7ee5760e653392e383fe22c4a82155300ff80c9a/static/static.txt
const AMP_KEYWORDS = [
  '/amp',
  'amp/',
  '.amp',
  'amp.',
  '?amp',
  'amp?',
  '=amp',
  'amp=',
  '&amp',
  'amp&',
  '%amp',
  'amp%',
  '_amp',
  'amp_'
]

export default function urlIsAmp(url) {
  return AMP_KEYWORDS.some(kw => url.includes(kw))
}
