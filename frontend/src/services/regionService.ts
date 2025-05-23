import { useFetch } from '@vueuse/core'
import type { Region } from '@/domain/normgeber.ts'
import { API_PREFIX } from '@/services/httpClient.ts'

const REGION_URL = `${API_PREFIX}lookup-tables/regions`

export function useFetchRegions() {
  return useFetch<{ regions: Region[] }>(`${REGION_URL}?usePagination=false`, {}).json()
}
