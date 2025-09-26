import { describe, expect, it, vi } from 'vitest'
import { useFetchReferenceTypes } from './referenceTypeService'
import {
  anwendungFixture,
  neuregelungFixture,
  rechtsgrundlageFixture,
} from '@/testing/fixtures/referenceType'

describe('reference type service', () => {
  it('returns reference types', async () => {
    vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          referenceTypes: [anwendungFixture, neuregelungFixture, rechtsgrundlageFixture],
        }),
        { status: 200 },
      ),
    )

    const { data } = await useFetchReferenceTypes()

    expect(data.value?.referenceTypes).toHaveLength(3)
    expect(data.value?.referenceTypes[0]?.name).toBe(anwendungFixture.name)
  })
})
