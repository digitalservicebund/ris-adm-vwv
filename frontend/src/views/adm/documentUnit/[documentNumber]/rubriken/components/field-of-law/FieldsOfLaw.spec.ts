import { describe, expect, it, vi } from 'vitest'
import { userEvent } from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import FieldsOfLawVue from './FieldsOfLaw.vue'
import { type AdmDocumentationUnit } from '@/domain/adm/admDocumentUnit'
import type { FieldOfLaw } from '@/domain/fieldOfLaw'

function renderComponent() {
  const user = userEvent.setup()
  return {
    user,
    ...render(FieldsOfLawVue, {
      global: {
        stubs: {
          // this way the comboboxItemService is not triggered
          FieldOfLawDirectInputSearch: true,
          FieldOfLawTree: true,
        },
        plugins: [
          [
            createTestingPinia({
              initialState: {
                admDocumentUnit: {
                  documentUnit: <AdmDocumentationUnit>{
                    id: '123',
                    documentNumber: '1234567891234',
                    fieldsOfLaw: [] as FieldOfLaw[],
                  },
                },
              },
            }),
          ],
        ],
      },
    }),
  }
}

const searchResultsFixture = {
  fieldsOfLaw: [
    {
      hasChildren: true,
      identifier: 'PR-05',
      text: 'Beendigung der Phantasieverhältnisse',
      norms: [
        {
          abbreviation: 'PStG',
          singleNormDescription: '§ 99',
        },
      ],
      linkedFields: ['AB-01'],
      children: [],
      parent: {
        id: 'a785fb96-a45d-4d4c-8d9c-92d8a6592b22',
        hasChildren: true,
        identifier: 'PR',
        text: 'Phantasierecht',
        norms: [],
        children: [],
      },
    },
    {
      hasChildren: false,
      identifier: 'PR-05-01',
      text: 'Phantasie besonderer Art, Ansprüche anderer Art',
      norms: [],
      children: [],
      parent: {
        hasChildren: true,
        identifier: 'PR-05',
        text: 'Beendigung der Phantasieverhältnisse',
        norms: [
          {
            abbreviation: 'PStG',
            singleNormDescription: '§ 99',
          },
        ],
        children: [],
        parent: {
          id: 'a785fb96-a45d-4d4c-8d9c-92d8a6592b22',
          hasChildren: true,
          identifier: 'PR',
          text: 'Phantasierecht',
          norms: [],
          children: [],
        },
      },
    },
  ],
  page: {
    size: 2,
    number: 0,
    numberOfElements: 2,
    totalElements: 2,
    first: true,
    last: true,
    empty: false,
  },
}

