import { describe, expect, it } from 'vitest'
import { PublicationState } from '@/domain/publicationStatus'
import RelatedDocumentation from '@/domain/relatedDocumentation'

describe('RelatedDocumentation', () => {
  it('renders decision with UNPUBLISHED status and without error', () => {
    const relatedDocumentation = new RelatedDocumentation({
      ...{
        court: {
          id: 'courtId',
          type: 'type1',
          location: 'location1',
        },
        fileNumber: 'fileNumber',
        decisionDate: '01.01.1998',
        documentType: {
          name: 'Beschluss',
          abbreviation: 'shortCut',
        },
        status: {
          publicationStatus: PublicationState.UNPUBLISHED,
          withError: false,
        },
      },
    })
    const decision = relatedDocumentation.renderSummary
    expect(decision).toEqual('type1 location1, 01.01.1998, fileNumber, Beschluss')
  })

  it('renders decision with UNPUBLISHED status and with error', () => {
    const relatedDocumentation = new RelatedDocumentation({
      ...{
        court: {
          id: 'courtId',
          type: 'type1',
          location: 'location1',
        },
        fileNumber: 'fileNumber',
        decisionDate: '01.01.1998',
        documentType: {
          name: 'Beschluss',
          abbreviation: 'shortCut',
        },
        status: {
          publicationStatus: PublicationState.UNPUBLISHED,
          withError: true,
        },
      },
    })
    const decision = relatedDocumentation.renderSummary
    expect(decision).toEqual('type1 location1, 01.01.1998, fileNumber, Beschluss')
  })

  it('renders decision without status', () => {
    const relatedDocumentation = new RelatedDocumentation({
      ...{
        court: {
          id: 'courtId',
          type: 'type1',
          location: 'location1',
        },
        fileNumber: 'fileNumber',
        decisionDate: '01.01.1998',
        documentType: {
          name: 'Beschluss',
          abbreviation: 'shortCut',
        },
      },
    })
    const decision = relatedDocumentation.renderSummary
    expect(decision).toEqual('type1 location1, 01.01.1998, fileNumber, Beschluss')
  })
})
