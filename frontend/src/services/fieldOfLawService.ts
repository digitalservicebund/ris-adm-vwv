import httpClient, { type ServiceResponse } from './httpClient'
import type { Page } from '@/components/Pagination.vue'
import type { FieldOfLaw } from '@/domain/fieldOfLaw'
import errorMessages from '@/i18n/errors.json'

interface FieldOfLawService {
  getChildrenOf(identifier: string): Promise<ServiceResponse<FieldOfLaw[]>>
  getTreeForIdentifier(identifier: string): Promise<ServiceResponse<FieldOfLaw>>
  searchForFieldsOfLaw(
    page: number,
    size: number,
    query?: string,
    identifier?: string,
    norm?: string,
  ): Promise<ServiceResponse<Page<FieldOfLaw>>>
}

const service: FieldOfLawService = {
  async getChildrenOf(identifier: string) {
    const response = await httpClient.get<{ fieldsOfLaw: FieldOfLaw[] }>(
      `lookup-tables/fields-of-law/${identifier}/children`,
    )
    if (response.status >= 300) {
      response.error = {
        title: errorMessages.FIELDS_OF_LAW_COULD_NOT_BE_LOADED.title.replace(
          '${identifier}',
          identifier,
        ),
      }
    }

    if (response.error) return response

    return {
      status: response.status,
      data: response.data?.fieldsOfLaw,
    }
  },
  async getTreeForIdentifier(identifier: string) {
    const response = await httpClient.get<FieldOfLaw>(`lookup-tables/fields-of-law/${identifier}`)
    if (response.status >= 300) {
      response.error = {
        title: errorMessages.FIELD_OF_LAW_COULD_NOT_BE_LOADED.title,
      }
    }
    return response
  },
  async searchForFieldsOfLaw(
    page: number,
    size: number,
    query?: string,
    identifier?: string,
    norm?: string,
  ) {
    const response = await httpClient.get<Page<FieldOfLaw>>(
      `lookup-tables/fields-of-law?page=${page}&size=${size}&identifier=${identifier}&text=${query}&norm=${norm}`,
    )
    if (response.status >= 300) {
      response.error = {
        title: errorMessages.FIELD_OF_LAW_SEARCH_FAILED.title,
      }
    }
    return response
  },
}

export default service