describe('FieldsOfLaw', () => {
  it('Shows button Sachgebiete', async () => {
    // given when
    renderComponent()

    // then
    expect(screen.getByRole('button', { name: 'Sachgebiete hinzufügen' })).toBeInTheDocument()
  })

  it('Shows Radio group when clicking Sachgebiete button', async () => {
    // given
    const { user } = renderComponent()

    // when
    await user.click(screen.getByRole('button', { name: 'Sachgebiete hinzufügen' }))

    // then
    expect(screen.getByRole('radio', { name: 'Sachgebietsuche auswählen' })).toBeInTheDocument()
  })

  it('Shows error message when no search term is entered', async () => {
    // given
    const { user } = renderComponent()

    // when
    await user.click(screen.getByRole('button', { name: 'Sachgebiete hinzufügen' }))
    await user.click(screen.getByRole('radio', { name: 'Sachgebietsuche auswählen' }))
    await user.click(screen.getByRole('button', { name: 'Sachgebietssuche ausführen' }))

    // then
    expect(screen.getByText('Geben Sie mindestens ein Suchkriterium ein')).toBeInTheDocument()
  })

  it('Lists search results', async () => {
    const fetchSpy = vi
      .spyOn(window, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify(searchResultsFixture), { status: 200 }))

    // given
    const { user } = renderComponent()

    // when
    await user.click(screen.getByRole('button', { name: 'Sachgebiete hinzufügen' }))
    await user.click(screen.getByRole('radio', { name: 'Sachgebietsuche auswählen' }))
    await user.type(screen.getByLabelText('Sachgebietskürzel'), 'PR-05')
    await user.type(
      screen.getByLabelText('Sachgebietsbezeichnung'),
      'Beendigung der Phantasieverhältnisse',
    )
    await user.type(screen.getByLabelText('Sachgebietsnorm'), '§ 99')
    await user.click(screen.getByRole('button', { name: 'Sachgebietssuche ausführen' }))

    // then
    await waitFor(() => {
      expect(screen.getByText('Beendigung der Phantasieverhältnisse')).toBeInTheDocument()
    })
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        '/api/lookup-tables/fields-of-law?pageNumber=0&pageSize=10&identifier=PR-05&text=Beendigung+der+Phantasieverh%C3%A4ltnisse&norm=%C2%A7+99',
        expect.anything(),
      )
    })
  })

  it('Shows warning when backend responds with error message', async () => {
    // given
    vi.spyOn(window, 'fetch').mockRejectedValue(new Error('fetch failed'))
    const { user } = renderComponent()

    // when
    await user.click(screen.getByRole('button', { name: 'Sachgebiete hinzufügen' }))
    await user.click(screen.getByRole('radio', { name: 'Sachgebietsuche auswählen' }))
    await user.type(screen.getByLabelText('Sachgebietskürzel'), 'this triggers an error')
    await user.click(screen.getByRole('button', { name: 'Sachgebietssuche ausführen' }))

    // then
    await waitFor(() => {
      expect(
        screen.getByText(
          'Leider ist ein Fehler aufgetreten. Bitte versuchen Sie es zu einem späteren Zeitpunkt erneut.',
        ),
      ).toBeInTheDocument()
    })
  })

  it('Resets search results', async () => {
    vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(searchResultsFixture), { status: 200 }),
    )

    // given
    const { user } = renderComponent()

    // when
    await user.click(screen.getByRole('button', { name: 'Sachgebiete hinzufügen' }))
    await user.click(screen.getByRole('radio', { name: 'Sachgebietsuche auswählen' }))
    await user.type(screen.getByLabelText('Sachgebietskürzel'), 'PR-05')
    await user.click(screen.getByRole('button', { name: 'Sachgebietssuche ausführen' }))
    await waitFor(() => {
      expect(screen.getByText('Beendigung der Phantasieverhältnisse')).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: 'Suche zurücksetzen' }))

    // then
    expect(screen.queryByText('Beendigung der Phantasieverhältnisse')).not.toBeInTheDocument()
  })

  it('Adds a field of law to the selection', async () => {
    vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(searchResultsFixture), { status: 200 }),
    )

    // given
    const { user } = renderComponent()

    // when
    await user.click(screen.getByRole('button', { name: 'Sachgebiete hinzufügen' }))
    await user.click(screen.getByRole('radio', { name: 'Sachgebietsuche auswählen' }))
    await user.type(screen.getByLabelText('Sachgebietskürzel'), 'PR-05')
    await user.click(screen.getByRole('button', { name: 'Sachgebietssuche ausführen' }))
    await waitFor(() => {
      expect(screen.getByText('Beendigung der Phantasieverhältnisse')).toBeInTheDocument()
    })
    await user.click(screen.getByLabelText('PR-05 hinzufügen'))

    // then
    expect(
      screen.getByRole('button', {
        name: 'PR-05 Beendigung der Phantasieverhältnisse aus Liste entfernen',
      }),
    ).toBeInTheDocument()
  })

  it('Cannot add a field of law to the selection twice', async () => {
    vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(searchResultsFixture), { status: 200 }),
    )

    // given
    const { user } = renderComponent()

    // when
    await user.click(screen.getByRole('button', { name: 'Sachgebiete hinzufügen' }))
    await user.click(screen.getByRole('radio', { name: 'Sachgebietsuche auswählen' }))
    await user.type(screen.getByLabelText('Sachgebietskürzel'), 'PR-05')
    await user.click(screen.getByRole('button', { name: 'Sachgebietssuche ausführen' }))
    await waitFor(() => {
      expect(screen.getByText('Beendigung der Phantasieverhältnisse')).toBeInTheDocument()
    })
    await user.click(screen.getByLabelText('PR-05 hinzufügen'))
    await user.click(screen.getByLabelText('PR-05 hinzufügen'))

    // then
    expect(
      screen.getAllByRole('button', {
        name: 'PR-05 Beendigung der Phantasieverhältnisse aus Liste entfernen',
      }).length,
    ).toBe(1)
  })

  it('Remove a selected field of law', async () => {
    vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(searchResultsFixture), { status: 200 }),
    )

    // given
    const { user } = renderComponent()

    // when
    await user.click(screen.getByRole('button', { name: 'Sachgebiete hinzufügen' }))
    await user.click(screen.getByRole('radio', { name: 'Sachgebietsuche auswählen' }))
    await user.type(screen.getByLabelText('Sachgebietskürzel'), 'PR-05')
    await user.click(screen.getByRole('button', { name: 'Sachgebietssuche ausführen' }))
    await waitFor(() => {
      expect(screen.getByText('Beendigung der Phantasieverhältnisse')).toBeInTheDocument()
    })
    await user.click(screen.getByLabelText('PR-05 hinzufügen'))
    await user.click(
      screen.getByRole('button', {
        name: 'PR-05 Beendigung der Phantasieverhältnisse aus Liste entfernen',
      }),
    )

    // then
    expect(
      screen.queryByRole('button', {
        name: 'PR-05 Beendigung der Phantasieverhältnisse aus Liste entfernen',
      }),
    ).not.toBeInTheDocument()
  })
})
