import { describe, expect, it, vi } from 'vitest'
import { agAachenFixture, berufsgerichtBremenFixture } from '@/testing/fixtures/court.ts'
import { useFetchCourts } from '@/services/courtService.ts'

describe('court service', () => {
  it('returns courts', async () => {
    vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          courts: [agAachenFixture, berufsgerichtBremenFixture],
        }),
        { status: 200 },
      ),
    )

    const { data } = await useFetchCourts()

    expect(data.value?.courts).toHaveLength(2)
    expect(data.value?.courts[0]?.type).toBe(agAachenFixture.type)
  })
})
