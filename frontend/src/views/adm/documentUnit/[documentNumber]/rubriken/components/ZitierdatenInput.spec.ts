import { userEvent } from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { createTestingPinia } from '@pinia/testing'
import Zitierdaten from './ZitierdatenInput.vue'
import { useAdmDocUnitStore } from '@/stores/admDocumentUnitStore'
import { InputText } from 'primevue'
import dayjs from 'dayjs'

function renderComponent() {
  const user = userEvent.setup()

  return {
    user,
    ...render(Zitierdaten, {
      global: {
        plugins: [
          [
            createTestingPinia({
              initialState: {
                admDocumentUnit: {
                  documentUnit: {
                    id: '123',
                    documentNumber: '1234567891234',
                    zitierdaten: [],
                  },
                },
              },
            }),
          ],
        ],
        stubs: {
          InputMask: InputText,
        },
      },
    }),
  }
}

describe('Zitierdatum', () => {
  it('renders correctly', async () => {
    renderComponent()
    expect(screen.getByText('Zitierdatum *')).toBeInTheDocument()
  })

  it('adds a new zitierdatum', async () => {
    const { user } = renderComponent()
    const docUnitStore = useAdmDocUnitStore()

    const input = screen.getByLabelText('Eintrag hinzufügen')
    await user.type(input, '01.01.1970{enter}')

    expect(docUnitStore.documentUnit!.zitierdaten).toEqual(['1970-01-01'])
  })

  it('shows an error on invalid date', async () => {
    const { user } = renderComponent()
    const docUnitStore = useAdmDocUnitStore()

    const input = screen.getByLabelText('Eintrag hinzufügen')
    await user.type(input, '00.00.1970{enter}')

    expect(screen.getByText('Kein valides Datum: 00.00.1970')).toBeVisible()
    expect(docUnitStore.documentUnit!.zitierdaten).toEqual([])
  })

  it('shows an error on invalid date', async () => {
    const docUnitStore = useAdmDocUnitStore()
    const { user } = renderComponent()

    const futureDate = dayjs().add(1, 'day').format('DD.MM.YYYY')
    const input = screen.getByLabelText('Eintrag hinzufügen')
    await user.type(input, `${futureDate}{enter}`)

    expect(
      screen.getByText(`Das Datum darf nicht in der Zukunft liegen: ${futureDate}`),
    ).toBeVisible()
    expect(docUnitStore.documentUnit!.zitierdaten).toEqual([])
  })

  it('should show an empty list if fetched dates are invalid', async () => {
    render(Zitierdaten, {
      global: {
        plugins: [
          [
            createTestingPinia({
              initialState: {
                admDocumentUnit: {
                  documentUnit: {
                    id: '123',
                    documentNumber: '1234567891234',
                    zitierdaten: ['9999-99-99'],
                  },
                },
              },
            }),
          ],
        ],
        stubs: {
          InputMask: InputText,
        },
      },
    })

    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
  })
})
