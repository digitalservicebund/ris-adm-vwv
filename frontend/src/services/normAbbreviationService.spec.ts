import { describe, expect, it, vi } from 'vitest'
import { useFetchNormAbbreviations } from './normAbbreviationService'
import { kvlgFixture, sgb5Fixture } from '@/testing/fixtures/normAbbreviation'

describe('norm abbreviation service', () => {
  it('returns norm abbreviations', async () => {
    vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          normAbbreviations: [sgb5Fixture, kvlgFixture],
        }),
        { status: 200 },
      ),
    )

    const { data } = await useFetchNormAbbreviations()

    expect(data.value?.normAbbreviations).toHaveLength(2)
    expect(data.value?.normAbbreviations[0]?.abbreviation).toBe(sgb5Fixture.abbreviation)
  })
})
