import { userEvent } from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import NormReferences from './NormReferences.vue'
import { type NormAbbreviation } from '@/domain/normAbbreviation'
import NormReference from '@/domain/normReference'
import SingleNorm from '@/domain/singleNorm'
import { createTestingPinia } from '@pinia/testing'
import type { AdmDocumentationUnit } from '@/domain/adm/admDocumentUnit'
import { config } from '@vue/test-utils'
import InputText from 'primevue/inputtext'
import { kvlgFixture, sgb5Fixture } from '@/testing/fixtures/normAbbreviation.fixture'

function renderComponent(normReferences?: NormReference[]) {
  const user = userEvent.setup()

  return {
    user,
    ...render(NormReferences, {
      global: {
        plugins: [
          [
            createTestingPinia({
              initialState: {
                admDocumentUnit: {
                  documentUnit: <AdmDocumentationUnit>{
                    documentNumber: '1234567891234',
                    normReferences: normReferences ?? [],
                  },
                },
              },
            }),
          ],
        ],
        stubs: { routerLink: { template: '<a><slot/></a>' } },
      },
    }),
  }
}

function generateNormReference(options?: {
  normAbbreviation?: NormAbbreviation
  singleNorms?: SingleNorm[]
}) {
  return new NormReference({
    normAbbreviation: options?.normAbbreviation ?? sgb5Fixture,
    singleNorms: options?.singleNorms ?? [],
  })
}

