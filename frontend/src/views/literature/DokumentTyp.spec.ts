import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  docTypeAnordnungFixture,
  docTypeBekanntmachungFixture,
} from '@/testing/fixtures/documentType.fixture'
import DokumentTyp from './DokumentTyp.vue'
import { DocumentCategory } from '@/domain/documentType'
import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'

describe('DokumentTyp', () => {
  const baseProps = {
    inputId: 'foo',
    invalid: false,
    documentCategory: DocumentCategory.LITERATUR_UNSELBSTAENDIG,
  }

  beforeEach(() => {
    vi.resetAllMocks()
    vi.resetModules()
  })

  it('renders correctly', async () => {
    const fetchSpy = vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({ documentTypes: [docTypeAnordnungFixture, docTypeBekanntmachungFixture] }),
        {
          status: 200,
        },
      ),
    )

    render(DokumentTyp, {
      props: {
        ...baseProps,
        modelValue: [],
      },
    })

    await vi.waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1))
    const autocomplete = screen.getByRole('listbox')
    expect(autocomplete).toBeVisible()
  })

  it('renders correctly on fetching error', async () => {
    const fetchSpy = vi.spyOn(window, 'fetch').mockRejectedValue('fetch error')

    render(DokumentTyp, {
      props: {
        ...baseProps,
      },
    })

    await vi.waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1))
    const autocomplete = screen.getByRole('listbox')
    expect(autocomplete).toBeVisible()
  })

  it('renders correctly with an existing value', async () => {
    const fetchSpy = vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({ documentTypes: [docTypeAnordnungFixture, docTypeBekanntmachungFixture] }),
        {
          status: 200,
        },
      ),
    )

    render(DokumentTyp, {
      props: {
        ...baseProps,
        modelValue: [
          {
            abbreviation: 'Anordnung',
            name: 'Anordnung',
          },
        ],
      },
    })

    await vi.waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1))
    expect(screen.getByRole('option', { name: 'Anordnung' })).toBeVisible()
  })

  it('opens the overlay on focus and selects an item', async () => {
    const user = userEvent.setup()

    const fetchSpy = vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({ documentTypes: [docTypeAnordnungFixture, docTypeBekanntmachungFixture] }),
        {
          status: 200,
        },
      ),
    )

    render(DokumentTyp, {
      props: {
        ...baseProps,
        modelValue: [],
      },
    })

    await vi.waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1))
    await user.click(screen.getByRole('combobox'))
    await expect(screen.getByRole('option', { name: 'Anordnung' })).toBeVisible()
    await user.click(screen.getByRole('option', { name: 'Anordnung' }))
    const listEl = screen.getAllByRole('option', { name: 'Anordnung' })
    expect(listEl[0]).toBeVisible()
    expect(listEl[0]).toHaveTextContent('Anordnung')
  })
})
