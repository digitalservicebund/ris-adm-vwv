import { describe, expect, it } from 'vitest'
import service from '@/services/comboboxItemService'
import { ref } from 'vue'

describe('comboboxItemService', () => {
  it('should return a list of dummy citation types', async () => {
    // when
    const result = await service.getCitationTypes(ref(undefined))

    // then
    expect(result.data.value?.length).toEqual(4)
  })
})
