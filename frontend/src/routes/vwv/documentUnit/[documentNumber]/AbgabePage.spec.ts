import { createTestingPinia } from '@pinia/testing'
import { userEvent } from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, test, vi } from 'vitest'
import type { DocumentUnit } from '@/domain/documentUnit'
import AbgabePage from './AbgabePage.vue'
import { normgeberFixture } from '@/testing/fixtures/normgeber'
import { docTypeFixture } from '@/testing/fixtures/documentType'

function renderComponent(documentUnit: DocumentUnit) {
  const user = userEvent.setup()

  return {
    user,
    ...render(AbgabePage, {
      global: {
        plugins: [
          [
            createTestingPinia({
              initialState: {
                docunitStore: {
                  documentUnit,
                },
              },
            }),
          ],
        ],
        stubs: {
          routerLink: {
            template: '<a><slot/></a>',
          },
        },
      },
    }),
  }
}

describe('AbgabePage', () => {
  test('renders', async () => {
    renderComponent({
      id: 'docId1',
      documentNumber: 'KSNR999999999',
      note: '',
    })

    expect(screen.getByText('Abgabe')).toBeInTheDocument()
    expect(screen.getByText('Hinweise zur Veröffentlichung')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Zur Veröffentlichung freigeben' })).toBeDisabled()
  })

  test('sucessfully publishes valid document', async () => {
    const publishedResp = {
      id: '8de5e4a0-6b67-4d65-98db-efe877a260c4',
      documentNumber: 'KSNR054920707',
      json: {
        id: '8de5e4a0-6b67-4d65-98db-efe877a260c4',
        documentNumber: 'KSNR054920707',
      },
    }

    vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(publishedResp), { status: 200 }),
    )

    const { user } = renderComponent({
      id: 'docId1',
      documentNumber: 'KSNR999999999',
      note: '',
      langueberschrift: 'my langueberschrift',
      inkrafttretedatum: '2025-01-01',
      zitierdaten: ['2025-01-01'],
      dokumenttyp: docTypeFixture,
      normgeberList: [normgeberFixture],
    })

    expect(screen.getByRole('button', { name: 'Zur Veröffentlichung freigeben' })).toBeEnabled()

    // when
    await user.click(screen.getByRole('button', { name: 'Zur Veröffentlichung freigeben' }))

    // then
    expect(screen.getByText('Freigabe ist abgeschlossen.')).toBeVisible()
  })

  test('shows an error message on failed publication', async () => {
    vi.spyOn(window, 'fetch').mockRejectedValue(new Error('fetch failed'))

    const { user } = renderComponent({
      id: 'docId1',
      documentNumber: 'KSNR999999999',
      note: '',
      langueberschrift: 'my langueberschrift',
      inkrafttretedatum: '2025-01-01',
      zitierdaten: ['2025-01-01'],
      dokumenttyp: docTypeFixture,
      normgeberList: [normgeberFixture],
    })

    // when
    await user.click(screen.getByRole('button', { name: 'Zur Veröffentlichung freigeben' }))

    // then
    expect(screen.queryByText('Freigabe ist abgeschlossen.')).not.toBeInTheDocument()
    expect(
      screen.getByText('Die Freigabe ist aus technischen Gründen nicht durchgeführt worden.'),
    ).toBeVisible()
  })
})
