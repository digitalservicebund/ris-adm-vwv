import type { ReferenceType } from '@/domain/referenceType'
import { useApiFetch } from '@/services/apiService'
import type { UseFetchReturn } from '@vueuse/core'

const REFERENCE_TYPE_URL = '/lookup-tables/reference-types'

export function useFetchReferenceTypes(): UseFetchReturn<{
  referenceTypes: ReferenceType[]
}> {
  return useApiFetch(`${REFERENCE_TYPE_URL}?usePagination=false`, {}).json()
}
