import type LegalPeriodicalInterface from '@/domain/legalPeriodical'
import { useApiFetch } from '@/services/apiService'
import type { UseFetchReturn } from '@vueuse/core'

const LEGAL_PERIODICALS_URL = '/lookup-tables/legal-periodicals'

export function useFetchLegalPeriodicals(): UseFetchReturn<{
  legalPeriodicals: LegalPeriodicalInterface[]
}> {
  return useApiFetch(`${LEGAL_PERIODICALS_URL}?usePagination=false`, {}).json()
}
