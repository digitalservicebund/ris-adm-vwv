import type { Court } from '@/domain/court.ts'
import type { UseFetchReturn } from '@vueuse/core'
import { useApiFetch } from '@/services/apiService.ts'

const COURTS_URL = '/lookup-tables/courts'

export function useFetchCourts(): UseFetchReturn<{
  courts: Court[]
}> {
  return useApiFetch(`${COURTS_URL}?usePagination=false`, {}).json()
}
