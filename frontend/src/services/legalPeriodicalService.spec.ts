import { describe, expect, it, vi } from 'vitest'
import { useFetchLegalPeriodicals } from './legalPeriodicalService'

describe('legal periodicals service', () => {
  it('returns legal periodicals', async () => {
    vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          legalPeriodicals: [
            {
              id: 'bundesanzeigerTestId0',
              title: 'Bundesanzeiger',
              abbreviation: 'BAnz',
            },
            {
              id: 'amtsblattTestId1',
              title: 'Amtsblatt',
              abbreviation: 'ABl',
            },
          ],
        }),
        { status: 200 },
      ),
    )

    const { data } = await useFetchLegalPeriodicals()

    expect(data.value?.legalPeriodicals).toHaveLength(2)
    expect(data.value?.legalPeriodicals[0].title).toBe('Bundesanzeiger')
  })
})
