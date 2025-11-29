import { userEvent } from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ActiveReference from '@/domain/activeReference.ts'
import ActiveReferenceInput from './ActiveReferenceInput.vue'
import InputText from 'primevue/inputtext'
import { kvlgFixture, sgb5Fixture } from '@/testing/fixtures/normAbbreviation.fixture'
import {
  anwendungFixture,
  neuregelungFixture,
  rechtsgrundlageFixture,
} from '@/testing/fixtures/verweisTyp.fixture'

function renderComponent(options?: { modelValue?: ActiveReference }) {
  const user = userEvent.setup()
  const props = {
    modelValue: new ActiveReference({ ...options?.modelValue }),
  }
  const utils = render(ActiveReferenceInput, {
    props,
    global: {
      stubs: {
        InputMask: InputText,
      },
    },
  })
  return { user, props, ...utils }
}

describe('ActiveReferenceInput', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('render empty norm input group on initial load', async () => {
    renderComponent()
    expect(screen.getByRole('radio', { name: 'Norm auswählen' })).toBeInTheDocument()
    expect(
      screen.getByRole('radio', { name: 'Verwaltungsvorschrift auswählen' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('RIS-Abkürzung')).toBeInTheDocument()
    expect(screen.getByLabelText('Art der Verweisung')).toBeInTheDocument()

    expect(screen.queryByLabelText('Einzelnorm der Norm')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Fassungsdatum der Norm')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Jahr der Norm')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Verweis speichern')).not.toBeInTheDocument()
  })

  it('render values if given', async () => {
    renderComponent({
      modelValue: {
        verweisTyp: anwendungFixture,
        normAbbreviation: { id: '123', abbreviation: 'ABC' },
        singleNorms: [
          {
            singleNorm: '12',
            dateOfVersion: '2022-01-31',
            dateOfRelevance: '2023',
          },
        ],
      } as ActiveReference,
    })

    const abbreviationField = screen.getByLabelText('RIS-Abkürzung')

    const singleNormField = screen.getByLabelText('Einzelnorm der Norm')

    const versionField = screen.getByLabelText('Fassungsdatum der Norm')

    const relevanceField = screen.getByLabelText('Jahr der Norm')

    expect(abbreviationField).toHaveValue('ABC')
    expect(singleNormField).toHaveValue('12')
    expect(versionField).toHaveValue('31.01.2022')
    expect(relevanceField).toHaveValue('2023')
    expect(screen.getByLabelText('Verweis speichern')).toBeEnabled()
  })

  it('renders multiple single norm input groups', async () => {
    renderComponent({
      modelValue: {
        verweisTyp: anwendungFixture,
        normAbbreviation: { id: '123', abbreviation: 'ABC' },
        singleNorms: [
          {
            singleNorm: '§ 000',
            dateOfVersion: '2022-01-31',
            dateOfRelevance: '2023',
          },
          {
            singleNorm: '§ 123',
            dateOfVersion: '2022-01-31',
            dateOfRelevance: '2023',
          },
          {
            singleNorm: '§ 345',
            dateOfVersion: '2022-01-31',
            dateOfRelevance: '2023',
          },
        ],
      } as ActiveReference,
    })
    expect((await screen.findAllByLabelText('Einzelnorm der Norm')).length).toBe(3)
  })

  it('adds new single norm', async () => {
    const { user } = renderComponent({
      modelValue: {
        verweisTyp: anwendungFixture,
        normAbbreviation: { id: '123', abbreviation: 'ABC' },
        singleNorms: [
          {
            singleNorm: '12',
          },
        ],
      } as ActiveReference,
    })

    expect((await screen.findAllByLabelText('Einzelnorm der Norm')).length).toBe(1)
    const addSingleNormButton = screen.getByLabelText('Weitere Einzelnorm')
    await user.click(addSingleNormButton)
    expect((await screen.findAllByLabelText('Einzelnorm der Norm')).length).toBe(2)
  })

  it('removes single norm', async () => {
    const { user } = renderComponent({
      modelValue: {
        verweisTyp: anwendungFixture,
        normAbbreviation: { id: '123', abbreviation: 'ABC' },
        singleNorms: [
          {
            singleNorm: '12',
          },
          {
            singleNorm: '34',
          },
        ],
      } as ActiveReference,
    })

    expect((await screen.findAllByLabelText('Einzelnorm der Norm')).length).toBe(2)
    const removeSingleNormButtons = screen.getAllByLabelText('Einzelnorm löschen')
    await user.click(removeSingleNormButtons[0]!)
    expect((await screen.findAllByLabelText('Einzelnorm der Norm')).length).toBe(1)
  })

  it('removes last single norm in list', async () => {
    const { user } = renderComponent({
      modelValue: {
        verweisTyp: anwendungFixture,
        normAbbreviation: { id: '123', abbreviation: 'ABC' },
        singleNorms: [
          {
            singleNorm: '§ 34',
          },
        ],
      } as ActiveReference,
    })

    expect((await screen.findAllByLabelText('Einzelnorm der Norm')).length).toBe(1)
    const removeSingleNormButtons = screen.getAllByLabelText('Einzelnorm löschen')
    await user.click(removeSingleNormButtons[0]!)
    expect(screen.queryByText('Einzelnorm der Norm')).not.toBeInTheDocument()
  })

  it('validates invalid norm input on blur', async () => {
    const { user } = renderComponent({
      modelValue: {
        verweisTyp: anwendungFixture,
        normAbbreviation: { id: '123', abbreviation: 'ABC' },
      } as ActiveReference,
    })

    const singleNormInput = await screen.findByLabelText('Einzelnorm der Norm')
    await user.type(singleNormInput, '2021, Seite 21')
    expect(singleNormInput).toHaveValue('2021, Seite 21')
    await user.tab()

    await screen.findByText(/Inhalt nicht valide/)
  })

  it('validates invalid norm input on mount', async () => {
    renderComponent({
      modelValue: {
        verweisTyp: anwendungFixture,
        normAbbreviation: { id: '123', abbreviation: 'ABC' },
        singleNorms: [
          {
            singleNorm: '2021, Seite 21',
          },
        ],
      } as ActiveReference,
    })

    const singleNormInput = await screen.findByLabelText('Einzelnorm der Norm')
    expect(singleNormInput).toHaveValue('2021, Seite 21')

    await screen.findByText(/Inhalt nicht valide/)
  })

  it('does not add norm with invalid single norm input', async () => {
    const { user } = renderComponent({
      modelValue: {
        verweisTyp: anwendungFixture,
        normAbbreviation: { id: '123', abbreviation: 'ABC' },
        singleNorms: [
          {
            singleNorm: '2021, Seite 21',
          },
        ],
      } as ActiveReference,
    })

    const singleNormInput = await screen.findByLabelText('Einzelnorm der Norm')
    expect(singleNormInput).toHaveValue('2021, Seite 21')

    await screen.findByText(/Inhalt nicht valide/)
    await user.click(screen.getByLabelText('Verweis speichern'))
    expect(singleNormInput).toBeVisible()
  })

  it('does not add norm with invalid version date input', async () => {
    const { user } = renderComponent({
      modelValue: {
        verweisTyp: anwendungFixture,
        normAbbreviation: { id: '123', abbreviation: 'ABC' },
      } as ActiveReference,
    })

    const dateInput = await screen.findByLabelText('Fassungsdatum der Norm')
    expect(dateInput).toHaveValue('')

    await user.type(dateInput, '00.00.0231')

    await screen.findByText(/Kein valides Datum/)
    await user.click(screen.getByLabelText('Verweis speichern'))
    expect(dateInput).toBeVisible()
  })

  it('does not add norm with incomplete version date input', async () => {
    const { user } = renderComponent({
      modelValue: {
        verweisTyp: anwendungFixture,
        normAbbreviation: { id: '123', abbreviation: 'ABC' },
      } as ActiveReference,
    })

    const dateInput = await screen.findByLabelText('Fassungsdatum der Norm')
    expect(dateInput).toHaveValue('')

    await user.type(dateInput, '01')
    await user.tab()

    await screen.findByText(/Unvollständiges Datum/)
    await user.click(screen.getByLabelText('Verweis speichern'))
    expect(dateInput).toBeVisible()
  })

  it('does not add norm with invalid year input', async () => {
    const { user } = renderComponent({
      modelValue: {
        verweisTyp: anwendungFixture,
        normAbbreviation: { id: '123', abbreviation: 'ABC' },
      } as ActiveReference,
    })

    const yearInput = await screen.findByLabelText('Jahr der Norm')
    expect(yearInput).toHaveValue('')

    await user.type(yearInput, '0000')
    await user.tab()

    await screen.findByText(/Kein valides Jahr/)
    await user.click(screen.getByLabelText('Verweis speichern'))
    expect(yearInput).toBeVisible()
  })

  it('validates empty reference type', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')

    fetchSpy.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          verweisTypen: [anwendungFixture, neuregelungFixture, rechtsgrundlageFixture],
        }),
        {
          status: 200,
        },
      ),
    )

    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({ normAbbreviations: [sgb5Fixture, kvlgFixture] }), {
        status: 200,
      }),
    )

    const { user } = renderComponent()

    await vi.waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(2))

    const abbreviationField = screen.getByLabelText('RIS-Abkürzung')
    await user.type(abbreviationField, 'SGB')
    await user.click(screen.getByText('SGB 5'))

    const addButton = screen.getByLabelText('Verweis speichern')
    await user.click(addButton)

    expect(screen.getByText('Art der Verweisung fehlt')).toBeInTheDocument()
  })

  it('validates ambiguous norm reference input', async () => {
    renderComponent({
      modelValue: {
        normAbbreviationRawValue: 'EWGAssRBes 1/80',
      } as ActiveReference,
    })

    expect(screen.getByText('Mehrdeutiger Verweis')).toBeInTheDocument()
  })

  it('new input removes error message', async () => {
    const { user } = renderComponent({
      modelValue: {
        verweisTyp: anwendungFixture,
        normAbbreviation: { id: '123', abbreviation: 'ABC' },
        singleNorms: [
          {
            singleNorm: '2021, Seite 21',
          },
        ],
      } as ActiveReference,
    })

    const risAbbreviation = screen.getByLabelText('RIS-Abkürzung')
    expect(risAbbreviation).toHaveValue('ABC')

    const singleNormInput = screen.getByLabelText('Einzelnorm der Norm')
    expect(singleNormInput).toHaveValue('2021, Seite 21')

    await screen.findByText(/Inhalt nicht valide/)

    await user.type(singleNormInput, '{backspace}')

    expect(screen.queryByText(/Inhalt nicht valide/)).not.toBeInTheDocument()
  })

  it('correctly updates the value of ris abbreviation input', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')

    fetchSpy.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          verweisTypen: [anwendungFixture, neuregelungFixture, rechtsgrundlageFixture],
        }),
        {
          status: 200,
        },
      ),
    )

    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({ normAbbreviations: [sgb5Fixture, kvlgFixture] }), {
        status: 200,
      }),
    )

    const { user, emitted } = renderComponent()

    await vi.waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(2))

    const verweisTypField = screen.getByLabelText('Art der Verweisung')
    await user.type(verweisTypField, 'A')
    await user.click(screen.getByText('Anwendung'))

    const abbreviationField = screen.getByLabelText('RIS-Abkürzung')
    await user.type(abbreviationField, 'SGB')
    await user.click(screen.getByText('SGB 5'))

    const button = screen.getByLabelText('Verweis speichern')
    await user.click(button)
    expect(emitted('update:modelValue')).toEqual([
      [
        {
          referenceDocumentType: 'norm',
          verweisTyp: anwendungFixture,
          normAbbreviation: {
            id: 'sgb5TestId',
            abbreviation: 'SGB 5',
            officialLongTitle: 'Sozialgesetzbuch (SGB) Fünftes Buch (V)',
          },
          singleNorms: [],
          normAbbreviationRawValue: undefined,
        },
      ],
    ])
  })

  it('correctly updates the value of the single norm input', async () => {
    const { user } = renderComponent({
      modelValue: {
        verweisTyp: anwendungFixture,
        normAbbreviation: { id: '123', abbreviation: 'ABC' },
      } as ActiveReference,
    })
    const singleNormInput = await screen.findByLabelText('Einzelnorm der Norm')

    await user.type(singleNormInput, '§ 123')
    expect(singleNormInput).toHaveValue('§ 123')
  })

  it('correctly updates the value of the version date input', async () => {
    const { user } = renderComponent({
      modelValue: {
        verweisTyp: anwendungFixture,
        normAbbreviation: { id: '123', abbreviation: 'ABC' },
      } as ActiveReference,
    })

    const versionField = screen.getByLabelText('Fassungsdatum der Norm')
    await user.type(versionField, '31.01.2022')

    expect(versionField).toHaveValue('31.01.2022')
  })

  it('correctly updates the value of the version date input', async () => {
    const { user } = renderComponent({
      modelValue: {
        verweisTyp: anwendungFixture,
        normAbbreviation: { id: '123', abbreviation: 'ABC' },
      } as ActiveReference,
    })

    const relevanceField = screen.getByLabelText('Jahr der Norm')
    await user.type(relevanceField, '2023')

    expect(relevanceField).toHaveValue('2023')
  })

  it('emits add event', async () => {
    const { user, emitted } = renderComponent({
      modelValue: {
        verweisTyp: anwendungFixture,
        normAbbreviation: { id: '123', abbreviation: 'ABC' },
      } as ActiveReference,
    })

    const addButton = screen.getByLabelText('Verweis speichern')
    await user.click(addButton)

    expect(emitted('addEntry')).toBeTruthy()
  })

  it('emits delete event', async () => {
    const { user, emitted } = renderComponent({
      modelValue: {
        verweisTyp: anwendungFixture,
        normAbbreviation: { id: '123', abbreviation: 'ABC' },
      } as ActiveReference,
    })

    const deleteButton = screen.getByLabelText('Eintrag löschen')
    await user.click(deleteButton)

    expect(emitted('removeEntry')).toBeTruthy()
  })

  it('emits cancel edit', async () => {
    const { user, emitted } = renderComponent({
      modelValue: {
        verweisTyp: anwendungFixture,
        normAbbreviation: { id: '123', abbreviation: 'ABC' },
      } as ActiveReference,
    })

    const cancelEdit = screen.getByLabelText('Abbrechen')
    await user.click(cancelEdit)

    expect(emitted('cancelEdit')).toBeTruthy()
  })

  it('removes entry on cancel edit, when not previously saved yet', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')

    fetchSpy.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          verweisTypen: [anwendungFixture, neuregelungFixture, rechtsgrundlageFixture],
        }),
        {
          status: 200,
        },
      ),
    )

    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({ normAbbreviations: [sgb5Fixture, kvlgFixture] }), {
        status: 200,
      }),
    )

    const { user, emitted } = renderComponent()

    await vi.waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(2))

    const abbreviationField = screen.getByLabelText('RIS-Abkürzung')
    await user.type(abbreviationField, 'SGB')
    await user.click(screen.getByText('SGB 5'))

    const cancelEdit = screen.getByLabelText('Abbrechen')
    await user.click(cancelEdit)

    expect(emitted('cancelEdit')).toBeTruthy()
    expect(emitted('removeEntry')).toBeTruthy()
  })

  it('removes multiple single norms on change to Verwaltungsvorschrift', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')

    fetchSpy.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          verweisTypen: [anwendungFixture, neuregelungFixture, rechtsgrundlageFixture],
        }),
        {
          status: 200,
        },
      ),
    )

    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({ normAbbreviations: [sgb5Fixture, kvlgFixture] }), {
        status: 200,
      }),
    )

    // given
    const { user } = renderComponent()

    await vi.waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(2))

    const verweisTypField = screen.getByLabelText('Art der Verweisung')
    await user.type(verweisTypField, 'A')
    await user.click(screen.getByText('Anwendung'))

    const abbreviationField = screen.getByLabelText('RIS-Abkürzung')
    await user.type(abbreviationField, 'SGB')
    await user.click(screen.getByText('SGB 5'))

    await user.click(screen.getByRole('button', { name: 'Weitere Einzelnorm' }))
    await user.click(screen.getByRole('button', { name: 'Weitere Einzelnorm' }))

    let index = 0
    for (const dateOfVersionInput of screen.getAllByLabelText('Fassungsdatum der Norm')) {
      await user.type(dateOfVersionInput, `0${++index}.01.2025`)
    }

    // when
    await user.click(screen.getByRole('radio', { name: 'Verwaltungsvorschrift auswählen' }))

    // then
    expect(screen.getByDisplayValue(`01.01.2025`)).toBeInTheDocument()
    expect(screen.queryByDisplayValue('02.01.2025')).not.toBeInTheDocument()
    expect(screen.queryByDisplayValue('03.01.2025')).not.toBeInTheDocument()
  })

  it('Restore single norm on change to Verwaltungsvorschrift after removing all single norms', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')

    fetchSpy.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          verweisTypen: [anwendungFixture, neuregelungFixture, rechtsgrundlageFixture],
        }),
        {
          status: 200,
        },
      ),
    )

    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({ normAbbreviations: [sgb5Fixture, kvlgFixture] }), {
        status: 200,
      }),
    )

    const { user } = renderComponent()
    await vi.waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(2))

    const verweisTypField = screen.getByLabelText('Art der Verweisung')
    await user.type(verweisTypField, 'A')
    await user.click(screen.getByText('Anwendung'))
    const abbreviationField = screen.getByLabelText('RIS-Abkürzung')
    await user.type(abbreviationField, 'SGB')
    await user.click(screen.getByText('SGB 5'))
    await user.click(screen.getByRole('button', { name: 'Einzelnorm löschen' }))

    // when
    await user.click(screen.getByRole('radio', { name: 'Verwaltungsvorschrift auswählen' }))

    // then
    expect(screen.getByLabelText('Fassungsdatum der Norm')).toBeInTheDocument()
  })

  it('removes singleNorm and dateOfRelevance on change to Verwaltungsvorschrift', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')

    fetchSpy.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          verweisTypen: [anwendungFixture, neuregelungFixture, rechtsgrundlageFixture],
        }),
        {
          status: 200,
        },
      ),
    )

    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({ normAbbreviations: [sgb5Fixture, kvlgFixture] }), {
        status: 200,
      }),
    )

    // given
    const { user } = renderComponent()

    await vi.waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(2))

    const verweisTypField = screen.getByLabelText('Art der Verweisung')
    await user.type(verweisTypField, 'A')
    await user.click(screen.getByText('Anwendung'))

    const abbreviationField = screen.getByLabelText('RIS-Abkürzung')
    await user.type(abbreviationField, 'SGB')
    await user.click(screen.getByText('SGB 5'))

    const singleNormInput = screen.getByLabelText('Einzelnorm der Norm')
    await user.type(singleNormInput, 'ABC12345')

    const dateInput = await screen.findByLabelText('Fassungsdatum der Norm')
    await user.type(dateInput, '01.01.2020')

    const relevanceField = screen.getByLabelText('Jahr der Norm')
    await user.type(relevanceField, '2023')

    // when
    await user.click(screen.getByRole('radio', { name: 'Verwaltungsvorschrift auswählen' }))
    await user.click(screen.getByRole('radio', { name: 'Norm auswählen' }))

    // then
    expect(screen.queryByDisplayValue('ABC12345')).not.toBeInTheDocument()
    expect(screen.getByDisplayValue(`01.01.2020`)).toBeInTheDocument()
    expect(screen.queryByDisplayValue('2023')).not.toBeInTheDocument()
  })
})
