import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import InstitutionDropDown from './InstitutionDropDown.vue'
import { useFetchInstitutions } from '@/services/institutionService'
import { InstitutionType, type Institution } from '@/domain/normgeber'

vi.mock('@digitalservicebund/ris-ui/components', () => ({
  RisAutoComplete: {
    name: 'RisAutoComplete',
    template: `<div><input data-testid="autocomplete" @input="$emit('update:model-value', $event.target.value)" /></div>`,
    props: ['modelValue', 'suggestions', 'initialLabel'],
  },
}))

vi.mock('@/services/institutionService', () => ({
  useFetchInstitutions: vi.fn(),
}))

const mockInstitutions: Institution[] = [
  {
    id: '1',
    name: 'inst1',
    officialName: 'Inst 1',
    type: InstitutionType.LegalEntity,
    regions: [],
  },
  {
    id: '2',
    name: 'inst2',
    officialName: 'Inst 2',
    type: InstitutionType.LegalEntity,
    regions: [],
  },
]

describe('InstitutionDropDown', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(useFetchInstitutions as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { value: { institutions: mockInstitutions } },
    })
  })

  it('renders the component and fetches institutions', async () => {
    const wrapper = mount(InstitutionDropDown, {
      props: {
        inputId: 'foo',
        isInvalid: false,
        modelValue: undefined,
      },
    })

    const input = wrapper.find('[data-testid="autocomplete"]')
    expect(input.exists()).toBe(true)
    expect(useFetchInstitutions).toHaveBeenCalled()
  })

  it('emits updated model value when selection changes', async () => {
    const wrapper = mount(InstitutionDropDown, {
      props: {
        inputId: 'foo',
        isInvalid: false,
        modelValue: undefined,
      },
    })

    const input = wrapper.find('[data-testid="autocomplete"]')
    // Simulate selecting the institution with id '1'
    await input.setValue('1')
    // Simulate change event
    await input.trigger('input')

    const emitted = wrapper.emitted('update:modelValue')!
    expect(emitted).toHaveLength(1)
    expect(emitted[0]?.[0]).toEqual(mockInstitutions[0])
  })
})
