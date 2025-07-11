import type { FieldOfLaw, FieldOfLawResponse } from '@/domain/fieldOfLaw'
import type { UseFetchReturn } from '@vueuse/core'
import { useApiFetch } from './apiService'
import { computed, type Ref } from 'vue'
import { buildUrlWithParams } from '@/utils/urlHelpers'

const FIELD_OF_LAW_URL = '/lookup-tables/fields-of-law'

export function useGetFieldOfLawChildren(identifier: string): UseFetchReturn<FieldOfLaw[]> {
  return useApiFetch(`${FIELD_OF_LAW_URL}/${identifier}/children`, {
    afterFetch: ({ data }) => ({
      data: data.fieldsOfLaw,
    }),
  }).json()
}

export function useGetFieldOfLaw(identifier: string): UseFetchReturn<FieldOfLaw> {
  return useApiFetch(`${FIELD_OF_LAW_URL}/${identifier}`, {}).json()
}

export function useGetPaginatedFieldsOfLaw(
  pageNumber: number,
  pageSize: number,
  text?: Ref<string>,
  identifier?: Ref<string>,
  norm?: Ref<string>,
): UseFetchReturn<FieldOfLawResponse> {
  const urlWithParams = computed(() =>
    buildUrlWithParams(`${FIELD_OF_LAW_URL}`, {
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString(),
      identifier: identifier?.value,
      text: text?.value,
      norm: norm?.value,
    }),
  )
  return useApiFetch(urlWithParams).json()
}
