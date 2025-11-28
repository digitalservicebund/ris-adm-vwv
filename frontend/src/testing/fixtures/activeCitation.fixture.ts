import { zitierArtAbgrenzungFixture } from './zitierArt.fixture'

export const activeCitationFixture = {
  uuid: crypto.randomUUID(),
  court: {
    id: 'courtTestId',
    type: 'type1',
    location: 'location1',
    label: 'label1',
  },
  decisionDate: '2022-02-01',
  fileNumber: 'test fileNumber',
  documentType: {
    abbreviation: 'documentTypeShortcut1',
    name: 'documentType1',
  },
  citationType: zitierArtAbgrenzungFixture,
}
