import { userEvent } from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import { InstitutionType, type Normgeber } from '@/domain/normgeber'
import NormgeberInput from './NormgeberInput.vue'
import { createTestingPinia } from '@pinia/testing'

vi.mock('@/services/institutionService.ts', () => ({
  useFetchInstitutions: vi.fn().mockResolvedValue({
    data: {
      value: {
        institutions: [
          {
            id: 'institutionId0',
            name: 'Erste Jurpn',
            officialName: 'Jurpn Eins',
            type: 'LEGAL_ENTITY',
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
          {
            id: 'institutionId3',
            name: 'Zweites Organ',
            officialName: null,
            type: 'INSTITUTION',
            regions: [],
          },
        ],
      },
    },
  }),
}))

vi.mock('@vueuse/core', async () => {
  const actual = await vi.importActual('@vueuse/core')

  return {
    ...actual,
    useDebounceFn: (fn: unknown) => fn,
  }
})

const mockInstitutionNormgeber: Normgeber = {
  id: 'institutionNormgeberId',
  institution: {
    id: 'institutionId1',
    name: 'Erstes Organ',
    type: InstitutionType.Institution,
    regions: [],
  },
  regions: [],
}

const mockLegalEntityNormgeber: Normgeber = {
  id: 'legalEntityNormgeberId',
  institution: {
    id: 'institutionId0',
    name: 'Erste Jurpn',
    type: InstitutionType.LegalEntity,
    regions: [],
  },
  regions: [],
}

function renderComponent(props: { normgeber?: Normgeber; showCancelButton: boolean }) {
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
                docunitStore: {
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
      },
    }),
  }
}

