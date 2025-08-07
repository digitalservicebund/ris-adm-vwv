import { userEvent } from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import NormgeberList from './FundstellenList.vue'
import { createTestingPinia } from '@pinia/testing'
import type { DocumentUnit } from '@/domain/documentUnit'
import type { Fundstelle } from '@/domain/fundstelle'
import { fundstelleFixture } from '@/testing/fixtures/fundstelle'

function renderComponent(fundstellenList?: Fundstelle[]) {
  const user = userEvent.setup()

  return {
    user,
    ...render(NormgeberList, {
      global: {
        plugins: [
          [
            createTestingPinia({
              initialState: {
                docunitStore: {
                  documentUnit: <DocumentUnit>{
                    documentNumber: '1234567891234',
                    fundstellen: fundstellenList ?? [],
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

describe('NormgeberList', () => {
  it('renders creation panel when there is no fundstellen', async () => {
    renderComponent()
    expect(screen.getByRole('heading', { level: 2, name: 'Fundstellen' })).toBeInTheDocument()
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
    expect(screen.getByText('Periodikum *')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Fundstelle hinzufügen' })).not.toBeInTheDocument()
  })

  it('renders a list of existing fundstellen', async () => {
    const { user } = renderComponent([fundstelleFixture])
    expect(screen.queryAllByRole('listitem')).toHaveLength(1)
    expect(screen.getByText('BAnz 1973, 608')).toBeInTheDocument()
    expect(screen.getByLabelText('Fundstelle Editieren')).toBeInTheDocument()

    // when
    await user.click(screen.getByRole('button', { name: 'Fundstelle Editieren' }))
    await user.click(screen.getByRole('button', { name: 'Abbrechen' }))
    // then
    expect(screen.getByRole('button', { name: 'Fundstelle hinzufügen' })).toBeInTheDocument()
  })

  it('opens the creation panel on clicking add', async () => {
    const { user } = renderComponent([fundstelleFixture])

    // when
    await user.click(screen.getByRole('button', { name: 'Fundstelle hinzufügen' }))

    // then
    expect(screen.getByText('Periodikum *')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Fundstelle hinzufügen' })).not.toBeInTheDocument()
  })
})
