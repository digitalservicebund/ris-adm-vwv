import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/vue'
import DocumentUnitInfoPanel from '@/components/DocumentUnitInfoPanel.vue'
import { useDocumentUnitStore } from '@/stores/documentUnitStore.ts'
import { setActivePinia } from 'pinia'
import { createTestingPinia } from '@pinia/testing'

function mockDocumentUnitStore(callback = vi.fn()) {
  const documentUnitStore = useDocumentUnitStore()
  documentUnitStore.updateDocumentUnit = callback

  return documentUnitStore
}

function renderComponent(options?: { heading?: string /*coreData?: CoreData*/ }) {
  return {
    ...render(DocumentUnitInfoPanel, {
      props: { heading: options?.heading ?? '' },
    }),
  }
}

describe('documentUnit InfoPanel', () => {
  beforeEach(() => {
    setActivePinia(createTestingPinia())
  })

  it('renders heading if given', async () => {
    renderComponent({ heading: 'Header' })

    expect(await screen.findByText('Header')).toBeVisible()
  })

  it('click on save renders last saved information', async () => {
    // given
    mockDocumentUnitStore(vi.fn().mockResolvedValueOnce({ status: 200 }))
    renderComponent()

    // when
    screen.getByRole('button', { name: 'Speichern' }).click()

    // then
    expect(await screen.findByText('Zuletzt', { exact: false })).toBeInTheDocument()
  })

  it('click on save renders error information', async () => {
    // given
    mockDocumentUnitStore()
    renderComponent()

    // when
    screen.getByRole('button', { name: 'Speichern' }).click()

    // then
    expect(
      await screen.findByText('Fehler beim Speichern: Verbindung fehlgeschlagen'),
    ).toBeInTheDocument()
  })
})
