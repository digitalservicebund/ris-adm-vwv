import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import MockAdapter from 'axios-mock-adapter'
import { axiosInstance } from '@/services/httpClient'
import FieldOfLawService from '@/services/fieldOfLawService.ts'

const fieldOfLawResponse = {
  fieldsOfLaw: [
    {
      hasChildren: false,
      identifier: 'AR-01',
      text: 'Arbeitsvertrag: Abschluss, Klauseln, Arten, Betriebsübergang',
      linkedFields: [],
      norms: [
        {
          abbreviation: 'BGB',
          singleNormDescription: '§ 611a',
        },
        {
          abbreviation: 'GewO',
          singleNormDescription: '§ 105',
        },
      ],
      children: [],
      parent: {
        hasChildren: true,
        identifier: 'AR',
        text: 'Arbeitsrecht',
        linkedFields: [],
        norms: [],
        children: [],
        parent: undefined,
      },
    },
  ],
}

describe('fieldOfLawService Mock before implementation', () => {
  it('getTreeForIdentifier', async () => {
    const fields = await FieldOfLawService.getTreeForIdentifier('')
    expect(fields.status).toEqual(200)
  })
  it('searchForFieldsOfLaw', async () => {
    const fields = await FieldOfLawService.searchForFieldsOfLaw(0, 0)
    expect(fields.status).toEqual(200)
  })
})

describe('fieldOfLawService getChildrenOf', () => {
  let server: MockAdapter

  beforeEach(() => {
    server = new MockAdapter(axiosInstance)
  })

  afterEach(() => {
    server.restore()
  })

  it('responds with data property and no error when http code is 200', async () => {
    server.onAny().reply(200, fieldOfLawResponse)

    const response = await FieldOfLawService.getChildrenOf('root')

    expect(server.history.get).toBeDefined()
    expect(server.history.get[0].url).toBe('/api/lookup-tables/fields-of-law/root/children')
    expect(response.data).toBeDefined()
    expect(response.error).toBeUndefined()
  })

  it('responds with no data property and error when http code is >= 300', async () => {
    server.onAny().reply(400)

    const response = await FieldOfLawService.getChildrenOf('THIS_DOES_NOT_EXIST')

    expect(response.data).toBeUndefined()
    expect(response.error).toBeDefined()
  })
})
