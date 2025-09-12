import { describe, expect, it, vi } from 'vitest'
import { useFetchLegalPeriodicals } from './legalPeriodicalService'
import { amtsblattFixture, bundesanzeigerFixture } from '@/testing/fixtures/periodikum'

describe('legal periodicals service', () => {
  it('returns legal periodicals', async () => {
    vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          legalPeriodicals: [bundesanzeigerFixture, amtsblattFixture],
        }),
        { status: 200 },
      ),
    )

    const { data } = await useFetchLegalPeriodicals()

    expect(data.value?.legalPeriodicals).toHaveLength(2)
    expect(data.value?.legalPeriodicals[0]?.title).toBe(bundesanzeigerFixture.title)
  })
})
