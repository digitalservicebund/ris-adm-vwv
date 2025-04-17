import { userEvent } from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import ActiveReference, { ActiveReferenceType } from '@/domain/activeReference.ts'
import ActiveReferenceInput from '@/components/ActiveReferenceInput.vue'
import { config } from '@vue/test-utils'
import InputText from 'primevue/inputtext'

function renderComponent(options?: { modelValue?: ActiveReference }) {
  const user = userEvent.setup()
  const props = {
    modelValue: new ActiveReference({ ...options?.modelValue }),
  }
  const utils = render(ActiveReferenceInput, { props })
  return { user, props, ...utils }
}

describe('ActiveReferenceInput', () => {
  beforeAll(() => {
    // InputMask evaluates cursor position on every keystroke, however, our browser vitest setup does not
    // implement any layout-related functionality, meaning the required functions for cursor offset
    // calculation are missing. When we deal with typing in date/ year / time inputs, we can mock it with
    // TextInput, as we only need the string and do not need to test the actual mask behaviour.
    config.global.stubs = {
      InputMask: InputText,
    }
  })

  afterAll(() => {
    // Mock needs to be reset (and can not be mocked globally) because InputMask has interdependencies
    // with the PrimeVue select component. When testing the select components with InputMask
    // mocked globally, they fail due to these dependencies.
    config.global.stubs = {}
  })

  it('render empty norm input group on initial load', async () => {
    renderComponent()
    expect(screen.getByLabelText('Norm')).toBeInTheDocument()
    expect(screen.getByLabelText('Verwaltungsvorschrift')).toBeInTheDocument()
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
        referenceType: ActiveReferenceType.ANWENDUNG,
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
        referenceType: ActiveReferenceType.ANWENDUNG,
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
        referenceType: ActiveReferenceType.ANWENDUNG,
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
        referenceType: ActiveReferenceType.ANWENDUNG,
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
    await user.click(removeSingleNormButtons[0])
    expect((await screen.findAllByLabelText('Einzelnorm der Norm')).length).toBe(1)
  })

  it('removes last single norm in list', async () => {
    const { user } = renderComponent({
      modelValue: {
        referenceType: ActiveReferenceType.ANWENDUNG,
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
    await user.click(removeSingleNormButtons[0])
    expect(screen.queryByText('Einzelnorm der Norm')).not.toBeInTheDocument()
  })

  it('validates invalid norm input on blur', async () => {
    const { user } = renderComponent({
      modelValue: {
        referenceType: ActiveReferenceType.ANWENDUNG,
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
        referenceType: ActiveReferenceType.ANWENDUNG,
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
    renderComponent({
      modelValue: {
        referenceType: ActiveReferenceType.ANWENDUNG,
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
    screen.getByLabelText('Verweis speichern').click()
    expect(singleNormInput).toBeVisible()
  })

  it('does not add norm with invalid version date input', async () => {
    const { user } = renderComponent({
      modelValue: {
        referenceType: ActiveReferenceType.ANWENDUNG,
        normAbbreviation: { id: '123', abbreviation: 'ABC' },
      } as ActiveReference,
    })

    const dateInput = await screen.findByLabelText('Fassungsdatum der Norm')
    expect(dateInput).toHaveValue('')

    await user.type(dateInput, '00.00.0231')

    await screen.findByText(/Kein valides Datum/)
    screen.getByLabelText('Verweis speichern').click()
    expect(dateInput).toBeVisible()
  })

  it('does not add norm with incomplete version date input', async () => {
    const { user } = renderComponent({
      modelValue: {
        referenceType: ActiveReferenceType.ANWENDUNG,
        normAbbreviation: { id: '123', abbreviation: 'ABC' },
      } as ActiveReference,
    })

    const dateInput = await screen.findByLabelText('Fassungsdatum der Norm')
    expect(dateInput).toHaveValue('')

    await user.type(dateInput, '01')
    await user.tab()

    await screen.findByText(/Unvollständiges Datum/)
    screen.getByLabelText('Verweis speichern').click()
    expect(dateInput).toBeVisible()
  })

  it('does not add norm with invalid year input', async () => {
    renderComponent({
      modelValue: {
        referenceType: ActiveReferenceType.ANWENDUNG,
        normAbbreviation: { id: '123', abbreviation: 'ABC' },
        singleNorms: [
          {
            dateOfRelevance: '0000',
          },
        ],
      } as ActiveReference,
    })

    const yearInput = await screen.findByLabelText('Jahr der Norm')
    expect(yearInput).toHaveValue('0000')

    await screen.findByText(/Kein valides Jahr/)
    screen.getByLabelText('Verweis speichern').click()
    expect(yearInput).toBeVisible()
  })

  it('validates empty reference type', async () => {
    const { user } = renderComponent()

    const abbreviationField = screen.getByLabelText('RIS-Abkürzung')
    await user.type(abbreviationField, 'SGB')
    const dropdownItems = screen.getAllByLabelText('dropdown-option') as HTMLElement[]
    expect(dropdownItems[0]).toHaveTextContent('SGB 5')
    await user.click(dropdownItems[0])

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
        referenceType: ActiveReferenceType.ANWENDUNG,
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
    const { user, emitted } = renderComponent()

    const referenceTypeField = screen.getByLabelText('Art der Verweisung')
    await user.type(referenceTypeField, 'A')
    const referenceTypeDropdownItems = screen.getAllByLabelText('dropdown-option') as HTMLElement[]
    expect(referenceTypeDropdownItems[0]).toHaveTextContent('Anwendung')
    await user.click(referenceTypeDropdownItems[0])

    const abbreviationField = screen.getByLabelText('RIS-Abkürzung')
    await user.type(abbreviationField, 'SGB')
    const dropdownItems = screen.getAllByLabelText('dropdown-option') as HTMLElement[]
    expect(dropdownItems[0]).toHaveTextContent('SGB 5')
    await user.click(dropdownItems[0])

    const button = screen.getByLabelText('Verweis speichern')
    await user.click(button)
    expect(emitted('update:modelValue')).toEqual([
      [
        {
          referenceDocumentType: 'norm',
          referenceType: ActiveReferenceType.ANWENDUNG,
          normAbbreviation: {
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
        referenceType: ActiveReferenceType.ANWENDUNG,
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
        referenceType: ActiveReferenceType.ANWENDUNG,
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
        referenceType: ActiveReferenceType.ANWENDUNG,
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
        referenceType: ActiveReferenceType.ANWENDUNG,
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
        referenceType: ActiveReferenceType.ANWENDUNG,
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
        referenceType: ActiveReferenceType.ANWENDUNG,
        normAbbreviation: { id: '123', abbreviation: 'ABC' },
      } as ActiveReference,
    })

    const cancelEdit = screen.getByLabelText('Abbrechen')
    await user.click(cancelEdit)

    expect(emitted('cancelEdit')).toBeTruthy()
  })

  it('removes entry on cancel edit, when not previously saved yet', async () => {
    const { user, emitted } = renderComponent()

    const abbreviationField = screen.getByLabelText('RIS-Abkürzung')
    await user.type(abbreviationField, 'SGB')
    const dropdownItems = screen.getAllByLabelText('dropdown-option') as HTMLElement[]
    expect(dropdownItems[0]).toHaveTextContent('SGB 5')
    await user.click(dropdownItems[0])

    const cancelEdit = screen.getByLabelText('Abbrechen')
    await user.click(cancelEdit)

    expect(emitted('cancelEdit')).toBeTruthy()
    expect(emitted('removeEntry')).toBeTruthy()
  })

  it('removes multiple single norms on change to Verwaltungsvorschrift', async () => {
    // given
    const { user } = renderComponent()

    const referenceTypeField = screen.getByLabelText('Art der Verweisung')
    await user.type(referenceTypeField, 'A')
    const referenceTypeDropdownItems = screen.getAllByLabelText('dropdown-option') as HTMLElement[]
    expect(referenceTypeDropdownItems[0]).toHaveTextContent('Anwendung')
    await user.click(referenceTypeDropdownItems[0])

    const abbreviationField = screen.getByLabelText('RIS-Abkürzung')
    await user.type(abbreviationField, 'SGB')
    const dropdownItems = screen.getAllByLabelText('dropdown-option') as HTMLElement[]
    expect(dropdownItems[0]).toHaveTextContent('SGB 5')
    await user.click(dropdownItems[0])

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
    // given
    const { user } = renderComponent()
    const referenceTypeField = screen.getByLabelText('Art der Verweisung')
    await user.type(referenceTypeField, 'A')
    const referenceTypeDropdownItems = screen.getAllByLabelText('dropdown-option') as HTMLElement[]
    expect(referenceTypeDropdownItems[0]).toHaveTextContent('Anwendung')
    await user.click(referenceTypeDropdownItems[0])
    const abbreviationField = screen.getByLabelText('RIS-Abkürzung')
    await user.type(abbreviationField, 'SGB')
    const dropdownItems = screen.getAllByLabelText('dropdown-option') as HTMLElement[]
    expect(dropdownItems[0]).toHaveTextContent('SGB 5')
    await user.click(dropdownItems[0])
    await user.click(screen.getByRole('button', { name: 'Einzelnorm löschen' }))

    // when
    await user.click(screen.getByRole('radio', { name: 'Verwaltungsvorschrift auswählen' }))

    // then
    expect(screen.getByLabelText('Fassungsdatum der Norm')).toBeInTheDocument()
  })

  it('removes singleNorm and dateOfRelevance on change to Verwaltungsvorschrift', async () => {
    // given
    const { user } = renderComponent()

    const referenceTypeField = screen.getByLabelText('Art der Verweisung')
    await user.type(referenceTypeField, 'A')
    const referenceTypeDropdownItems = screen.getAllByLabelText('dropdown-option') as HTMLElement[]
    expect(referenceTypeDropdownItems[0]).toHaveTextContent('Anwendung')
    await user.click(referenceTypeDropdownItems[0])

    const abbreviationField = screen.getByLabelText('RIS-Abkürzung')
    await user.type(abbreviationField, 'SGB')
    const dropdownItems = screen.getAllByLabelText('dropdown-option') as HTMLElement[]
    expect(dropdownItems[0]).toHaveTextContent('SGB 5')
    await user.click(dropdownItems[0])

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
