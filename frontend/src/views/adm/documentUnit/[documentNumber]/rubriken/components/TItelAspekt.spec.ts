import { createTestingPinia } from '@pinia/testing'
import { userEvent } from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, test } from 'vitest'
import type { AdmDocumentationUnit } from '@/domain/adm/admDocumentUnit'
import TitelAspekt from './TitelAspekt.vue'

function renderComponent(titelAspekt?: string[]) {
  const user = userEvent.setup()

  return {
    user,
    ...render(TitelAspekt, {
      global: {
        plugins: [
          [
            createTestingPinia({
              initialState: {
                admDocumentUnit: {
                  documentUnit: <AdmDocumentationUnit>{
                    documentNumber: '1234567891234',
                    titelAspekte: titelAspekt ?? [],
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

describe('TitelAspekt', () => {
  test('if no titelAspekt render add titelaspekt button', async () => {
    render(TitelAspekt, {
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

    expect(screen.getByRole('button', { name: 'Titelaspekt hinzufügen' })).toBeInTheDocument()
  })

  test('clicking on the add button shows the chips input', async () => {
    const { user } = renderComponent()

    await user.click(screen.getByRole('button', { name: 'Titelaspekt hinzufügen' }))
    expect(screen.getByRole('group', { name: 'Titelaspekt' })).toBeInTheDocument()
  })

  test('if there are titelAspekt, render chips input', async () => {
    renderComponent(['Gemeinsamer Bundesausschuss'])

    expect(screen.queryByRole('button', { name: 'Titelaspekt hinzufügen' })).not.toBeInTheDocument()
    expect(
      screen.getByRole('listitem', { name: 'Gemeinsamer Bundesausschuss' }),
    ).toBeInTheDocument()
  })

  test('removes an existing titelaspekt', async () => {
    const { user } = renderComponent(['Gemeinsamer Bundesausschuss'])

    await user.click(screen.getByRole('button', { name: 'Eintrag löschen' }))

    expect(
      screen.queryByRole('listitem', { name: 'Gemeinsamer Bundesausschuss' }),
    ).not.toBeInTheDocument()
  })
})
