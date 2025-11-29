import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import RegionDropDown from './RegionDropDown.vue'
import { type Region } from '@/domain/normgeber'
import { useFetchRegions } from '@/services/regionService'

vi.mock('@digitalservicebund/ris-ui/components', () => ({
  RisAutoComplete: {
    name: 'RisAutoComplete',
    template: `<div><input data-testid="autocomplete" @input="$emit('update:model-value', $event.target.value)" /></div>`,
    props: ['modelValue', 'suggestions', 'initialLabel'],
  },
}))

vi.mock('@/services/regionService', () => ({
  useFetchRegions: vi.fn(),
}))

const mockRegions: Region[] = [
  {
    id: '1',
    code: 'AA',
  },
  {
    id: '2',
    code: 'BB',
  },
]

describe('RegionDropDown', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(useFetchRegions as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { value: { regions: mockRegions } },
    })
  })

  it('renders the component and fetches regions', async () => {
    const wrapper = mount(RegionDropDown, {
      props: {
        inputId: 'foo',
        isInvalid: false,
        modelValue: undefined,
      },
    })

    const input = wrapper.find('[data-testid="autocomplete"]')
    expect(input.exists()).toBe(true)
    expect(useFetchRegions).toHaveBeenCalled()
  })

  it('emits updated model value when selection changes', async () => {
    const wrapper = mount(RegionDropDown, {
      props: {
        inputId: 'foo',
        isInvalid: false,
        modelValue: undefined,
      },
    })

    const input = wrapper.find('[data-testid="autocomplete"]')
    // Simulate selecting the region with id '1'
    await input.setValue('1')
    // Simulate change event
    await input.trigger('input')

    const emitted = wrapper.emitted('update:modelValue')!
    expect(emitted).toHaveLength(1)
    expect(emitted[0]?.[0]).toEqual(mockRegions[0])
  })
})
