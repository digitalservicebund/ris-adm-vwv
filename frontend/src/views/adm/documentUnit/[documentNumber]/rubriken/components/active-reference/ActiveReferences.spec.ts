import { userEvent } from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ActiveReferences from './ActiveReferences.vue'
import { type NormAbbreviation } from '@/domain/normAbbreviation'
import SingleNorm from '@/domain/singleNorm'
import ActiveReference, { ActiveReferenceDocumentType } from '@/domain/activeReference.ts'
import { createTestingPinia } from '@pinia/testing'
import type { AdmDocumentationUnit } from '@/domain/adm/admDocumentUnit'
import InputText from 'primevue/inputtext'
import { kvlgFixture, sgb5Fixture } from '@/testing/fixtures/normAbbreviation.fixture'
import {
  anwendungFixture,
  neuregelungFixture,
  rechtsgrundlageFixture,
} from '@/testing/fixtures/verweisTyp.fixture'
import type { VerweisTyp } from '@/domain/verweisTyp.ts'

function renderComponent(activeReferences?: ActiveReference[]) {
  const user = userEvent.setup()

  return {
    user,
    ...render(ActiveReferences, {
      global: {
        plugins: [
          [
            createTestingPinia({
              initialState: {
                admDocumentUnit: {
                  documentUnit: <AdmDocumentationUnit>{
                    documentNumber: '1234567891234',
                    activeReferences: activeReferences ?? [],
                  },
                },
              },
            }),
          ],
        ],
        stubs: {
          routerLink: { template: '<a><slot/></a>' },
          InputMask: InputText,
        },
      },
    }),
  }
}

function generateActiveReference(options?: {
  referenceDocumentType?: ActiveReferenceDocumentType
  verweisTyp?: VerweisTyp
  normAbbreviation?: NormAbbreviation
  singleNorms?: SingleNorm[]
}) {
  return new ActiveReference({
    referenceDocumentType: options?.referenceDocumentType ?? ActiveReferenceDocumentType.NORM,
    verweisTyp: options?.verweisTyp ?? anwendungFixture,
    normAbbreviation: options?.normAbbreviation ?? sgb5Fixture,
    singleNorms: options?.singleNorms ?? [],
  })
}

describe('ActiveReferences', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders empty active reference in edit mode, when no active references in list', async () => {
    renderComponent()
    expect((await screen.findAllByLabelText('Listen Eintrag')).length).toBe(1)
    expect(await screen.findByLabelText('Art der Verweisung')).toBeInTheDocument()
    expect(await screen.findByLabelText('RIS-Abkürzung')).toBeInTheDocument()
  })

  it('renders active references as list entries', () => {
    const activeReferences: ActiveReference[] = [
      generateActiveReference({
        singleNorms: [new SingleNorm({ singleNorm: '§ 123' })],
      }),
      generateActiveReference({
        singleNorms: [new SingleNorm({ singleNorm: '§ 345' })],
      }),
    ]
    renderComponent(activeReferences)

    expect(screen.getAllByLabelText('Listen Eintrag').length).toBe(2)
    expect(screen.queryByLabelText('RIS-Abkürzung')).not.toBeInTheDocument()
    expect(screen.getByText(/§ 123/)).toBeInTheDocument()
    expect(screen.getByText(/§ 345/)).toBeInTheDocument()
  })

  it('click on list item, opens the list entry in edit mode', async () => {
    const { user } = renderComponent([
      generateActiveReference({
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

    const { user } = renderComponent([
      generateActiveReference({
        normAbbreviation: sgb5Fixture,
      }),
    ])
    await user.click(screen.getByLabelText('Weitere Angabe'))
    await vi.waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(2))

    const abbreviationField = screen.getByLabelText('RIS-Abkürzung')
    await user.type(abbreviationField, 'SGB')
    await user.click(screen.getByRole('option', { name: 'SGB 5' }))
    await screen.findByText(/RIS-Abkürzung bereits eingegeben/)
  })

  it('validates against duplicate entries in existing entries', async () => {
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

    const { user } = renderComponent([generateActiveReference()])
    await user.click(screen.getByTestId('list-entry-0'))
    await vi.waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(2))

    const abbreviationField = screen.getByLabelText('RIS-Abkürzung')
    await user.clear(abbreviationField)
    await user.type(abbreviationField, 'SGB')
    await waitFor(() => {
      expect(screen.getByText('SGB 5')).toBeVisible()
    })
    await user.click(screen.getByRole('option', { name: 'SGB 5' }))
    await screen.findByText(/RIS-Abkürzung bereits eingegeben/)
    const button = screen.getByLabelText('Verweis speichern')
    await user.click(button)
    await screen.findByText(/RIS-Abkürzung bereits eingegeben/)
  })

  it('Removes duplicate entries in single norms', async () => {
    const { user } = renderComponent([
      generateActiveReference({
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
      'Anwendung | 1000g-BefV, § 345, 01.01.2022, 2022',
    )

    await user.click(screen.getByTestId('list-entry-0'))
    await user.click(screen.getByLabelText('Weitere Einzelnorm'))

    const singleNorms = await screen.findAllByLabelText('Einzelnorm der Norm')
    await user.type(singleNorms[1]!, '§ 345')

    const dates = await screen.findAllByLabelText('Fassungsdatum der Norm')
    await user.type(dates[1]!, '01.01.2022')

    const years = await screen.findAllByLabelText('Jahr der Norm')
    await user.type(years[1]!, '2022')

    const button = screen.getByLabelText('Verweis speichern')
    await user.click(button)

    const listItems = screen.getAllByLabelText('Listen Eintrag')
    expect(listItems[0]).toHaveTextContent('1000g-BefV, § 345, 01.01.2022, 2022')
  })

  it('deletes norm reference', async () => {
    const { user } = renderComponent([
      generateActiveReference(),
      generateActiveReference({
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
    const { user } = renderComponent([generateActiveReference(), generateActiveReference()])
    const normsRefernces = screen.getAllByLabelText('Listen Eintrag')
    expect(normsRefernces.length).toBe(2)
    const button = screen.getByLabelText('Weitere Angabe')
    await user.click(button)
    expect(screen.getAllByLabelText('Listen Eintrag').length).toBe(3)
  })

  it('render summary with one single norms', async () => {
    renderComponent([
      generateActiveReference({
        verweisTyp: rechtsgrundlageFixture,
        normAbbreviation: {
          id: 'normAbbrTestId',
          abbreviation: '1000g-BefV',
        },
        singleNorms: [new SingleNorm({ singleNorm: '§ 123' })],
      }),
    ])

    expect(screen.getByLabelText('Listen Eintrag')).toHaveTextContent(
      'Rechtsgrundlage | 1000g-BefV, § 123',
    )
  })

  it('render summary with multiple single norms', async () => {
    renderComponent([
      generateActiveReference({
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
      generateActiveReference({
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

  it('render error badge, when active reference is ambiguous', async () => {
    renderComponent([
      new ActiveReference({
        normAbbreviationRawValue: 'EWGAssRBes 1/80',
      }),
    ])

    expect(screen.getByText('Mehrdeutiger Verweis')).toBeInTheDocument()
  })
})
