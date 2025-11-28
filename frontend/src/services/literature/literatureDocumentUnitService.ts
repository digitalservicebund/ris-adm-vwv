import { useApiFetch } from '../apiService'
import { type UseFetchReturn } from '@vueuse/core'
import type { UliDocumentationUnit, UliDocumentUnitResponse } from '@/domain/uli/uliDocumentUnit'
import type { SliDocumentationUnit, SliDocumentUnitResponse } from '@/domain/sli/sliDocumentUnit'

const LITERATURE_DOCUMENTATION_UNITS_URL = '/literature/documentation-units'
const ULI_LITERATURE_DOCUMENTATION_UNITS_URL = '/literature/uli/documentation-units'
const SLI_LITERATURE_DOCUMENTATION_UNITS_URL = '/literature/sli/documentation-units'

export function usePutPublishUliDocUnit(
  documentUnit: UliDocumentationUnit,
): UseFetchReturn<UliDocumentationUnit> {
  return useApiFetch(
    `${ULI_LITERATURE_DOCUMENTATION_UNITS_URL}/${documentUnit.documentNumber}/publish`,
    {
      afterFetch: ({ data }) => {
        return {
          data: data ? mapResponseToUliDocUnit(data) : null,
        }
      },
      immediate: false,
    },
  )
    .json()
    .put(documentUnit)
}

export function usePutPublishSliDocUnit(
  documentUnit: SliDocumentationUnit,
): UseFetchReturn<SliDocumentationUnit> {
  return useApiFetch(
    `${SLI_LITERATURE_DOCUMENTATION_UNITS_URL}/${documentUnit.documentNumber}/publish`,
    {
      afterFetch: ({ data }) => {
        return {
          data: data ? mapResponseToSliDocUnit(data) : null,
        }
      },
      immediate: false,
    },
  )
    .json()
    .put(documentUnit)
}

export function usePostUliDocUnit(): UseFetchReturn<UliDocumentationUnit> {
  return useApiFetch(ULI_LITERATURE_DOCUMENTATION_UNITS_URL).json().post()
}

export function usePostSliDocUnit(): UseFetchReturn<SliDocumentationUnit> {
  return useApiFetch(SLI_LITERATURE_DOCUMENTATION_UNITS_URL).json().post()
}

export function useGetUliDocUnit(documentNumber: string): UseFetchReturn<UliDocumentationUnit> {
  return useApiFetch(`${LITERATURE_DOCUMENTATION_UNITS_URL}/${documentNumber}`, {
    afterFetch: ({ data }) => {
      return {
        data: data ? mapResponseToUliDocUnit(data) : null,
      }
    },
    immediate: false,
  }).json()
}

export function useGetSliDocUnit(documentNumber: string): UseFetchReturn<SliDocumentationUnit> {
  return useApiFetch(`${LITERATURE_DOCUMENTATION_UNITS_URL}/${documentNumber}`, {
    afterFetch: ({ data }) => {
      return {
        data: data ? mapResponseToSliDocUnit(data) : null,
      }
    },
    immediate: false,
  }).json()
}

export function usePutUliDocUnit(
  documentUnit: UliDocumentationUnit,
): UseFetchReturn<UliDocumentationUnit> {
  return useApiFetch(`${LITERATURE_DOCUMENTATION_UNITS_URL}/${documentUnit.documentNumber}`, {
    afterFetch: ({ data }) => {
      return {
        data: data ? mapResponseToUliDocUnit(data) : null,
      }
    },
    immediate: false,
  })
    .json()
    .put(documentUnit)
}

export function usePutSliDocUnit(
  documentUnit: SliDocumentationUnit,
): UseFetchReturn<SliDocumentationUnit> {
  return useApiFetch(`${LITERATURE_DOCUMENTATION_UNITS_URL}/${documentUnit.documentNumber}`, {
    afterFetch: ({ data }) => {
      return {
        data: data ? mapResponseToSliDocUnit(data) : null,
      }
    },
    immediate: false,
  })
    .json()
    .put(documentUnit)
}

function mapResponseToSliDocUnit(data: SliDocumentUnitResponse): SliDocumentationUnit {
  const documentUnit: SliDocumentationUnit = {
    ...data.json,
    id: data.id,
    documentNumber: data.documentNumber,
  }
  documentUnit.note = documentUnit.note || ''
  return documentUnit
}

function mapResponseToUliDocUnit(data: UliDocumentUnitResponse): UliDocumentationUnit {
  const documentUnit: UliDocumentationUnit = {
    ...data.json,
    id: data.id,
    documentNumber: data.documentNumber,
  }
  documentUnit.note = documentUnit.note || ''
  return documentUnit
}
