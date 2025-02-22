import type { FailedValidationServerResponse, ServiceResponse } from './httpClient'
import type { Page } from '@/components/Pagination.vue'
import DocumentUnitDeprecatedClass, { type DocumentUnit } from '@/domain/documentUnit'
import ActiveCitation from '@/domain/activeCitation'
import RelatedDocumentation from '@/domain/relatedDocumentation'
import errorMessages from '@/i18n/errors.json'
import httpClient from './httpClient'
import DocumentUnitResponse from '@/domain/documentUnitResponse.ts'

interface DocumentUnitService {
  getByDocumentNumber(documentNumber: string): Promise<ServiceResponse<DocumentUnitResponse>>

  createNew(): Promise<ServiceResponse<DocumentUnitResponse>>

  update(
    documentUnit: DocumentUnit,
  ): Promise<ServiceResponse<DocumentUnitResponse | FailedValidationServerResponse>>

  searchByRelatedDocumentation(
    query: RelatedDocumentation,
    requestParams?: { [key: string]: string } | undefined,
  ): Promise<ServiceResponse<Page<RelatedDocumentation>>>
}

const service: DocumentUnitService = {
  async getByDocumentNumber(documentNumber: string) {
    const response = await httpClient.get<DocumentUnitResponse>(
      `documentation-units/${documentNumber}`,
    )
    if (response.status >= 300 || response.error) {
      response.data = undefined
      response.error = {
        title:
          response.status == 403
            ? errorMessages.DOCUMENT_UNIT_NOT_ALLOWED.title
            : errorMessages.DOCUMENT_UNIT_COULD_NOT_BE_LOADED.title,
      }
    }
    return response
  },

  async createNew() {
    const response = await httpClient.post<unknown, DocumentUnitResponse>('documentation-units', {
      headers: {
        Accept: 'application/json',
      },
    })
    if (response.status >= 300) {
      response.error = {
        title: errorMessages.DOCUMENT_UNIT_CREATION_FAILED.title,
      }
    } else {
      response.data = new DocumentUnitResponse({
        ...(response.data as DocumentUnitResponse),
      })
    }
    return response
  },

  async update(documentUnit: DocumentUnitDeprecatedClass) {
    const response = await httpClient.put<
      DocumentUnitDeprecatedClass,
      DocumentUnitResponse | FailedValidationServerResponse
    >(
      `documentation-units/${documentUnit.documentNumber}`,
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      },
      documentUnit,
    )

    if (response.status == 200) {
    } else if (response.status >= 300) {
      response.error = {
        title:
          response.status == 403
            ? errorMessages.NOT_ALLOWED.title
            : errorMessages.DOCUMENT_UNIT_UPDATE_FAILED.title,
      }
      // good enough condition to detect validation errors (@Valid)?
      if (response.status == 400 && JSON.stringify(response.data).includes('Validation failed')) {
        response.error.validationErrors = (response.data as FailedValidationServerResponse).errors
      } else {
        response.data = undefined
      }
    }
    return response
  },

  async searchByRelatedDocumentation(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    query: RelatedDocumentation = new RelatedDocumentation(),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    requestParams: { string?: string } = {},
  ) {
    return {
      status: 200,
      data: {
        content: [
          new ActiveCitation({
            uuid: '123',
            court: {
              type: 'type1',
              location: 'location1',
              label: 'label1',
            },
            decisionDate: '2022-02-01',
            documentType: {
              jurisShortcut: 'documentTypeShortcut1',
              label: 'documentType1',
            },
            fileNumber: 'test fileNumber1',
          }),
        ],
        size: 0,
        number: 0,
        numberOfElements: 20,
        first: true,
        last: false,
        empty: false,
      },
    }
  },
}

export default service
