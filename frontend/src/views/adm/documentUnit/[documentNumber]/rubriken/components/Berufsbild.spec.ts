import { createTestingPinia } from '@pinia/testing'
import { userEvent } from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, test } from 'vitest'
import type { AdmDocumentationUnit } from '@/domain/adm/admDocumentUnit'
import Berufsbild from './Berufsbild.vue'

function renderComponent(berufsbilder?: string[]) {
  const user = userEvent.setup()

  return {
    user,
    ...render(Berufsbild, {
      global: {
        plugins: [
          [
            createTestingPinia({
              initialState: {
                admDocumentUnit: {
                  documentUnit: <AdmDocumentationUnit>{
                    documentNumber: '1234567891234',
                    berufsbilder: berufsbilder ?? [],
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

describe('Berufsbild', () => {
  test('if no berufsbilder render add berufsbild button', async () => {
    render(Berufsbild, {
      global: {
        plugins: [
          [
            createTestingPinia({
              initialState: {
                admDocumentUnit: {
                  documentUnit: <AdmDocumentationUnit>{
                    documentNumber: '1234567891234',
                  },
                },
              },
            }),
          ],
        ],
      },
    })

    expect(screen.getByRole('button', { name: 'Berufsbild hinzufügen' })).toBeInTheDocument()
  })

  test('clicking on the add button shows the chips input', async () => {
    const { user } = renderComponent()

    await user.click(screen.getByRole('button', { name: 'Berufsbild hinzufügen' }))
    expect(screen.getByRole('group', { name: 'Berufsbild' })).toBeInTheDocument()
  })

  test('if there are berufsbilder, render chips input', async () => {
    renderComponent(['Handwerker'])

    expect(screen.queryByRole('button', { name: 'Berufsbild hinzufügen' })).not.toBeInTheDocument()
    expect(screen.getByRole('listitem', { name: 'Handwerker' })).toBeInTheDocument()
  })

  test('removes an existing berufsbild', async () => {
    const { user } = renderComponent(['Handwerker'])

    await user.click(screen.getByRole('button', { name: 'Eintrag löschen' }))

    expect(screen.queryByRole('listitem', { name: 'Handwerker' })).not.toBeInTheDocument()
  })
})
