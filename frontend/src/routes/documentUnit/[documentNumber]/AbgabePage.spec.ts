import { createTestingPinia } from '@pinia/testing'
import { userEvent } from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, test } from 'vitest'
import type { DocumentUnit } from '@/domain/documentUnit'
import AbgabePage from './AbgabePage.vue'
import { InstitutionType } from '@/domain/normgeber'

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
    expect(screen.getByRole('button', { name: 'Zur Veröffentlichung freigeben' })).toBeDisabled()
  })

  test('allows publication for a valid document', async () => {
    renderComponent({
      id: 'docId1',
      documentNumber: 'KSNR999999999',
      note: '',
      langueberschrift: 'my langueberschrift',
      inkrafttretedatum: '2025-01-01',
      zitierdaten: ['2025-01-01'],
      dokumenttyp: {
        abbreviation: 'testAbbr',
        name: 'testDokTyp',
      },
      normgeberList: [
        {
          id: 'testNormgeberId',
          institution: {
            id: 'testInstId',
            name: '',
            type: InstitutionType.LegalEntity,
          },
          regions: [],
        },
      ],
    })

    expect(screen.getByRole('button', { name: 'Zur Veröffentlichung freigeben' })).toBeEnabled()
  })
})
