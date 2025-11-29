import { userEvent } from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import { InstitutionType, type Normgeber } from '@/domain/normgeber'
import NormgeberInput from './NormgeberInput.vue'
import { createTestingPinia } from '@pinia/testing'

const mockInstitutionNormgeber: Normgeber = {
  id: 'institutionNormgeberId',
  institution: {
    id: 'institutionId',
    name: 'Erstes Organ',
    type: InstitutionType.Institution,
    regions: [],
  },
  regions: [],
}

const mockLegalEntityNormgeber: Normgeber = {
  id: 'legalEntityNormgeberId',
  institution: {
    id: 'legalEntityId',
    name: 'Erste Jurpn',
    type: InstitutionType.LegalEntity,
    regions: [],
  },
  regions: [],
}

// Stubbing complex dropdown components with simple input fields to:
// - Hide their internal implementation during testing
// - Simplify interaction in tests (e.g., simulate user input easily)
// - Preserve essential props and emitted events for two-way binding
const stubs = {
  InstitutionDropdownStub: {
    props: ['modelValue', 'isInvalid'],
    emits: ['update:modelValue'],
    template: `
      <input
        :value="modelValue?.id || ''"
        @input="$emit('update:modelValue', { id: $event.target.value, type: 'INSTITUTION' })"
        :aria-invalid="isInvalid"
        data-testid="institution-input"
      >
      </input>
    `,
  },
  LegalEntityDropdownStub: {
    props: ['modelValue', 'isInvalid'],
    emits: ['update:modelValue'],
    template: `
      <input
        :value="modelValue?.id || ''"
        @input="$emit('update:modelValue', { id: $event.target.value, type: 'LEGAL_ENTITY' })"
        :aria-invalid="isInvalid"
        data-testid="institution-input"
      >
      </input>
    `,
  },
  RegionDropDown: {
    props: ['modelValue'],
    emits: ['update:modelValue'],
    template: `
      <input
        :value="modelValue?.id || ''"
        @input="$emit('update:modelValue', { id: $event.target.value })"
        data-testid="region-input"
      >
      </input>
    `,
  },
}

