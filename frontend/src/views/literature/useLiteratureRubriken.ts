import { computed } from 'vue'
import type { DocumentType } from '@/domain/documentType'

/**
 * Shared composable for literature document unit rubriken fields.
 * Extracts the duplicated computed properties used in both ULI and SLI Rubriken views.
 */
export function useLiteratureRubriken<
  T extends {
    documentUnit: {
      veroeffentlichungsjahr?: string
      dokumenttypen?: DocumentType[]
      hauptsachtitel?: string
      dokumentarischerTitel?: string
      hauptsachtitelZusatz?: string
    } | null
  },
>(store: T) {
  const veroeffentlichungsjahr = computed({
    get: () => store.documentUnit?.veroeffentlichungsjahr,
    set: (newValue) => {
      store.documentUnit!.veroeffentlichungsjahr = newValue
    },
  })

  const dokumenttypen = computed({
    get: () => store.documentUnit?.dokumenttypen || [],
    set: (newValue) => {
      store.documentUnit!.dokumenttypen = newValue
    },
  })

  const hauptsachtitel = computed({
    get: () => store.documentUnit?.hauptsachtitel ?? '',
    set: (newValue) => {
      store.documentUnit!.hauptsachtitel = newValue
    },
  })

  const dokumentarischerTitel = computed({
    get: () => store.documentUnit?.dokumentarischerTitel ?? '',
    set: (newValue) => {
      store.documentUnit!.dokumentarischerTitel = newValue
    },
  })

  const hauptsachtitelZusatz = computed({
    get: () => store.documentUnit?.hauptsachtitelZusatz ?? '',
    set: (newValue) => {
      store.documentUnit!.hauptsachtitelZusatz = newValue
    },
  })

  return {
    veroeffentlichungsjahr,
    dokumenttypen,
    hauptsachtitel,
    dokumentarischerTitel,
    hauptsachtitelZusatz,
  }
}
