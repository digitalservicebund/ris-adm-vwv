import { userEvent } from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, test } from 'vitest'
import TitelSection from './TitelSection.vue'

function renderComponent(props?: {
  hauptsachtitel?: string
  hauptsachtitelZusatz?: string
  dokumentarischerTitel?: string
}) {
  const user = userEvent.setup()

  return {
    user,
    ...render(TitelSection, {
      props: {
        hauptsachtitel: props?.hauptsachtitel ?? '',
        hauptsachtitelZusatz: props?.hauptsachtitelZusatz ?? '',
        dokumentarischerTitel: props?.dokumentarischerTitel ?? '',
      },
    }),
  }
}

describe('TitelSection', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  global.ResizeObserver = require('resize-observer-polyfill')

  test('renders all three textareas', async () => {
    renderComponent()

    expect(screen.getByLabelText('Hauptsachtitel')).toBeInTheDocument()
    expect(screen.getByLabelText('Zusatz zum Hauptsachtitel')).toBeInTheDocument()
    expect(screen.getByLabelText('Dokumentarischer Titel')).toBeInTheDocument()
  })

  test('disables hauptsachtitel and zusatz when dokumentarischerTitel is filled', async () => {
    renderComponent({ dokumentarischerTitel: 'Die Rückkehr der Akten' })

    const hauptsachtitel = screen.getByLabelText('Hauptsachtitel')
    const zusatz = screen.getByLabelText('Zusatz zum Hauptsachtitel')

    expect(hauptsachtitel).toBeDisabled()
    expect(zusatz).toBeDisabled()
  })

  test('disables dokumentarischerTitel when hauptsachtitel is filled', async () => {
    renderComponent({ hauptsachtitel: 'Die unendliche Verhandlung' })

    const dokumentarischerTitel = screen.getByLabelText('Dokumentarischer Titel')
    expect(dokumentarischerTitel).toBeDisabled()
  })

  test('disables dokumentarischerTitel when hauptsachtitelZusatz is filled', async () => {
    renderComponent({ hauptsachtitelZusatz: 'Zusatz' })

    const dokumentarischerTitel = screen.getByLabelText('Dokumentarischer Titel')
    expect(dokumentarischerTitel).toBeDisabled()
  })

  test('enables all fields when nothing is filled', async () => {
    renderComponent()

    expect(screen.getByLabelText('Hauptsachtitel')).toBeEnabled()
    expect(screen.getByLabelText('Zusatz zum Hauptsachtitel')).toBeEnabled()
    expect(screen.getByLabelText('Dokumentarischer Titel')).toBeEnabled()
  })

  test('typing into each field emits the correct update events', async () => {
    const user = userEvent.setup()

    const { emitted } = renderComponent()

    const haupt = screen.getByLabelText('Hauptsachtitel')
    const zusatz = screen.getByLabelText('Zusatz zum Hauptsachtitel')
    const doku = screen.getByLabelText('Dokumentarischer Titel')

    await user.type(haupt, 'H')
    expect((emitted()['update:hauptsachtitel'] as [string[]])?.[0][0]).toBe('H')

    await user.type(zusatz, 'Z')
    expect((emitted()['update:hauptsachtitelZusatz'] as [string[]])?.[0][0]).toBe('Z')

    await user.clear(haupt)
    await user.clear(zusatz)
    await user.type(doku, 'D')
    expect((emitted()['update:dokumentarischerTitel'] as [string[]])?.[0][0]).toBe('D')
  })
})
