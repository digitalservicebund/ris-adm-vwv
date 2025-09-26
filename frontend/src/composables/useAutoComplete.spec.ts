import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  useAutoComplete,
  useInstitutionSearch,
  useNormAbbreviationsSearch,
  usePeriodikumSearch,
  useReferenceTypeSearch,
  useRegionSearch,
  type AutoCompleteSuggestion,
} from '@/composables/useAutoComplete'
import type { AutoCompleteDropdownClickEvent } from 'primevue/autocomplete'
import { InstitutionType, type Institution, type Region } from '@/domain/normgeber'
import { ref } from 'vue'
import { amtsblattFixture, bundesanzeigerFixture } from '@/testing/fixtures/periodikum'
import type { Periodikum } from '@/domain/fundstelle'
import { kvlgFixture, sgb5Fixture } from '@/testing/fixtures/normAbbreviation'
import type { NormAbbreviation } from '@/domain/normAbbreviation'
import type { ReferenceType } from '@/domain/referenceType'
import { anwendungFixture, neuregelungFixture } from '@/testing/fixtures/referenceType'

describe('useAutoComplete', () => {
  // Mock debounce to avoid delay
  vi.mock('@vueuse/core', async () => {
    const actual = await vi.importActual('@vueuse/core')

    return {
      ...actual,
      useDebounceFn: (fn: unknown) => fn,
    }
  })

  const mockItems = [
    { id: '1', label: 'Berlin' },
    { id: '2', label: 'Bremen' },
    { id: '3', label: 'Bavaria' },
  ]

  function mockSearchFn(query?: string): AutoCompleteSuggestion[] {
    return mockItems.filter((item) =>
      item.label.toLowerCase().includes((query ?? '').toLowerCase()),
    )
  }

  let composable: ReturnType<typeof useAutoComplete>

  beforeEach(() => {
    composable = useAutoComplete(mockSearchFn)
  })

  it('returns filtered suggestions based on query (via onComplete)', async () => {
    composable.onComplete({ query: 'br' } as AutoCompleteDropdownClickEvent)

    expect(composable.suggestions.value).toEqual([{ id: '2', label: 'Bremen' }])
  })

  it('clears suggestions when dropdown is closed', () => {
    // First set something
    composable.suggestions.value = mockItems

    // Simulate dropdown close
    composable.onDropdownClick({ query: undefined })

    expect(composable.suggestions.value).toEqual([])
  })

  it('calls onComplete from onDropdownClick when dropdown opened', async () => {
    composable.onDropdownClick({ query: 'ba' } as AutoCompleteDropdownClickEvent)

    expect(composable.suggestions.value).toEqual([{ id: '3', label: 'Bavaria' }])
  })

  it('clears suggestions on item select', () => {
    composable.suggestions.value = mockItems

    composable.onItemSelect()

    expect(composable.suggestions.value).toEqual([])
  })

  it('returns all suggestions when query is empty', async () => {
    composable.onComplete({ query: '' } as AutoCompleteDropdownClickEvent)

    expect(composable.suggestions.value).toEqual(mockItems)
  })

  it('returns all suggestions when query is undefined', () => {
    composable.onComplete({ query: undefined })

    expect(composable.suggestions.value).toEqual(mockItems)
  })

  it('returns empty array when no matches found', () => {
    composable.onComplete({ query: 'zzz' } as AutoCompleteDropdownClickEvent)

    expect(composable.suggestions.value).toEqual([])
  })
})

describe('useInstitutionSearch', () => {
  const mockInstitutions = ref<Institution[]>([
    {
      id: '1',
      name: 'Bundestag',
      officialName: 'Deutscher Bundestag',
      type: InstitutionType.Institution,
    },
    {
      id: '2',
      name: 'Bundesrat',
      officialName: 'Der Bundesrat',
      type: InstitutionType.Institution,
    },
    {
      id: '3',
      name: 'AOK Bayern',
      officialName: 'AOK Krankenkasse Bayern',
      type: InstitutionType.LegalEntity,
    },
  ])

  it('returns all institutions when query is undefined', () => {
    const search = useInstitutionSearch(mockInstitutions)
    const results = search()
    expect(results).toHaveLength(3)
  })

  it('filters institutions by name case-insensitively', () => {
    const search = useInstitutionSearch(mockInstitutions)
    const results = search('bund')
    expect(results).toHaveLength(2)
    expect(results.map((r) => r.id)).toContain('1')
    expect(results.map((r) => r.id)).toContain('2')
  })

  it('returns empty array when no match is found', () => {
    const search = useInstitutionSearch(mockInstitutions)
    const results = search('NonExistent')
    expect(results).toEqual([])
  })

  it('maps filtered institutions to expected format', () => {
    const search = useInstitutionSearch(mockInstitutions)
    const [result] = search('bayern')
    expect(result).toEqual({
      id: '3',
      label: 'AOK Bayern',
      secondaryLabel: 'AOK Krankenkasse Bayern',
    })
  })
})

