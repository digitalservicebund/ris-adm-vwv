import { userEvent } from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import { type Fundstelle } from '@/domain/fundstelle'
import FundstelleInput from './FundstelleInput.vue'
import { createTestingPinia } from '@pinia/testing'
import {
  ambiguousFundstelleFixture,
  fundstelleFixture,
} from '@/testing/fixtures/fundstelle.fixture'

// Stubbing complex dropdown components with simple input fields to:
// - Hide their internal implementation during testing
// - Simplify interaction in tests (e.g., simulate user input easily)
// - Preserve essential props and emitted events for two-way binding
const stubs = {
  PeriodikumDropdownStub: {
    props: ['modelValue', 'isInvalid'],
    emits: ['update:modelValue'],
    template: `
      <input
        :value="modelValue?.id || ''"
        @input="$emit('update:modelValue', { id: $event.target.value })"
        :aria-invalid="isInvalid"
        data-testid="periodikum-input"
      >
      </input>
    `,
  },
}

function renderComponent(
  props: { fundstelle?: Fundstelle; showCancelButton: boolean },
  stubs?: Record<string, object>,
) {
  const user = userEvent.setup()

  return {
    user,
    ...render(FundstelleInput, {
      props,
      global: {
        plugins: [
          [
            createTestingPinia({
              initialState: {
                admDocumentUnit: {
                  documentUnit: {
                    id: '123',
                    documentNumber: '1234567891234',
                    fundstelleList: [],
                  },
                },
              },
            }),
          ],
        ],
        stubs,
      },
    }),
  }
}

describe('FundstelleInput', () => {
  it('render an empty fundstelle input', async () => {
    renderComponent({ showCancelButton: false })
    expect(screen.getByText('Periodikum *')).toBeInTheDocument()
    expect(screen.getByText('Zitatstelle *')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Fundstelle übernehmen' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Eintrag löschen' })).not.toBeInTheDocument()
  })

  it('renders the cancel button when prop set', async () => {
    renderComponent({ showCancelButton: true })
    expect(screen.getByRole('button', { name: 'Abbrechen' })).toBeInTheDocument()
  })

  it('renders an existing fundstelle if set', async () => {
    renderComponent(
      { fundstelle: fundstelleFixture, showCancelButton: true },
      { PeriodikumDropDown: stubs.PeriodikumDropdownStub },
    )

    expect(screen.getByTestId('periodikum-input')).toHaveValue('bundesanzeigerTestId')
    expect(screen.getByRole('textbox', { name: 'zitatstelle' })).toHaveValue('1973, 608')
    expect(screen.getByRole('button', { name: 'Abbrechen' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Eintrag löschen' })).toBeInTheDocument()
  })

  it('should reset local state when clicking cancel', async () => {
    const { user, emitted } = renderComponent(
      { fundstelle: fundstelleFixture, showCancelButton: true },
      { PeriodikumDropDown: stubs.PeriodikumDropdownStub },
    )

    // when
    const input = screen.getByRole('textbox', { name: 'zitatstelle' })
    // then
    expect(input).toHaveValue('1973, 608')

    // when
    await user.clear(input)
    // then
    expect(input).toHaveValue('')

    // when
    await user.click(screen.getByRole('button', { name: 'Abbrechen' }))
    // then
    expect(input).toHaveValue('1973, 608')
    expect(emitted('cancel')).toBeTruthy()
  })

  it('should save updated entity', async () => {
    const { user, emitted } = renderComponent(
      { fundstelle: fundstelleFixture, showCancelButton: true },
      { PeriodikumDropDown: stubs.PeriodikumDropdownStub },
    )

    // when
    const periodikumInput = screen.getByTestId('periodikum-input')
    await await user.clear(periodikumInput)
    await user.type(periodikumInput, 'bundesanzeigerTestId')
    // then
    expect(periodikumInput).toHaveValue('bundesanzeigerTestId')
    expect(screen.getByText('Zitatstelle *')).toBeInTheDocument()
    const zitatstelleInput = screen.getByRole('textbox', { name: 'zitatstelle' })
    expect(zitatstelleInput).toHaveValue('1973, 608')

    // when
    await user.clear(zitatstelleInput)
    await user.type(zitatstelleInput, 'test')
    // then
    expect(zitatstelleInput).toHaveValue('test')

    // when
    await user.click(screen.getByRole('button', { name: 'Fundstelle übernehmen' }))
    // then
    const emittedVal = emitted('updateFundstelle') as [Fundstelle[]]
    const updatedEntity = emittedVal?.[0][0]
    expect(updatedEntity.id).toEqual(fundstelleFixture.id)
    expect(updatedEntity.periodikum?.id).toEqual('bundesanzeigerTestId')
    expect(updatedEntity.zitatstelle).toEqual('test')
  })

  it('should create new entity', async () => {
    vi.stubGlobal('crypto', {
      randomUUID: () => 'mocked-uuid',
    })

    const { user, emitted } = renderComponent(
      { showCancelButton: false },
      { PeriodikumDropDown: stubs.PeriodikumDropdownStub },
    )

    // when
    const periodikumInput = screen.getByTestId('periodikum-input')
    const zitatstelleInput = screen.getByRole('textbox', { name: 'zitatstelle' })
    await user.clear(periodikumInput)
    await user.type(periodikumInput, 'bundesanzeigerTestId')
    await user.clear(zitatstelleInput)
    await user.type(zitatstelleInput, 'test')
    await user.click(screen.getByRole('button', { name: 'Fundstelle übernehmen' }))
    // then
    const emittedVal = emitted('updateFundstelle') as [Fundstelle[]]
    const createdEntity = emittedVal?.[0][0]
    expect(createdEntity.id).toEqual('mocked-uuid')
    expect(createdEntity.periodikum?.id).toEqual('bundesanzeigerTestId')
  })

  it('should delete an existing fundstelle', async () => {
    const { user, emitted } = renderComponent({
      fundstelle: fundstelleFixture,
      showCancelButton: true,
    })

    // when
    await user.click(screen.getByRole('button', { name: 'Eintrag löschen' }))
    // then
    const emittedVal = emitted('deleteFundstelle') as [string[]]
    const id = emittedVal?.[0][0]
    expect(id).toEqual(fundstelleFixture.id)
  })

  it('should show error message when ambiguous', async () => {
    renderComponent({
      fundstelle: ambiguousFundstelleFixture,
      showCancelButton: true,
    })

    expect(screen.getByText('Mehrdeutiger Verweis')).toBeVisible()
  })

  it('should show error message for mandatory fields', async () => {
    const { user, emitted } = renderComponent(
      { fundstelle: undefined, showCancelButton: true },
      { PeriodikumDropDown: stubs.PeriodikumDropdownStub },
    )

    // when
    const periodikumInput = screen.getByTestId('periodikum-input')
    await user.clear(periodikumInput)
    await user.type(periodikumInput, 'bundesanzeigerTestId')
    await user.click(screen.getByRole('button', { name: 'Fundstelle übernehmen' }))
    // then
    expect(screen.getByText('Pflichtfeld nicht befüllt')).toBeVisible()
    expect(emitted()['updateFundstelle']).toBeFalsy()

    // when
    const zitatstelleInput = screen.getByRole('textbox', { name: 'zitatstelle' })
    await user.type(periodikumInput, 'bundesanzeigerTestId')
    await user.clear(zitatstelleInput)
    await user.click(screen.getByRole('button', { name: 'Fundstelle übernehmen' }))
    // then
    expect(screen.getByText('Pflichtfeld nicht befüllt')).toBeVisible()
    expect(emitted()['updateFundstelle']).toBeFalsy()
  })
})
