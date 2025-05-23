import { useFetch } from '@vueuse/core'
import type { Institution } from '@/domain/normgeber.ts'
import { API_PREFIX } from '@/services/httpClient.ts'

const INSTITUTION_URL = `${API_PREFIX}lookup-tables/institutions`

export function useFetchInstitutions() {
  return useFetch<{ institutions: Institution[] }>(
    `${INSTITUTION_URL}?usePagination=false`,
    {},
  ).json()
}
