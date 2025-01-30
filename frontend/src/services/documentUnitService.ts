import ActiveCitation from '@/domain/activeCitation'
import RelatedDocumentation from '@/domain/relatedDocumentation'

interface DocumentUnitService {
  searchByRelatedDocumentation(
    query: RelatedDocumentation,
    requestParams?: { [key: string]: string } | undefined,
  ): unknown
}

const service: DocumentUnitService = {
  async searchByRelatedDocumentation(
    query: RelatedDocumentation = new RelatedDocumentation(),
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