describe('NormgeberInput', () => {
  it('render an empty normgeber input', async () => {
    renderComponent({ showCancelButton: false })
    expect(screen.getByLabelText('Normgeber *')).toBeInTheDocument()
    expect(screen.getByLabelText('Region')).toBeInTheDocument()
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
    renderComponent({ normgeber: mockInstitutionNormgeber, showCancelButton: true })
    expect(screen.getByRole('combobox', { name: 'Normgeber' })).toHaveValue('Erstes Organ')
    expect(screen.getByLabelText('Region *')).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Region' })).toHaveValue('')
    expect(screen.getByRole('button', { name: 'Abbrechen' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Eintrag löschen' })).toBeInTheDocument()
  })

  it('region is readonly for legal entity', async () => {
    renderComponent({ normgeber: mockLegalEntityNormgeber, showCancelButton: true })
    expect(screen.getByRole('combobox', { name: 'Normgeber' })).toHaveValue('Erste Jurpn')
    expect(screen.getByLabelText('Region')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Region' })).toHaveValue('Keine Region zugeordnet')
    expect(screen.getByRole('textbox', { name: 'Region' })).toHaveAttribute('readonly')
  })

  it.skip('should reset local state when clicking cancel', async () => {
    const { user, emitted } = renderComponent({
      showCancelButton: true,
    })

    // when
    const input = screen.getByRole('combobox', { name: 'Normgeber' })
    await user.click(input)
    await user.type(input, 'Erste')
    // then
    const option = screen.getByRole('option', { name: 'Erste Jurpn' })
    await user.click(option)

    // then
    expect(input).toHaveValue('Erstes Organ')

    // when
    await user.click(screen.getByRole('button', { name: 'Abbrechen' }))
    // then
    expect(input).toHaveValue('Erste Jurpn')
    expect(emitted('cancel')).toBeTruthy()
  })

  it.skip('should save updated entity', async () => {
    const { user, emitted } = renderComponent({
      normgeber: mockLegalEntityNormgeber,
      showCancelButton: true,
    })

    // when
    await user.type(screen.getByRole('textbox', { name: 'Normgeber' }), 'Erste')
    await waitFor(() => {
      expect(screen.getAllByLabelText('dropdown-option')[1]).toHaveTextContent('Erstes Organ')
    })
    await user.click(screen.getAllByLabelText('dropdown-option')[1])
    // then
    expect(screen.getByRole('textbox', { name: 'Normgeber' })).toHaveValue('Erstes Organ')
    expect(screen.getByLabelText('Region *')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Region' })).toHaveValue('')
    expect(screen.getByRole('button', { name: 'Normgeber übernehmen' })).toBeDisabled()

    // when
    await user.type(screen.getByRole('textbox', { name: 'Region' }), 'BB')
    await waitFor(() => {
      expect(screen.getAllByLabelText('dropdown-option')[0]).toHaveTextContent('BB')
    })
    await user.click(screen.getAllByLabelText('dropdown-option')[0])
    // then
    expect(screen.getByRole('textbox', { name: 'Region' })).toHaveValue('BB')
    expect(screen.getByRole('button', { name: 'Normgeber übernehmen' })).toBeEnabled()

    // when
    await user.click(screen.getByRole('button', { name: 'Normgeber übernehmen' }))
    // then
    const emittedVal = emitted('updateNormgeber') as [Normgeber[]]
    const updatedEntity = emittedVal?.[0][0]
    expect(updatedEntity.id).toEqual(mockLegalEntityNormgeber.id)
    expect(updatedEntity.institution.id).toEqual('institutionId1')
    expect(updatedEntity.regions[0].id).toEqual('regionId1')
  })

  it.skip('should create new entity', async () => {
    const { user, emitted } = renderComponent({ showCancelButton: false })

    // when
    await user.type(screen.getByRole('combobox', { name: 'Normgeber' }), 'Zweite Jurpn')
    await waitFor(() => {
      expect(screen.getAllByLabelText('dropdown-option')[0]).toHaveTextContent('Zweite Jurpn')
    })
    await user.click(screen.getAllByLabelText('dropdown-option')[0])
    await user.click(screen.getByRole('button', { name: 'Normgeber übernehmen' }))
    // then
    const emittedVal = emitted('updateNormgeber') as [Normgeber[]]
    const updatedEntity = emittedVal?.[0][0]
    expect(updatedEntity.institution.id).toEqual('institutionId2')
    expect(updatedEntity.regions.length).toEqual(0)
  })

  it.skip('should reset the region on institution change', async () => {
    const { user, emitted } = renderComponent({
      normgeber: mockInstitutionNormgeber,
      showCancelButton: true,
    })

    // when
    await user.type(screen.getByRole('textbox', { name: 'Normgeber' }), 'Zweites Organ')
    await waitFor(() => {
      expect(screen.getAllByLabelText('dropdown-option')[0]).toHaveTextContent('Zweites Organ')
    })
    await user.click(screen.getAllByLabelText('dropdown-option')[0])
    // then
    expect(screen.getByRole('textbox', { name: 'Normgeber' })).toHaveValue('Zweites Organ')
    expect(screen.getByLabelText('Region *')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Region' })).toHaveValue('')
    expect(screen.getByRole('button', { name: 'Normgeber übernehmen' })).toBeDisabled()

    // when
    await user.type(screen.getByRole('textbox', { name: 'Region' }), 'AA')
    await waitFor(() => {
      expect(screen.getAllByLabelText('dropdown-option')[0]).toHaveTextContent('AA')
    })
    await user.click(screen.getAllByLabelText('dropdown-option')[0])
    // then
    expect(screen.getByRole('textbox', { name: 'Region' })).toHaveValue('AA')
    expect(screen.getByRole('button', { name: 'Normgeber übernehmen' })).toBeEnabled()

    // when
    await user.click(screen.getByRole('button', { name: 'Normgeber übernehmen' }))
    // then
    const emittedVal = emitted('updateNormgeber') as [Normgeber[]]
    const updatedEntity = emittedVal?.[0][0]
    expect(updatedEntity.id).toEqual(mockInstitutionNormgeber.id)
    expect(updatedEntity.institution.id).toEqual('institutionId3')
    expect(updatedEntity.regions[0].id).toEqual('regionId0')
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

  it.skip('region is required for institutional normgeber', async () => {
    const { user } = renderComponent({ showCancelButton: true })

    // when
    await user.type(screen.getByRole('textbox', { name: 'Normgeber' }), 'Erstes Organ')
    await waitFor(() => {
      expect(screen.getAllByLabelText('dropdown-option')[0]).toHaveTextContent('Erstes Organ')
    })
    await user.click(screen.getAllByLabelText('dropdown-option')[0])
    // then
    expect(screen.getByRole('textbox', { name: 'Normgeber' })).toHaveValue('Erstes Organ')
    expect(screen.getByRole('textbox', { name: 'Normgeber' })).toHaveAttribute('invalid', 'false')
    expect(screen.getByRole('button', { name: 'Normgeber übernehmen' })).toBeDisabled()
  })

  it.skip('should not allow to add a normgeber already present', async () => {
    const user = userEvent.setup()
    render(NormgeberInput, {
      props: { showCancelButton: false },
      global: {
        plugins: [
          [
            createTestingPinia({
              initialState: {
                docunitStore: {
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
      },
    })

    // when
    await user.type(screen.getByRole('textbox', { name: 'Normgeber' }), 'Erste Jurpn')
    await waitFor(() => {
      expect(screen.getAllByLabelText('dropdown-option')[0]).toHaveTextContent('Erste Jurpn')
    })
    await user.click(screen.getAllByLabelText('dropdown-option')[0])
    // then
    expect(screen.getByRole('textbox', { name: 'Normgeber' })).toHaveValue('Erste Jurpn')
    expect(screen.getByRole('textbox', { name: 'Normgeber' })).toHaveAttribute('invalid', 'true')
    expect(screen.getByRole('button', { name: 'Normgeber übernehmen' })).toBeDisabled()
    expect(screen.getByText('Normgeber bereits eingegeben')).toBeInTheDocument()
  })
})
