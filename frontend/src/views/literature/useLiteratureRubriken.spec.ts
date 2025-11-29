import { describe, it, expect, beforeEach } from 'vitest'
import { useLiteratureRubriken } from '@/views/literature/useLiteratureRubriken'
import type { DocumentType } from '@/domain/documentType'

type MockStore = {
  documentUnit: {
    veroeffentlichungsjahr?: string
    dokumenttypen?: DocumentType[]
    hauptsachtitel?: string
    dokumentarischerTitel?: string
    hauptsachtitelZusatz?: string
  } | null
}

describe('useLiteratureRubriken', () => {
  let mockStore: MockStore
  let composable: ReturnType<typeof useLiteratureRubriken<MockStore>>

  beforeEach(() => {
    mockStore = {
      documentUnit: {
        veroeffentlichungsjahr: '2024',
        dokumenttypen: [{ abbreviation: 'Bib', name: 'Bibliographie' }],
        hauptsachtitel: 'Main Title',
        dokumentarischerTitel: 'Documentary Title',
        hauptsachtitelZusatz: 'Title Addition',
      },
    }
    composable = useLiteratureRubriken(mockStore)
  })

  describe('veroeffentlichungsjahr', () => {
    it('gets the value from store', () => {
      expect(composable.veroeffentlichungsjahr.value).toBe('2024')
    })

    it('returns undefined when documentUnit is null', () => {
      mockStore.documentUnit = null
      const newComposable = useLiteratureRubriken(mockStore)
      expect(newComposable.veroeffentlichungsjahr.value).toBeUndefined()
    })

    it('sets the value to store', () => {
      composable.veroeffentlichungsjahr.value = '2025'
      expect(mockStore.documentUnit!.veroeffentlichungsjahr).toBe('2025')
    })

    it('handles undefined value', () => {
      mockStore.documentUnit!.veroeffentlichungsjahr = undefined
      expect(composable.veroeffentlichungsjahr.value).toBeUndefined()
    })
  })

  describe('dokumenttypen', () => {
    it('gets the value from store', () => {
      expect(composable.dokumenttypen.value).toEqual([
        { abbreviation: 'Bib', name: 'Bibliographie' },
      ])
    })

    it('returns empty array when documentUnit is null', () => {
      mockStore.documentUnit = null
      const newComposable = useLiteratureRubriken(mockStore)
      expect(newComposable.dokumenttypen.value).toEqual([])
    })

    it('returns empty array when dokumenttypen is undefined', () => {
      mockStore.documentUnit!.dokumenttypen = undefined
      expect(composable.dokumenttypen.value).toEqual([])
    })

    it('sets the value to store', () => {
      const newTypes: DocumentType[] = [
        { abbreviation: 'Ebs', name: 'E-Book' },
        { abbreviation: 'Dis', name: 'Dissertation' },
      ]
      composable.dokumenttypen.value = newTypes
      expect(mockStore.documentUnit!.dokumenttypen).toEqual(newTypes)
    })
  })

  describe('hauptsachtitel', () => {
    it('gets the value from store', () => {
      expect(composable.hauptsachtitel.value).toBe('Main Title')
    })

    it('returns empty string when documentUnit is null', () => {
      mockStore.documentUnit = null
      const newComposable = useLiteratureRubriken(mockStore)
      expect(newComposable.hauptsachtitel.value).toBe('')
    })

    it('returns empty string when hauptsachtitel is undefined', () => {
      mockStore.documentUnit!.hauptsachtitel = undefined
      expect(composable.hauptsachtitel.value).toBe('')
    })

    it('sets the value to store', () => {
      composable.hauptsachtitel.value = 'New Main Title'
      expect(mockStore.documentUnit!.hauptsachtitel).toBe('New Main Title')
    })
  })

  describe('dokumentarischerTitel', () => {
    it('gets the value from store', () => {
      expect(composable.dokumentarischerTitel.value).toBe('Documentary Title')
    })

    it('returns empty string when documentUnit is null', () => {
      mockStore.documentUnit = null
      const newComposable = useLiteratureRubriken(mockStore)
      expect(newComposable.dokumentarischerTitel.value).toBe('')
    })

    it('returns empty string when dokumentarischerTitel is undefined', () => {
      mockStore.documentUnit!.dokumentarischerTitel = undefined
      expect(composable.dokumentarischerTitel.value).toBe('')
    })

    it('sets the value to store', () => {
      composable.dokumentarischerTitel.value = 'New Documentary Title'
      expect(mockStore.documentUnit!.dokumentarischerTitel).toBe('New Documentary Title')
    })
  })

  describe('hauptsachtitelZusatz', () => {
    it('gets the value from store', () => {
      expect(composable.hauptsachtitelZusatz.value).toBe('Title Addition')
    })

    it('returns empty string when documentUnit is null', () => {
      mockStore.documentUnit = null
      const newComposable = useLiteratureRubriken(mockStore)
      expect(newComposable.hauptsachtitelZusatz.value).toBe('')
    })

    it('returns empty string when hauptsachtitelZusatz is undefined', () => {
      mockStore.documentUnit!.hauptsachtitelZusatz = undefined
      expect(composable.hauptsachtitelZusatz.value).toBe('')
    })

    it('sets the value to store', () => {
      composable.hauptsachtitelZusatz.value = 'New Title Addition'
      expect(mockStore.documentUnit!.hauptsachtitelZusatz).toBe('New Title Addition')
    })
  })
})
