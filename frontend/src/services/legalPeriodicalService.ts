import type { Periodikum } from '@/domain/fundstelle'
import { useApiFetch } from '@/services/apiService'
import type { UseFetchReturn } from '@vueuse/core'

const LEGAL_PERIODICALS_URL = '/lookup-tables/legal-periodicals'

export function useFetchLegalPeriodicals(): UseFetchReturn<{
  legalPeriodicals: Periodikum[]
}> {
  return useApiFetch(`${LEGAL_PERIODICALS_URL}?usePagination=false`, {}).json()
}