function renderComponent(
  props: { normgeber?: Normgeber; showCancelButton: boolean },
  stubs?: Record<string, object>,
) {
  const user = userEvent.setup()

  return {
    user,
    ...render(NormgeberInput, {
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
                    normgeberList: [],
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

describe('NormgeberInput', () => {
  it('render an empty normgeber input', async () => {
    renderComponent({ showCancelButton: false })
    expect(screen.getByText('Normgeber *')).toBeInTheDocument()
    expect(screen.getByText('Region')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Region' })).toHaveAttribute('readonly')
    expect(screen.getByRole('button', { name: 'Normgeber übernehmen' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Normgeber übernehmen' })).toBeDisabled()
    expect(screen.queryByRole('button', { name: 'Eintrag löschen' })).not.toBeInTheDocument()
  })

  it('renders the cancel button when prop set', async () => {
    renderComponent({ showCancelButton: true })
    expect(screen.getByRole('button', { name: 'Abbrechen' })).toBeInTheDocument()
  })

  it('renders an existing institution normgeber if set', async () => {
    renderComponent(
      { normgeber: mockInstitutionNormgeber, showCancelButton: true },
      { InstitutionDropDown: stubs.InstitutionDropdownStub, RegionDropDown: stubs.RegionDropDown },
    )

    expect(screen.getByTestId('institution-input')).toHaveValue('institutionId')
    expect(screen.getByTestId('region-input')).toHaveValue('')
    expect(screen.getByRole('button', { name: 'Abbrechen' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Eintrag löschen' })).toBeInTheDocument()
  })

  it('region is readonly for legal entity', async () => {
    renderComponent(
      { normgeber: mockLegalEntityNormgeber, showCancelButton: true },
      { InstitutionDropDown: stubs.LegalEntityDropdownStub },
    )
    expect(screen.getByTestId('institution-input')).toHaveValue('legalEntityId')
    expect(screen.getByLabelText('Region')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Region' })).toHaveValue('Keine Region zugeordnet')
    expect(screen.getByRole('textbox', { name: 'Region' })).toHaveAttribute('readonly')
  })

  it('shows region code for legal entity', async () => {
    const normgeber = { ...mockLegalEntityNormgeber }
    normgeber.institution.regions = [{ id: 'regionId', code: 'BY' }]
    renderComponent(
      { normgeber, showCancelButton: true },
      { InstitutionDropDown: stubs.LegalEntityDropdownStub },
    )
    expect(screen.getByRole('textbox', { name: 'Region' })).toHaveValue('BY')
  })

  it('should reset local state when clicking cancel', async () => {
    const { user, emitted } = renderComponent(
      { normgeber: mockLegalEntityNormgeber, showCancelButton: true },
      { InstitutionDropDown: stubs.LegalEntityDropdownStub },
    )

    // when
    const input = screen.getByTestId('institution-input')
    // then
    expect(input).toHaveValue('legalEntityId')

    // when
    await user.clear(input)
    await user.type(input, 'institutionId')
    // then
    expect(input).toHaveValue('institutionId')

    // when
    await user.click(screen.getByRole('button', { name: 'Abbrechen' }))
    // then
    expect(input).toHaveValue('legalEntityId')
    expect(emitted('cancel')).toBeTruthy()
  })

  it('should save updated entity', async () => {
    const { user, emitted } = renderComponent(
      { normgeber: mockLegalEntityNormgeber, showCancelButton: true },
      { InstitutionDropDown: stubs.InstitutionDropdownStub, RegionDropDown: stubs.RegionDropDown },
    )

    // when
    const institutionInput = screen.getByTestId('institution-input')
    await await user.clear(institutionInput)
    await user.type(institutionInput, 'institutionId')
    // then
    expect(institutionInput).toHaveValue('institutionId')
    expect(screen.getByText('Region *')).toBeInTheDocument()
    const regionInput = screen.getByTestId('region-input')
    expect(regionInput).toHaveValue('')
    expect(screen.getByRole('button', { name: 'Normgeber übernehmen' })).toBeDisabled()

    // when
    await user.type(regionInput, 'regionId1')
    // then
    expect(regionInput).toHaveValue('regionId1')
    expect(screen.getByRole('button', { name: 'Normgeber übernehmen' })).toBeEnabled()

    // when
    await user.click(screen.getByRole('button', { name: 'Normgeber übernehmen' }))
    // then
    const emittedVal = emitted('updateNormgeber') as [Normgeber[]]
    const updatedEntity = emittedVal?.[0][0]
    expect(updatedEntity!.id).toEqual(mockLegalEntityNormgeber.id)
    expect(updatedEntity!.institution.id).toEqual('institutionId')
    expect(updatedEntity!.regions[0]!.id).toEqual('regionId1')
  })

  it('should create new entity', async () => {
    vi.stubGlobal('crypto', {
      randomUUID: () => 'mocked-uuid',
    })

    const { user, emitted } = renderComponent(
      { showCancelButton: false },
      { InstitutionDropDown: stubs.LegalEntityDropdownStub },
    )

    // when
    const institutionInput = screen.getByTestId('institution-input')
    await await user.clear(institutionInput)
    await user.type(institutionInput, 'legalEntityId2')
    await user.click(screen.getByRole('button', { name: 'Normgeber übernehmen' }))
    // then
    const emittedVal = emitted('updateNormgeber') as [Normgeber[]]
    const createdEntity = emittedVal?.[0][0]
    expect(createdEntity!.id).toEqual('mocked-uuid')
    expect(createdEntity!.institution.id).toEqual('legalEntityId2')
  })

  it('should reset the region on institution change', async () => {
    const { user } = renderComponent(
      { normgeber: mockInstitutionNormgeber, showCancelButton: true },
      { InstitutionDropDown: stubs.InstitutionDropdownStub, RegionDropDown: stubs.RegionDropDown },
    )

    // when
    const institutionInput = screen.getByTestId('institution-input')
    const regionInput = screen.getByTestId('region-input')
    await user.type(regionInput, 'regionId0')
    await await user.clear(institutionInput)
    // then
    expect(regionInput).toHaveValue('')
    expect(screen.getByRole('button', { name: 'Normgeber übernehmen' })).toBeDisabled()
  })

  it('should delete an existing normgeber', async () => {
    const { user, emitted } = renderComponent({
      normgeber: mockInstitutionNormgeber,
      showCancelButton: true,
    })

    // when
    await user.click(screen.getByRole('button', { name: 'Eintrag löschen' }))
    // then
    const emittedVal = emitted('deleteNormgeber') as [string[]]
    const id = emittedVal?.[0][0]
    expect(id).toEqual(mockInstitutionNormgeber.id)
  })

  it('should not allow to add a normgeber already present', async () => {
    const user = userEvent.setup()
    render(NormgeberInput, {
      props: { showCancelButton: false },
      global: {
        plugins: [
          [
            createTestingPinia({
              initialState: {
                admDocumentUnit: {
                  documentUnit: {
                    id: '123',
                    documentNumber: '1234567891234',
                    normgeberList: [mockLegalEntityNormgeber],
                  },
                },
              },
            }),
          ],
        ],
        stubs: {
          InstitutionDropDown: stubs.LegalEntityDropdownStub,
          RegionDropDown: stubs.RegionDropDown,
        },
      },
    })

    // when
    const institutionInput = screen.getByTestId('institution-input')
    await await user.clear(institutionInput)
    await user.type(institutionInput, 'legalEntityId')
    // then
    expect(institutionInput).toHaveValue('legalEntityId')
    expect(institutionInput.getAttribute('aria-invalid')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Normgeber übernehmen' })).toBeDisabled()
    expect(screen.getByText('Normgeber bereits eingegeben')).toBeInTheDocument()
  })
})