describe('NormReferences', () => {
  beforeAll(() => {
    config.global.stubs = {
      InputMask: InputText,
    }
  })

  afterAll(() => {
    config.global.stubs = {}
  })

  it('renders empty norm reference in edit mode, when no norm references in list', async () => {
    renderComponent()
    expect((await screen.findAllByLabelText('Listen Eintrag')).length).toBe(1)
    expect(await screen.findByLabelText('RIS-Abkürzung')).toBeInTheDocument()
  })

  it('renders norm references as list entries', () => {
    const normReferences: NormReference[] = [
      generateNormReference({
        singleNorms: [new SingleNorm({ singleNorm: '§ 123' })],
      }),
      generateNormReference({
        singleNorms: [new SingleNorm({ singleNorm: '§ 345' })],
      }),
    ]
    renderComponent(normReferences)

    expect(screen.getAllByLabelText('Listen Eintrag').length).toBe(2)
    expect(screen.queryByLabelText('RIS-Abkürzung')).not.toBeInTheDocument()
    expect(screen.getByText(/§ 123/)).toBeInTheDocument()
    expect(screen.getByText(/§ 345/)).toBeInTheDocument()
  })

  it('click on list item, opens the list entry in edit mode', async () => {
    const { user } = renderComponent([
      generateNormReference({
        singleNorms: [new SingleNorm({ singleNorm: '§ 123' })],
      }),
    ])
    await user.click(screen.getByTestId('list-entry-0'))

    expect(screen.getByLabelText('RIS-Abkürzung')).toBeInTheDocument()
    expect(screen.getByLabelText('Einzelnorm der Norm')).toBeInTheDocument()
    expect(screen.getByLabelText('Fassungsdatum der Norm')).toBeInTheDocument()
    expect(screen.getByLabelText('Jahr der Norm')).toBeInTheDocument()
  })

  it('validates against duplicate entries in new entries', async () => {
    const fetchSpy = vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ normAbbreviations: [sgb5Fixture, kvlgFixture] }), {
        status: 200,
      }),
    )

    const { user } = renderComponent([
      generateNormReference({
        normAbbreviation: sgb5Fixture,
      }),
    ])

    await user.click(screen.getByLabelText('Weitere Angabe'))
    await vi.waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1))

    const abbreviationField = screen.getByLabelText('RIS-Abkürzung')
    await user.type(abbreviationField, 'SGB')
    await user.click(screen.getByRole('option', { name: 'SGB 5' }))
    await screen.findByText(/RIS-Abkürzung bereits eingegeben/)
  })

  it('Removes duplicate entries in single norms', async () => {
    const { user } = renderComponent([
      generateNormReference({
        normAbbreviation: {
          id: 'normAbbrTestId',
          abbreviation: '1000g-BefV',
        },
        singleNorms: [
          new SingleNorm({
            singleNorm: '§ 345',
            dateOfRelevance: '2022',
            dateOfVersion: '01.01.2022',
          }),
        ],
      }),
    ])

    expect(screen.getByLabelText('Listen Eintrag')).toHaveTextContent(
      '1000g-BefV, § 345, 01.01.2022, 2022',
    )

    await user.click(screen.getByTestId('list-entry-0'))
    await user.click(screen.getByLabelText('Weitere Einzelnorm'))

    const singleNorms = await screen.findAllByLabelText('Einzelnorm der Norm')
    await user.type(singleNorms[1]!, '§ 345')

    const dates = await screen.findAllByLabelText('Fassungsdatum der Norm')
    await user.type(dates[1]!, '01.01.2022')

    const years = await screen.findAllByLabelText('Jahr der Norm')
    await user.type(years[1]!, '2022')

    const button = screen.getByLabelText('Norm speichern')
    await user.click(button)

    const listItems = screen.getAllByLabelText('Listen Eintrag')
    expect(listItems[0]).toHaveTextContent('1000g-BefV, § 345, 01.01.2022, 2022')
  })

  it('deletes norm reference', async () => {
    const { user } = renderComponent([
      generateNormReference(),
      generateNormReference({
        normAbbreviation: {
          id: 'normAbbrTestId',
          abbreviation: '1000g-BefV',
        },
      }),
    ])

    const norms = screen.getAllByLabelText('Listen Eintrag')
    expect(norms.length).toBe(2)
    await user.click(screen.getByTestId('list-entry-0'))
    await user.click(screen.getByLabelText('Eintrag löschen'))
    expect(screen.getAllByLabelText('Listen Eintrag').length).toBe(1)
  })

  it("click on 'Weitere Angabe' adds new emptry list entry", async () => {
    const { user } = renderComponent([generateNormReference(), generateNormReference()])
    const normsRefernces = screen.getAllByLabelText('Listen Eintrag')
    expect(normsRefernces.length).toBe(2)
    const button = screen.getByLabelText('Weitere Angabe')
    await user.click(button)
    expect(screen.getAllByLabelText('Listen Eintrag').length).toBe(3)
  })

  it('render summary with one single norms', async () => {
    renderComponent([
      generateNormReference({
        normAbbreviation: {
          id: 'normAbbrTestId',
          abbreviation: '1000g-BefV',
        },
        singleNorms: [new SingleNorm({ singleNorm: '§ 123' })],
      }),
    ])

    expect(screen.getByLabelText('Listen Eintrag')).toHaveTextContent('1000g-BefV, § 123')
  })

  it('render summary with multiple single norms', async () => {
    renderComponent([
      generateNormReference({
        normAbbreviation: {
          id: 'normAbbrTestId',
          abbreviation: '1000g-BefV',
        },
        singleNorms: [
          new SingleNorm({ singleNorm: '§ 123' }),
          new SingleNorm({
            singleNorm: '§ 345',
            dateOfRelevance: '02-02-2022',
            dateOfVersion: '2022',
          }),
        ],
      }),
    ])

    expect(screen.getByLabelText('Listen Eintrag')).toHaveTextContent(
      '1000g-BefV 1000g-BefV, § 123 1000g-BefV, § 345, 01.01.2022, 02-02-2022',
    )
  })

  it('render summary with no single norms', async () => {
    renderComponent([
      generateNormReference({
        normAbbreviation: {
          id: 'normAbbrTestId',
          abbreviation: '1000g-BefV',
        },
        singleNorms: [
          new SingleNorm({ singleNorm: '§ 123' }),
          new SingleNorm({
            singleNorm: '§ 345',
            dateOfRelevance: '02-02-2022',
            dateOfVersion: '2022',
          }),
        ],
      }),
    ])

    expect(screen.getByLabelText('Listen Eintrag')).toHaveTextContent(
      '1000g-BefV 1000g-BefV, § 123 1000g-BefV, § 345, 01.01.2022, 02-02-2022',
    )
  })

  it('render error badge, when norm reference is ambiguous', async () => {
    renderComponent([
      new NormReference({
        normAbbreviationRawValue: 'EWGAssRBes 1/80',
      }),
    ])

    expect(screen.getByText('Mehrdeutiger Verweis')).toBeInTheDocument()
  })
})
