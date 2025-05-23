import { useFetchInstitutions } from '@/services/institutionService'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@vueuse/core', () => {
  return {
    useFetch: vi.fn(() => ({
      json: vi.fn(() => ({
        data: {
          value: {
            institutions: [
              {
                id: 'institutionId1',
                name: 'Erstes Organ',
                officialName: 'Organ Eins',
                type: 'INSTITUTION',
                regions: [],
              },
              {
                id: 'institutionId2',
                name: 'Zweite Jurpn',
                officialName: null,
                type: 'LEGAL_ENTITY',
                regions: [],
              },
            ],
          },
        },
      })),
    })),
  }
})

describe('institution service', () => {
  it('calls useFetch with the correct URL and returns institutions', async () => {
    const result = await useFetchInstitutions()

    expect(result.data.value?.institutions).toHaveLength(2)
    expect(result.data.value?.institutions?.[0].name).toBe('Erstes Organ')
  })
})
