import { expect, describe, it } from '@jest/globals'
import clearUrl from './strip-trackers'

describe('stripping trackers', () => {
  it('blocks "complete providers"', () => {
    expect(() => clearUrl('https://thisshouldthrow.com/asdf')).toThrow(
      'Link is blocked'
    )
  })

  it('skips on exceptions', () => {
    // This is one of the things I'm not sure on and I probably *won't* be sure on;
    // but I'm not sure where in the processing pipeline exception comes.
    // For now, I'm putting it right after completeProvider stage.
    expect(
      clearUrl('https://thisshouldmatch.com/butnotthis?fuckthis=true')
    ).toBe('https://thisshouldmatch.com/butnotthis?fuckthis=true')
  })

  it('strips querystrings, marketing or not', () => {
    expect(
      clearUrl('https://trackerstripping.com/asdf?red=sus&rule=1&rawRule=2')
    ).toBe('https://trackerstripping.com/asdf?red=sus')
  })

  it('strips on raw rules', () => {
    expect(
      clearUrl(
        'https://www.amazon.com/Upgrade-Massager-Waterproof-Dillidos-Cellulite/dp/B09668ZY89/ref=sr_1_1?keywords=dildo&sr=8-1'
      )
    ).toBe(
      'https://www.amazon.com/Upgrade-Massager-Waterproof-Dillidos-Cellulite/dp/B09668ZY89?keywords=dildo&sr=8-1'
    )
  })
})