describe('useRegionSearch', () => {
  const mockRegions = ref<Region[]>([
    { id: '1', code: 'BY', longText: 'Bayern' },
    { id: '2', code: 'BE', longText: 'Berlin' },
    { id: '3', code: 'BW', longText: 'Baden-Württemberg' },
  ])

  it('returns all regions when query is empty', () => {
    const search = useRegionSearch(mockRegions)
    const results = search('')
    expect(results).toHaveLength(3)
  })

  it('returns filtered regions by code', () => {
    const search = useRegionSearch(mockRegions)
    const results = search('b')
    expect(results).toEqual([
      { id: '1', label: 'BY', secondaryLabel: 'Bayern' },
      { id: '2', label: 'BE', secondaryLabel: 'Berlin' },
      { id: '3', label: 'BW', secondaryLabel: 'Baden-Württemberg' },
    ])
  })

  it('is case-insensitive', () => {
    const search = useRegionSearch(mockRegions)
    const results = search('bw')
    expect(results).toEqual([{ id: '3', label: 'BW', secondaryLabel: 'Baden-Württemberg' }])
  })

  it('returns an empty array if no matches', () => {
    const search = useRegionSearch(mockRegions)
    const results = search('xyz')
    expect(results).toEqual([])
  })
})

describe('usePeriodikumSearch', () => {
  const mockPeriodika = ref<Periodikum[]>([bundesanzeigerFixture, amtsblattFixture])

  it('returns all periodika when query is empty', () => {
    const search = usePeriodikumSearch(mockPeriodika)
    const results = search('')
    expect(results).toHaveLength(2)
  })

  it('returns an empty array if no matches', () => {
    const search = usePeriodikumSearch(mockPeriodika)
    const results = search('xyz')
    expect(results).toEqual([])
  })

  it.each([
    ['title', 'bu'],
    ['abbreviation', 'BAnz'],
    ['label', 'BAnz | Bundesanzeiger'],
  ])('returns filtered periodika by %s', (_, query) => {
    const search = usePeriodikumSearch(mockPeriodika)
    const results = search(query)
    expect(results).toEqual([
      {
        id: bundesanzeigerFixture.id,
        label: `${bundesanzeigerFixture.abbreviation} | ${bundesanzeigerFixture.title}`,
        secondaryLabel: '',
      },
    ])
  })
})

describe('useNormAbbreviationsSearch', () => {
  const mockAbbr = ref<NormAbbreviation[]>([sgb5Fixture, kvlgFixture])

  it('returns all abbreviations when query is empty', () => {
    const search = useNormAbbreviationsSearch(mockAbbr)
    const results = search('')
    expect(results).toHaveLength(2)
  })

  it('returns an empty array if no matches', () => {
    const search = useNormAbbreviationsSearch(mockAbbr)
    const results = search('xyz')
    expect(results).toEqual([])
  })

  it.each([
    ['abbreviation', 'sg'],
    ['abbreviation', 'SGB'],
    ['officialLongTitle', 'Sozialgesetzbuch'],
    ['officialLongTitle', 'Fünftes'],
  ])('returns filtered norm abbreviations by %s', (_, query) => {
    const search = useNormAbbreviationsSearch(mockAbbr)
    const results = search(query)
    expect(results).toEqual([
      {
        id: sgb5Fixture.id,
        label: sgb5Fixture.abbreviation,
        secondaryLabel: sgb5Fixture.officialLongTitle,
      },
    ])
  })

  it('secondary label is empty when no official long title', () => {
    const search = useNormAbbreviationsSearch(ref([{ id: 'normTestId', abbreviation: 'normAbbr' }]))
    const results = search('normAbbr')
    expect(results).toEqual([{ id: 'normTestId', label: 'normAbbr' }])
  })
})

describe('useReferenceTypeSearch', () => {
  const mockRefTypes = ref<ReferenceType[]>([anwendungFixture, neuregelungFixture])

  it('returns all abbreviations when query is empty', () => {
    const search = useReferenceTypeSearch(mockRefTypes)
    const results = search('')
    expect(results).toHaveLength(2)
  })

  it('returns an empty array if no matches', () => {
    const search = useReferenceTypeSearch(mockRefTypes)
    const results = search('xyz')
    expect(results).toEqual([])
  })

  it.each([
    ['name', 'anwe'],
    ['name', 'Anwend'],
    ['name', 'Anwendung'],
  ])('returns filtered reference type by %s', (_, query) => {
    const search = useReferenceTypeSearch(mockRefTypes)
    const results = search(query)
    expect(results).toEqual([
      {
        id: anwendungFixture.id,
        label: 'Anwendung',
      },
    ])
  })
})
