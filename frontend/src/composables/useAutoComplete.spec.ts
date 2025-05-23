import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  useAutoComplete,
  useInstitutionSearch,
  useRegionSearch,
  type AutoCompleteSuggestion,
} from '@/composables/useAutoComplete'
import type { AutoCompleteDropdownClickEvent } from 'primevue/autocomplete'
import { InstitutionType, type Institution, type Region } from '@/domain/normgeber'
import { ref } from 'vue'

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
