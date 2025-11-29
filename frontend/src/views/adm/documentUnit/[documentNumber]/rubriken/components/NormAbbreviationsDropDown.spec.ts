import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import NormAbbreviationsDropDown from './NormAbbreviationsDropDown.vue'
import { kvlgFixture, sgb5Fixture } from '@/testing/fixtures/normAbbreviation.fixture'

vi.mock('@digitalservicebund/ris-ui/components', () => ({
  RisAutoComplete: {
    name: 'RisAutoComplete',
    template: `<div><input data-testid="autocomplete" @input="$emit('update:model-value', $event.target.value)" /></div>`,
    props: ['modelValue', 'suggestions', 'initialLabel'],
  },
}))

describe('NormAbbreviationsDropDown', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders correctly', async () => {
    const fetchSpy = vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ courts: [sgb5Fixture, kvlgFixture] }), {
        status: 200,
      }),
    )

    const wrapper = mount(NormAbbreviationsDropDown, {
      props: {
        inputId: 'foo',
        invalid: false,
        modelValue: undefined,
      },
    })

    await vi.waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1))

    const input = wrapper.find('[data-testid="autocomplete"]')
    expect(input.exists()).toBe(true)
  })

  it('renders correctly on fetching error', async () => {
    const fetchSpy = vi.spyOn(window, 'fetch').mockRejectedValue('fetch error')

    const wrapper = mount(NormAbbreviationsDropDown, {
      props: {
        inputId: 'foo',
        invalid: false,
        modelValue: undefined,
      },
    })

    await vi.waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1))

    const input = wrapper.find('[data-testid="autocomplete"]')
    expect(input.exists()).toBe(true)
  })

  it('emits updated model value when selection changes', async () => {
    const fetchSpy = vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ normAbbreviations: [sgb5Fixture, kvlgFixture] }), {
        status: 200,
      }),
    )

    const wrapper = mount(NormAbbreviationsDropDown, {
      props: {
        inputId: 'foo',
        invalid: false,
        modelValue: undefined,
      },
    })

    await vi.waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1))

    // when
    const input = wrapper.find('[data-testid="autocomplete"]')
    await input.setValue('sgb5TestId')

    // then
    const emitted = wrapper.emitted('update:modelValue')!
    expect(emitted).toHaveLength(1)
    expect(emitted[0]?.[0]).toEqual(sgb5Fixture)

    // when
    await input.setValue('unknownId')

    // then undefined is emitted
    expect(emitted).toHaveLength(2)
    expect(emitted[1]?.[0]).toEqual(undefined)
  })
})
