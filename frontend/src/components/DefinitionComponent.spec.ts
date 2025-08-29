import { createTestingPinia } from '@pinia/testing'
import { userEvent } from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, test } from 'vitest'
import type { DocumentUnit } from '@/domain/documentUnit'
import type { Definition } from '@/domain/definition'
import DefinitionComponent from './DefinitionComponent.vue'

function renderComponent(definitions?: Definition[]) {
  const user = userEvent.setup()

  return {
    user,
    ...render(DefinitionComponent, {
      global: {
        plugins: [
          [
            createTestingPinia({
              initialState: {
                docunitStore: {
                  documentUnit: <DocumentUnit>{
                    documentNumber: '1234567891234',
                    definitions: definitions ?? [],
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

describe('Definition', () => {
  test('if no definitions render add definition button', async () => {
    render(DefinitionComponent, {
      global: {
        plugins: [
          [
            createTestingPinia({
              initialState: {
                docunitStore: {
                  documentUnit: <DocumentUnit>{
                    documentNumber: '1234567891234',
                  },
                },
              },
            }),
          ],
        ],
      },
    })

    expect(screen.getByRole('button', { name: 'Definition hinzufügen' })).toBeInTheDocument()
  })

  test('clicking on the add button shows the chips input', async () => {
    const { user } = renderComponent()

    await user.click(screen.getByRole('button', { name: 'Definition hinzufügen' }))
    expect(screen.getByRole('group', { name: 'Definition' })).toBeInTheDocument()
  })

  test('if there are definitions, render chips input', async () => {
    renderComponent([{ begriff: 'Sachgesamtheit' }])

    expect(screen.queryByRole('button', { name: 'Definition hinzufügen' })).not.toBeInTheDocument()
    expect(screen.getByRole('listitem', { name: 'Sachgesamtheit' })).toBeInTheDocument()
  })

  test('removes an existing definition', async () => {
    const { user } = renderComponent([{ begriff: 'Sachgesamtheit' }])

    await user.click(screen.getByRole('button', { name: 'Eintrag löschen' }))

    expect(screen.queryByRole('listitem', { name: 'Sachgesamtheit' })).not.toBeInTheDocument()
  })
})
