import { userEvent } from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import FundstelleListItem from './FundstelleListItem.vue'
import { createTestingPinia } from '@pinia/testing'
import {
  ambiguousFundstelleFixture,
  fundstelleFixture,
} from '@/testing/fixtures/fundstelle.fixture'
import type { Fundstelle } from '@/domain/fundstelle'

function renderComponent(fundstelle: Fundstelle) {
  const user = userEvent.setup()

  return {
    user,
    ...render(FundstelleListItem, {
      props: { fundstelle },
      global: {
        plugins: [
          [
            createTestingPinia({
              initialState: {
                admDocumentUnit: {
                  documentUnit: {
                    id: '123',
                    documentNumber: '1234567891234',
                    fundstelleList: [],
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

describe('FundstelleListItem', () => {
  it('renders label', async () => {
    renderComponent(fundstelleFixture)
    expect(screen.getByText('BAnz 1973, 608')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Fundstelle Editieren' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Fundstelle *')).not.toBeInTheDocument()
  })

  it('renders label for ambiguous fundstelle', async () => {
    renderComponent(ambiguousFundstelleFixture)
    expect(screen.getByText('BAnz 1973, 608')).toBeInTheDocument()
  })

  it('toggles the edit mode when clicking on expand', async () => {
    const { user } = renderComponent(fundstelleFixture)

    // when
    await user.click(screen.getByRole('button', { name: 'Fundstelle Editieren' }))

    // then
    expect(screen.queryByRole('button', { name: 'Fundstelle hinzufügen' })).not.toBeInTheDocument()
  })

  it('emits an update when clicking on save', async () => {
    const { user, emitted } = renderComponent(fundstelleFixture)

    // when
    await user.click(screen.getByRole('button', { name: 'Fundstelle Editieren' }))
    await user.click(screen.getByRole('button', { name: 'Fundstelle übernehmen' }))

    // then
    expect(emitted('updateFundstelle')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Fundstelle Editieren' })).toBeInTheDocument()
  })

  it('leaves edit mode on cancel', async () => {
    const { user } = renderComponent(fundstelleFixture)

    // when
    await user.click(screen.getByRole('button', { name: 'Fundstelle Editieren' }))
    await user.click(screen.getByRole('button', { name: 'Abbrechen' }))

    // then
    expect(screen.getByRole('button', { name: 'Fundstelle Editieren' })).toBeInTheDocument()
    expect(screen.getByText('BAnz 1973, 608')).toBeInTheDocument()
  })

  it('emits an delete event when clicking on delete', async () => {
    const { user, emitted } = renderComponent(fundstelleFixture)

    // when
    await user.click(screen.getByRole('button', { name: 'Fundstelle Editieren' }))
    await user.click(screen.getByRole('button', { name: 'Eintrag löschen' }))

    // then
    expect(emitted('deleteFundstelle')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Fundstelle Editieren' })).toBeInTheDocument()
  })
})
