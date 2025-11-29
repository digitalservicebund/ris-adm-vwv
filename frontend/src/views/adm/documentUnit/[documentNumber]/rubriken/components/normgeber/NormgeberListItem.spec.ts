import { userEvent } from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { InstitutionType, type Normgeber } from '@/domain/normgeber'
import NormgeberListItem from './NormgeberListItem.vue'
import { createTestingPinia } from '@pinia/testing'

const mockNormgeber: Normgeber = {
  id: 'normgeberId',
  institution: { id: 'institutionId', name: 'new institution', type: InstitutionType.Institution },
  regions: [{ id: 'regionId', code: 'DEU' }],
}

function renderComponent() {
  const user = userEvent.setup()

  return {
    user,
    ...render(NormgeberListItem, {
      props: { normgeber: mockNormgeber },
      global: {
        plugins: [
          [
            createTestingPinia({
              initialState: {
                admDocumentUnit: {
                  documentUnit: {
                    id: '123',
                    documentNumber: '1234567891234',
                    normgeberList: [],
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

describe('NormgeberListItem', () => {
  it('renders label', async () => {
    renderComponent()
    expect(screen.getByText('DEU, new institution')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Normgeber Editieren' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Normgeber *')).not.toBeInTheDocument()
  })

  it('toggles the edit mode when clicking on expand', async () => {
    const { user } = renderComponent()

    // when
    await user.click(screen.getByRole('button', { name: 'Normgeber Editieren' }))

    // then
    expect(screen.queryByRole('button', { name: 'Normgeber hinzufügen' })).not.toBeInTheDocument()
  })

  it('emits an update when clicking on save', async () => {
    const { user, emitted } = renderComponent()

    // when
    await user.click(screen.getByRole('button', { name: 'Normgeber Editieren' }))
    await user.click(screen.getByRole('button', { name: 'Normgeber übernehmen' }))

    // then
    expect(emitted('updateNormgeber')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Normgeber Editieren' })).toBeInTheDocument()
  })

  it('leaves edit mode on cancel', async () => {
    const { user } = renderComponent()

    // when
    await user.click(screen.getByRole('button', { name: 'Normgeber Editieren' }))
    await user.click(screen.getByRole('button', { name: 'Abbrechen' }))

    // then
    expect(screen.getByRole('button', { name: 'Normgeber Editieren' })).toBeInTheDocument()
    expect(screen.getByText('DEU, new institution')).toBeInTheDocument()
  })

  it('emits an delete event when clicking on delete', async () => {
    const { user, emitted } = renderComponent()

    // when
    await user.click(screen.getByRole('button', { name: 'Normgeber Editieren' }))
    await user.click(screen.getByRole('button', { name: 'Eintrag löschen' }))

    // then
    expect(emitted('deleteNormgeber')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Normgeber Editieren' })).toBeInTheDocument()
  })
})
