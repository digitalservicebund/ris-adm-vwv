import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  useGetUliDocUnit,
  useGetSliDocUnit,
  usePostUliDocUnit,
  usePostSliDocUnit,
  usePutPublishUliDocUnit,
  usePutPublishSliDocUnit,
  usePutUliDocUnit,
  usePutSliDocUnit,
} from '@/services/literature/literatureDocumentUnitService'
import { until } from '@vueuse/core'

describe('documentUnitService', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.resetModules()
  })

  it('fetches a ULI doc unit', async () => {
    const docUnit = {
      id: '8de5e4a0-6b67-4d65-98db-efe877a260c4',
      documentNumber: 'KSNR054920707',
      note: '',
    }

    const docUnitResp = {
      id: '8de5e4a0-6b67-4d65-98db-efe877a260c4',
      documentNumber: 'KSNR054920707',
      json: docUnit,
    }

    vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(docUnitResp), { status: 200 }),
    )

    const { data, error, isFetching, execute } = useGetUliDocUnit('KSLU054920707')
    await execute()

    expect(isFetching.value).toBe(false)
    expect(error.value).toBeFalsy()
    expect(data.value).toEqual(docUnit)
  })

  it('data is null when ULI fetch returns a null body', async () => {
    vi.spyOn(window, 'fetch').mockResolvedValue(new Response(JSON.stringify(null), { status: 200 }))

    const { data, execute } = useGetUliDocUnit('KSLU054920707')
    await execute()

    expect(data.value).toEqual(null)
  })

  it('returns an error on failed ULI fetch ', async () => {
    vi.spyOn(window, 'fetch').mockRejectedValue(new Error('fetch failed'))

    const { data, error, isFetching, execute } = useGetUliDocUnit('KSLU054920708')
    await execute()

    expect(isFetching.value).toBe(false)
    expect(error.value).toBeTruthy()
    expect(data.value).toBeNull()
  })

  it('updates a ULI doc unit', async () => {
    const docUnit = {
      id: '8de5e4a0-6b67-4d65-98db-efe877a260c4',
      documentNumber: 'KSLU054920707',
      note: '',
    }

    const updatedResp = {
      id: '8de5e4a0-6b67-4d65-98db-efe877a260c4',
      documentNumber: 'KSLU054920707',
      json: {
        id: '8de5e4a0-6b67-4d65-98db-efe877a260c4',
        documentNumber: 'KSLU054920707',
      },
    }

    vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(updatedResp), { status: 200 }),
    )

    const { data, error, isFetching, execute } = usePutUliDocUnit(docUnit)
    await execute()

    expect(isFetching.value).toBe(false)
    expect(error.value).toBeFalsy()
    expect(data.value?.id).toBe(docUnit.id)
  })

  it('returns an error on failed ULI update', async () => {
    vi.spyOn(window, 'fetch').mockRejectedValue(new Error('fetch failed'))

    const { data, error, isFetching, execute } = usePutUliDocUnit({
      id: '8de5e4a0-6b67-4d65-98db-efe877a260c4',
      documentNumber: 'KSLU054920707',
      note: '',
    })
    await execute()

    expect(isFetching.value).toBe(false)
    expect(error.value).toBeTruthy()
    expect(data.value).toBeNull()
  })

  it('data is null when ULI update call returns a null body', async () => {
    vi.spyOn(window, 'fetch').mockResolvedValue(new Response(JSON.stringify(null), { status: 200 }))

    const { data, execute } = usePutUliDocUnit({
      id: '8de5e4a0-6b67-4d65-98db-efe877a260c4',
      documentNumber: 'KSLU054920707',
      note: '',
    })
    await execute()

    expect(data.value).toEqual(null)
  })

  it('publishes a uli doc unit', async () => {
    const docUnit = {
      id: '8de5e4a0-6b67-4d65-98db-efe877a260c4',
      documentNumber: 'KSLU054920707',
      note: '',
    }

    const publishedResp = {
      id: '8de5e4a0-6b67-4d65-98db-efe877a260c4',
      documentNumber: 'KSLU054920707',
      json: {
        id: '8de5e4a0-6b67-4d65-98db-efe877a260c4',
        documentNumber: 'KSLU054920707',
      },
    }

    vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(publishedResp), { status: 200 }),
    )

    const { data, error, isFetching, execute } = usePutPublishUliDocUnit(docUnit)
    await execute()

    expect(isFetching.value).toBe(false)
    expect(error.value).toBeFalsy()
    expect(data.value?.id).toBe(docUnit.id)
  })

  it('returns an error on failed uli publication', async () => {
    vi.spyOn(window, 'fetch').mockRejectedValue(new Error('fetch failed'))

    const { data, error, isFetching, execute } = usePutPublishUliDocUnit({
      id: '8de5e4a0-6b67-4d65-98db-efe877a260c4',
      documentNumber: 'KSLU054920707',
      note: '',
    })
    await execute()

    expect(isFetching.value).toBe(false)
    expect(error.value).toBeTruthy()
    expect(data.value).toBeNull()
  })

  it('data is null when publish a uli doc returns a null body', async () => {
    vi.spyOn(window, 'fetch').mockResolvedValue(new Response(JSON.stringify(null), { status: 200 }))

    const { data, execute } = usePutPublishUliDocUnit({
      id: '8de5e4a0-6b67-4d65-98db-efe877a260c4',
      documentNumber: 'KSLU054920707',
      note: '',
    })
    await execute()

    expect(data.value).toEqual(null)
  })

  it('returns an error on failed ULI creation', async () => {
    vi.spyOn(window, 'fetch').mockRejectedValue(new Error('fetch failed'))

    const { data, error, isFetching, execute } = usePostUliDocUnit()
    await execute()

    expect(isFetching.value).toBe(false)
    expect(error.value).toBeTruthy()
    expect(data.value).toBeNull()
  })

  it('fetches a SLI doc unit', async () => {
    const docUnit = {
      id: '8de5e4a0-6b67-4d65-98db-efe877a260c4',
      documentNumber: 'KALS2025000001',
      note: '',
      veroeffentlichungsjahr: '2025',
    }

    const docUnitResp = {
      id: '8de5e4a0-6b67-4d65-98db-efe877a260c4',
      documentNumber: 'KALS2025000001',
      json: docUnit,
    }

    vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(docUnitResp), { status: 200 }),
    )

    const { data, error, isFetching, execute } = useGetSliDocUnit('KALS2025000001')
    await execute()

    expect(isFetching.value).toBe(false)
    expect(error.value).toBeFalsy()
    expect(data.value).toEqual(docUnit)
  })

  it('data is null when SLI fetch returns a null body', async () => {
    vi.spyOn(window, 'fetch').mockResolvedValue(new Response(JSON.stringify(null), { status: 200 }))

    const { data, execute } = useGetSliDocUnit('KALS2025000001')
    await execute()

    expect(data.value).toEqual(null)
  })

  it('returns an error on failed SLI fetch', async () => {
    vi.spyOn(window, 'fetch').mockRejectedValue(new Error('fetch failed'))

    const { data, error, isFetching, execute } = useGetSliDocUnit('KALS2025000001')
    await execute()

    expect(isFetching.value).toBe(false)
    expect(error.value).toBeTruthy()
    expect(data.value).toBeNull()
  })

  it('updates a SLI doc unit', async () => {
    const docUnit = {
      id: '8de5e4a0-6b67-4d65-98db-efe877a260c4',
      documentNumber: 'KALS2025000001',
      note: '',
      veroeffentlichungsjahr: '2025',
    }

    const updatedResp = {
      id: '8de5e4a0-6b67-4d65-98db-efe877a260c4',
      documentNumber: 'KALS2025000001',
      json: docUnit,
    }

    vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(updatedResp), { status: 200 }),
    )

    const { data, error, isFetching, execute } = usePutSliDocUnit(docUnit)
    await execute()

    expect(isFetching.value).toBe(false)
    expect(error.value).toBeFalsy()
    expect(data.value).toEqual(docUnit)
  })

  it('returns an error on failed SLI update', async () => {
    vi.spyOn(window, 'fetch').mockRejectedValue(new Error('fetch failed'))

    const { data, error, isFetching, execute } = usePutSliDocUnit({
      id: '8de5e4a0-6b67-4d65-98db-efe877a260c4',
      documentNumber: 'KALS2025000001',
      note: '',
    })
    await execute()

    expect(isFetching.value).toBe(false)
    expect(error.value).toBeTruthy()
    expect(data.value).toBeNull()
  })

  it('data is null when SLI update call returns a null body', async () => {
    vi.spyOn(window, 'fetch').mockResolvedValue(new Response(JSON.stringify(null), { status: 200 }))

    const { data, execute } = usePutSliDocUnit({
      id: '8de5e4a0-6b67-4d65-98db-efe877a260c4',
      documentNumber: 'KALS2025000001',
      note: '',
    })
    await execute()

    expect(data.value).toEqual(null)
  })

  it('creates a SLI doc unit', async () => {
    const createResp = {
      id: '8de5e4a0-6b67-4d65-98db-efe877a260c4',
      documentNumber: 'KALS2025000001',
      json: {
        id: '8de5e4a0-6b67-4d65-98db-efe877a260c4',
        documentNumber: 'KALS2025000001',
        note: '',
      },
    }

    vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(createResp), { status: 201 }),
    )

    const { data, error, isFetching, isFinished } = usePostSliDocUnit()
    await until(isFinished).toBe(true)

    expect(isFetching.value).toBe(false)
    expect(error.value).toBeFalsy()
    expect(data.value).toEqual(createResp)
  })

  it('returns an error on failed SLI creation', async () => {
    vi.spyOn(window, 'fetch').mockRejectedValue(new Error('fetch failed'))

    const { data, error, isFetching, execute } = usePostSliDocUnit()
    await execute()

    expect(isFetching.value).toBe(false)
    expect(error.value).toBeTruthy()
    expect(data.value).toBeNull()
  })

  it('publishes a sli doc unit', async () => {
    const docUnit = {
      id: '8de5e4a0-6b67-4d65-98db-efe877a260c4',
      documentNumber: 'KALS2025000001',
      note: '',
    }

    const publishedResp = {
      id: '8de5e4a0-6b67-4d65-98db-efe877a260c4',
      documentNumber: 'KALS2025000001',
      json: { id: '8de5e4a0-6b67-4d65-98db-efe877a260c4', documentNumber: 'KALS2025000001' },
    }

    vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(publishedResp), { status: 200 }),
    )

    const { data, error, isFetching, execute } = usePutPublishSliDocUnit(docUnit)
    await execute()

    expect(isFetching.value).toBe(false)
    expect(error.value).toBeFalsy()
    expect(data.value?.id).toBe(docUnit.id)
  })

  it('returns an error on failed sli publication', async () => {
    vi.spyOn(window, 'fetch').mockRejectedValue(new Error('fetch failed'))

    const { data, error, isFetching, execute } = usePutPublishSliDocUnit({
      id: '8de5e4a0-6b67-4d65-98db-efe877a260c4',
      documentNumber: 'KALS2025000001',
      note: '',
    })
    await execute()

    expect(isFetching.value).toBe(false)
    expect(error.value).toBeTruthy()
    expect(data.value).toBeNull()
  })

  it('data is null when publish a sli doc returns a null body', async () => {
    vi.spyOn(window, 'fetch').mockResolvedValue(new Response(JSON.stringify(null), { status: 200 }))

    const { data, execute } = usePutPublishSliDocUnit({
      id: '8de5e4a0-6b67-4d65-98db-efe877a260c4',
      documentNumber: 'KALS2025000001',
      note: '',
    })
    await execute()

    expect(data.value).toEqual(null)
  })
})
