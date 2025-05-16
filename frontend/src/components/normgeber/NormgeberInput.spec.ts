import { userEvent } from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/vue'
import { describe, expect, it, beforeAll, afterAll } from 'vitest'
import { InstitutionType, type Normgeber } from '@/domain/normgeber'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import NormgeberInput from './NormgeberInput.vue'
import { createTestingPinia } from '@pinia/testing'

const regions = [
  {
    id: 'regionId1',
    code: 'AA',
    longText: null,
  },
  {
    id: 'regionId2',
    code: 'BB',
    longText: null,
  },
]

const institutions = [
  {
    id: 'institutionId1',
    name: 'Erste Jurpn',
    officialName: 'Jurpn Eins',
    type: 'LEGAL_ENTITY',
    regions: regions,
  },
  {
    id: 'institutionId2',
    name: 'Erstes Organ',
    officialName: 'Organ Eins',
    type: 'INSTITUTION',
    regions: [],
  },
  {
    id: 'institutionId3',
    name: 'Zweite Jurpn',
    officialName: null,
    type: 'LEGAL_ENTITY',
    regions: [],
  },
  {
    id: 'institutionId4',
    name: 'Zweites Organ',
    officialName: null,
    type: 'INSTITUTION',
    regions: [],
  },
]

const paginatedInstitutions = {
  pageable: 'INSTANCE',
  last: true,
  totalElements: 4,
  totalPages: 1,
  first: true,
  size: 4,
  number: 0,
  sort: {
    empty: true,
    sorted: false,
    unsorted: true,
  },
  numberOfElements: 4,
  empty: false,
}

const paginatedRegions = {
  pageable: 'INSTANCE',
  last: true,
  totalElements: 2,
  totalPages: 1,
  first: true,
  size: 2,
  number: 0,
  sort: {
    empty: true,
    sorted: false,
    unsorted: true,
  },
  numberOfElements: 2,
  empty: false,
}

const server = setupServer(
  http.get('/api/lookup-tables/institutions', ({ request }) => {
    const searchTerm = new URL(request.url).searchParams.get('searchTerm')
    const filteredItems = searchTerm
      ? institutions.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
      : institutions

    return HttpResponse.json({
      institutions: filteredItems,
      paginatedInstitutions: { ...paginatedInstitutions, content: filteredItems },
    })
  }),

  http.get('/api/lookup-tables/regions', ({ request }) => {
    const searchTerm = new URL(request.url).searchParams.get('searchTerm')
    const filteredItems = searchTerm
      ? regions.filter((item) => item.code?.toLowerCase().includes(searchTerm.toLowerCase()))
      : regions

    return HttpResponse.json({
      regions: filteredItems,
      paginatedRegions: { ...paginatedRegions, content: filteredItems },
    })
  }),
)

const mockInstitutionNormgeber: Normgeber = {
  id: 'institutionNormgeberId',
  institution: {
    id: institutions[1].id,
    label: institutions[1].name,
    type: InstitutionType.Institution,
    regions: [],
  },
  regions: [],
}

const mockLegalEntityNormgeber: Normgeber = {
  id: 'legalEntityNormgeberId',
  institution: {
    id: institutions[0].id,
    label: institutions[0].name,
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
  beforeAll(() => server.listen())
  afterAll(() => server.close())

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
    expect(screen.getByRole('textbox', { name: 'Normgeber' })).toHaveValue('Erstes Organ')
    expect(screen.getByLabelText('Region *')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Region' })).toHaveValue('')
    expect(screen.getByRole('button', { name: 'Abbrechen' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Eintrag löschen' })).toBeInTheDocument()
  })

  it('region is readonly for legal entity', async () => {
    renderComponent({ normgeber: mockLegalEntityNormgeber, showCancelButton: true })
    expect(screen.getByRole('textbox', { name: 'Normgeber' })).toHaveValue('Erste Jurpn')
    expect(screen.getByLabelText('Region')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Region' })).toHaveValue('Keine Region zugeordnet')
    expect(screen.getByRole('textbox', { name: 'Region' })).toHaveAttribute('readonly')
  })

  it('should reset local state when clicking cancel', async () => {
    const { user, emitted } = renderComponent({
      normgeber: mockLegalEntityNormgeber,
      showCancelButton: true,
    })

    // when
    await user.type(screen.getByRole('textbox', { name: 'Normgeber' }), 'Erste')
    await waitFor(() => {
      expect(screen.getAllByLabelText('dropdown-option')[1]).toHaveTextContent('Erstes Organ')
    })
    const dropdownItems = screen.getAllByLabelText('dropdown-option')
    await user.click(dropdownItems[1])
    // then
    expect(screen.getByRole('textbox', { name: 'Normgeber' })).toHaveValue('Erstes Organ')

    // when
    await user.click(screen.getByRole('button', { name: 'Abbrechen' }))
    // then
    expect(screen.getByRole('textbox', { name: 'Normgeber' })).toHaveValue('Erste Jurpn')
    expect(emitted('cancel')).toBeTruthy()
  })

  it('should save updated entity', async () => {
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
    expect(updatedEntity.institution.id).toEqual(institutions[1].id)
    expect(updatedEntity.regions[0].id).toEqual(regions[1].id)
  })

  it('should create new entity', async () => {
    const { user, emitted } = renderComponent({ showCancelButton: false })

    // when
    await user.type(screen.getByRole('textbox', { name: 'Normgeber' }), 'Zweite Jurpn')
    await waitFor(() => {
      expect(screen.getAllByLabelText('dropdown-option')[0]).toHaveTextContent('Zweite Jurpn')
    })
    await user.click(screen.getAllByLabelText('dropdown-option')[0])
    await user.click(screen.getByRole('button', { name: 'Normgeber übernehmen' }))
    // then
    const emittedVal = emitted('updateNormgeber') as [Normgeber[]]
    const updatedEntity = emittedVal?.[0][0]
    expect(updatedEntity.institution.id).toEqual(institutions[2].id)
    expect(updatedEntity.regions.length).toEqual(0)
  })

  it('should reset the region on institution change', async () => {
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
    expect(updatedEntity.institution.id).toEqual(institutions[3].id)
    expect(updatedEntity.regions[0].id).toEqual(regions[0].id)
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

  it('region is required for institutional normgeber', async () => {
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

  it('should not allow to add a normgeber already present', async () => {
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
