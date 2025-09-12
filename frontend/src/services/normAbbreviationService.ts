import type { NormAbbreviation } from '@/domain/normAbbreviation'
import { useApiFetch } from '@/services/apiService'
import type { UseFetchReturn } from '@vueuse/core'

const NORM_ABBREVIATION_URL = '/lookup-tables/ris-abbreviations'

export function useFetchNormAbbreviations(): UseFetchReturn<{
  normAbbreviations: NormAbbreviation[]
}> {
  return useApiFetch(`${NORM_ABBREVIATION_URL}?usePagination=false`, {}).json()
}
