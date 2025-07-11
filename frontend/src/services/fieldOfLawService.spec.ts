import { describe, expect, it, vi } from 'vitest'
import {
  useGetFieldOfLawChildren,
  useGetFieldOfLaw,
  useGetPaginatedFieldsOfLaw,
} from '@/services/fieldOfLawService.ts'
import { until } from '@vueuse/core'

describe('fieldOfLawService', () => {
  it('gets field of law children', async () => {
    const fieldOfLawResponse = {
      fieldsOfLaw: [
        {
          id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          hasChildren: true,
        },
      ],
    }

    vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(fieldOfLawResponse), { status: 200 }),
    )

    const { data, error, isFetching, isFinished } = useGetFieldOfLawChildren('PR-05')
    await until(isFinished).toBe(true)

    expect(isFetching.value).toBe(false)
    expect(error.value).toBeFalsy()
    expect(data.value?.length).toBe(1)
  })

  it('gets field of law parent and children', async () => {
    const fieldOfLawResponse = {
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      identifier: 'PR-05',
    }

    vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(fieldOfLawResponse), { status: 200 }),
    )

    const { data, error, isFetching, isFinished } = useGetFieldOfLaw('PR-05')
    await until(isFinished).toBe(true)

    expect(isFetching.value).toBe(false)
    expect(error.value).toBeFalsy()
    expect(data.value?.identifier).toBe('PR-05')
  })

  it('gets paginated fields of law', async () => {
    const paginatedResponse = {
      fieldsOfLaw: [
        {
          id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          identifier: 'PR-05',
        },
      ],
      page: {
        number: 0,
        size: 2,
      },
    }

    vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(paginatedResponse), { status: 200 }),
    )

    const { data, error, isFetching, isFinished } = useGetPaginatedFieldsOfLaw(0, 2)
    await until(isFinished).toBe(true)

    expect(isFetching.value).toBe(false)
    expect(error.value).toBeFalsy()
    expect(data.value?.fieldsOfLaw.length).toBe(1)
    expect(data.value?.page.number).toBe(0)
  })
})
