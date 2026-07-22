import { describe, expect, it } from 'vitest'
import { classifySourceIds } from '../../scripts/scraping/storage'

describe('scraping storage classification', () => {
  it('separates new ids from known ids without double-counting input duplicates', () => {
    expect(classifySourceIds(['a', 'b', 'b', 'c'], new Set(['b', 'z']))).toEqual({
      newIds: ['a', 'c'],
      knownIds: ['b'],
    })
  })
})
