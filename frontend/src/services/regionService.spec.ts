import { describe, expect, it, vi } from 'vitest'
import { useFetchRegions } from './regionService'

vi.mock('@vueuse/core', () => {
  return {
    useFetch: vi.fn(() => ({
      json: vi.fn(() => ({
        data: {
          value: {
            regions: [
              {
                id: 'regionId0',
                code: 'AA',
                longText: null,
              },
              {
                id: 'regionId1',
                code: 'BB',
                longText: null,
              },
            ],
          },
        },
      })),
    })),
  }
})

describe('regions service', () => {
  it('calls useFetch with the correct URL and returns regions', async () => {
    const result = await useFetchRegions()

    expect(result.data.value?.regions).toHaveLength(2)
    expect(result.data.value?.regions?.[0].code).toBe('AA')
  })
})
