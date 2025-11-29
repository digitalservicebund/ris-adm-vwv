import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import VerweisTypDropDown from './VerweisTypDropDown.vue'
import { anwendungFixture, neuregelungFixture } from '@/testing/fixtures/verweisTyp.fixture'

vi.mock('@digitalservicebund/ris-ui/components', () => ({
  RisAutoComplete: {
    name: 'RisAutoComplete',
    template: `<div><input data-testid="autocomplete" @input="$emit('update:model-value', $event.target.value)" /></div>`,
    props: ['modelValue', 'suggestions', 'initialLabel'],
  },
}))

describe('VerweisTypDropDown', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders correctly', async () => {
    const fetchSpy = vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ verweisTypen: [anwendungFixture, neuregelungFixture] }), {
        status: 200,
      }),
    )

    const wrapper = mount(VerweisTypDropDown, {
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

    const wrapper = mount(VerweisTypDropDown, {
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
      new Response(JSON.stringify({ verweisTypen: [anwendungFixture, neuregelungFixture] }), {
        status: 200,
      }),
    )

    const wrapper = mount(VerweisTypDropDown, {
      props: {
        inputId: 'foo',
        invalid: false,
        modelValue: undefined,
      },
    })

    await vi.waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1))

    // when
    const input = wrapper.find('[data-testid="autocomplete"]')
    await input.setValue('anwendungTestId')

    // then
    const emitted = wrapper.emitted('update:modelValue')!
    expect(emitted).toHaveLength(1)
    expect(emitted[0]?.[0]).toEqual(anwendungFixture)

    // when
    await input.setValue('unknownId')

    // then undefined is emitted
    expect(emitted).toHaveLength(2)
    expect(emitted[1]?.[0]).toEqual(undefined)
  })
})
