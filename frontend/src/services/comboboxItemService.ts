import type { UseFetchReturn } from '@vueuse/core'
import type { Ref } from 'vue'
import { computed, ref } from 'vue'
import type { ComboboxInputModelType, ComboboxItem } from '@/components/input/types'
import type { ComboboxResult } from '@/domain/comboboxResult.ts'
import type { CitationType } from '@/domain/citationType'
import type { FieldOfLaw } from '@/domain/fieldOfLaw'
import errorMessages from '@/i18n/errors.json'
import type { DocumentType } from '@/domain/documentType'
import { useApiFetch } from './apiService'

enum Endpoint {
  documentTypes = 'lookup-tables/document-types',
  fieldsOfLaw = 'lookup-tables/fields-of-law',
}

function formatDropdownItems(
  responseData: ComboboxInputModelType[],
  endpoint: Endpoint,
): ComboboxItem[] {
  switch (endpoint) {
    case Endpoint.documentTypes: {
      return (responseData as DocumentType[]).map((item) => ({
        label: item.name,
        value: item,
        additionalInformation: item.abbreviation,
      }))
    }
    case Endpoint.fieldsOfLaw: {
      return (responseData as FieldOfLaw[]).map((item) => ({
        label: item.identifier,
        value: item,
        additionalInformation: item.text,
      }))
    }
  }

  return []
}

function fetchFromEndpoint(
  endpoint: Endpoint,
  filter: Ref<string | undefined>,
  options?: { pageSize?: number; usePagination?: boolean },
) {
  const requestParams = computed<{ searchTerm?: string; size?: string; paged?: string }>(() => ({
    ...(filter.value ? { searchTerm: filter.value } : {}),
    ...(options?.pageSize == undefined ? {} : { pageSize: options.pageSize.toString() }),
    ...(options?.usePagination == undefined
      ? {}
      : { usePagination: options?.usePagination?.toString() }),
  }))
  const url = computed(() => {
    let queryParams = new URLSearchParams(requestParams.value).toString()
    if (endpoint == Endpoint.fieldsOfLaw) {
      queryParams = queryParams.replace('searchTerm', 'identifier')
    }
    return `${endpoint}?${queryParams}`
  })

  return useApiFetch<ComboboxItem[]>(url, {
    afterFetch: (ctx) => {
      switch (endpoint) {
        case Endpoint.documentTypes:
          ctx.data = formatDropdownItems(ctx.data.documentTypes, endpoint)
          break
        case Endpoint.fieldsOfLaw:
          ctx.data = formatDropdownItems(ctx.data.fieldsOfLaw, endpoint)
          break
      }
      return ctx
    },
    onFetchError: ({ response }) => ({
      status: response?.status,
      error: {
        title: errorMessages.SERVER_ERROR_DROPDOWN.title,
        description: errorMessages.SERVER_ERROR_DROPDOWN.description,
      },
    }),
  }).json()
}

export type ComboboxItemService = {
  getDocumentTypes: (filter: Ref<string | undefined>) => UseFetchReturn<ComboboxItem[]>
  getCitationTypes: (filter: Ref<string | undefined>) => ComboboxResult<ComboboxItem[]>
  getFieldOfLawSearchByIdentifier: (
    filter: Ref<string | undefined>,
  ) => UseFetchReturn<ComboboxItem[]>
}

const service: ComboboxItemService = {
  getDocumentTypes: (filter: Ref<string | undefined>) =>
    fetchFromEndpoint(Endpoint.documentTypes, filter, { usePagination: false }),
  getCitationTypes: (filter: Ref<string | undefined>) => {
    const citationTypeValues = [
      {
        uuid: 'e52c14ac-1a5b-4ed2-9228-516489dd9f2a',
        jurisShortcut: 'Abgrenzung',
        label: 'Abgrenzung',
      },
      {
        uuid: '844b01a1-0c57-4889-98a2-281f613a77bb',
        jurisShortcut: 'Ablehnung',
        label: 'Ablehnung',
      },
      {
        uuid: 'c030c7d0-69da-4303-b3cb-c59056239435',
        jurisShortcut: 'Änderung',
        label: 'Änderung',
      },
      {
        uuid: 'cb8a0a8d-93d1-41ca-8279-f1c35083da8d',
        jurisShortcut: 'Übernahme',
        label: 'Übernahme',
      },
    ] as CitationType[]
    const citationTypes = ref(
      citationTypeValues.map((item) => <ComboboxItem>{ label: item.label, value: item }),
    )
    const execute = async () => {
      if (filter?.value && filter.value.length > 0) {
        const filteredItems = citationTypeValues.filter((item) =>
          item.label.toLowerCase().startsWith((filter.value as string).toLowerCase()),
        )
        const filteredComboBoxItems = filteredItems.map(
          (item) => <ComboboxItem>{ label: item.label, value: item },
        )
        citationTypes.value = [...filteredComboBoxItems]
      } else {
        citationTypes.value = citationTypeValues.map(
          (item) => <ComboboxItem>{ label: item.label, value: item },
        )
      }
      return service.getCitationTypes(filter)
    }
    const result: ComboboxResult<ComboboxItem[]> = {
      data: citationTypes,
      execute: execute,
      canAbort: computed(() => false),
      abort: () => {},
    }
    return result
  },
  getFieldOfLawSearchByIdentifier: (filter: Ref<string | undefined>) =>
    fetchFromEndpoint(Endpoint.fieldsOfLaw, filter, { pageSize: 30 }),
}

export default service
