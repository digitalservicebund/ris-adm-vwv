import { render, screen } from '@testing-library/vue'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import TitelSection from './TitelSection.vue'

function renderComponent(props?: {
  hauptsachtitel?: string
  hauptsachtitelZusatz?: string
  dokumentarischerTitel?: string
}) {
  return render(TitelSection, {
    props: {
      hauptsachtitel: props?.hauptsachtitel ?? '',
      hauptsachtitelZusatz: props?.hauptsachtitelZusatz ?? '',
      dokumentarischerTitel: props?.dokumentarischerTitel ?? '',
    },
  })
}

describe('Sli TitelSection', () => {
  it('shows Hauptsachtitel and Zusatz, hides documentary title by default', () => {
    renderComponent()
    expect(screen.getByRole('textbox', { name: /^Hauptsachtitel\b/ })).toBeVisible()
    expect(screen.getByRole('textbox', { name: 'Zusatz zum Hauptsachtitel' })).toBeVisible()
    expect(
      screen.queryByRole('textbox', { name: /Dokumentarischer Titel/ }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Dokumentarischer Titel' })).toBeVisible()
  })

  it('reveals documentary title when button is clicked', async () => {
    const user = userEvent.setup()
    renderComponent()
    await user.click(screen.getByRole('button', { name: 'Dokumentarischer Titel' }))
    expect(screen.getByRole('textbox', { name: /Dokumentarischer Titel/ })).toBeVisible()
  })

  it('auto-opens documentary title when value is provided', () => {
    renderComponent({ dokumentarischerTitel: 'Doc title' })
    expect(screen.getByRole('textbox', { name: /Dokumentarischer Titel/ })).toBeVisible()
    expect(screen.getByRole('textbox', { name: /^Hauptsachtitel\b/ })).toBeDisabled()
  })

  it('collapses documentary title on blur when cleared', async () => {
    const user = userEvent.setup()
    renderComponent()
    await user.click(screen.getByRole('button', { name: 'Dokumentarischer Titel' }))
    const docInput = screen.getByRole('textbox', { name: /Dokumentarischer Titel/ })
    await user.type(docInput, 'foo')
    await user.clear(docInput)
    await user.tab() // blur
    expect(
      screen.queryByRole('textbox', { name: /Dokumentarischer Titel/ }),
    ).not.toBeInTheDocument()
  })

  it('disables dokumentarischerTitel when hauptsachtitel has content', async () => {
    const user = userEvent.setup()
    renderComponent()

    const docButton = screen.getByRole('button', { name: 'Dokumentarischer Titel' })
    await user.click(docButton)
    const docInput = screen.getByRole('textbox', { name: /Dokumentarischer Titel/ })

    const hauptInput = screen.getByRole('textbox', { name: /^Hauptsachtitel\b/ })
    await user.type(hauptInput, 'Main Title')

    await expect(docInput).toBeDisabled()
  })

  it('disables dokumentarischerTitel when hauptsachtitelZusatz has content', async () => {
    const user = userEvent.setup()
    renderComponent()

    const docButton = screen.getByRole('button', { name: 'Dokumentarischer Titel' })
    await user.click(docButton)
    const docInput = screen.getByRole('textbox', { name: /Dokumentarischer Titel/ })

    const zusatzInput = screen.getByRole('textbox', { name: 'Zusatz zum Hauptsachtitel' })
    await user.type(zusatzInput, 'Zusatz')

    await expect(docInput).toBeDisabled()
  })

  it('disables dokumentarischerTitel when both hauptsachtitel and zusatz have content', async () => {
    const user = userEvent.setup()
    renderComponent()

    const docButton = screen.getByRole('button', { name: 'Dokumentarischer Titel' })
    await user.click(docButton)

    const hauptInput = screen.getByRole('textbox', { name: /^Hauptsachtitel\b/ })
    await user.type(hauptInput, 'Main Title')

    const zusatzInput = screen.getByRole('textbox', { name: 'Zusatz zum Hauptsachtitel' })
    await user.type(zusatzInput, 'Zusatz')

    const docInput = screen.getByRole('textbox', { name: /Dokumentarischer Titel/ })
    await expect(docInput).toBeDisabled()
  })

  it('disables hauptsachtitel and zusatz when dokumentarischerTitel has content', async () => {
    renderComponent({ dokumentarischerTitel: 'Doc Title' })

    const hauptInput = screen.getByRole('textbox', { name: /^Hauptsachtitel\b/ })
    const zusatzInput = screen.getByRole('textbox', { name: 'Zusatz zum Hauptsachtitel' })

    await expect(hauptInput).toBeDisabled()
    await expect(zusatzInput).toBeDisabled()
  })

  it('opens dokumentarischerTitel field when value is added via watcher', async () => {
    const user = userEvent.setup()
    renderComponent()

    expect(
      screen.queryByRole('textbox', { name: /Dokumentarischer Titel/ }),
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Dokumentarischer Titel' }))
    const docInput = screen.getByRole('textbox', { name: /Dokumentarischer Titel/ })

    await user.type(docInput, 'New Title')

    expect(docInput).toBeVisible()
    expect(docInput).toHaveValue('New Title')
  })

  it('re-enables hauptsachtitel and zusatz when dokumentarischerTitel is cleared', async () => {
    const user = userEvent.setup()
    renderComponent({ dokumentarischerTitel: 'Doc Title' })

    const hauptInput = screen.getByRole('textbox', { name: /^Hauptsachtitel\b/ })
    const zusatzInput = screen.getByRole('textbox', { name: 'Zusatz zum Hauptsachtitel' })
    const docInput = screen.getByRole('textbox', { name: /Dokumentarischer Titel/ })

    expect(hauptInput).toBeDisabled()
    expect(zusatzInput).toBeDisabled()

    await user.clear(docInput)
    await user.tab()

    expect(hauptInput).toBeEnabled()
    expect(zusatzInput).toBeEnabled()
  })

  it('trims whitespace on blur and collapses if empty', async () => {
    const user = userEvent.setup()
    renderComponent()

    await user.click(screen.getByRole('button', { name: 'Dokumentarischer Titel' }))
    const docInput = screen.getByRole('textbox', { name: /Dokumentarischer Titel/ })

    await user.type(docInput, '   ')
    await user.tab()

    expect(
      screen.queryByRole('textbox', { name: /Dokumentarischer Titel/ }),
    ).not.toBeInTheDocument()
  })

  it('re-enables dokumentarischerTitel when both hauptsachtitel and zusatz are cleared', async () => {
    const user = userEvent.setup()
    renderComponent()

    const docButton = screen.getByRole('button', { name: 'Dokumentarischer Titel' })
    await user.click(docButton)
    const docInput = screen.getByRole('textbox', { name: /Dokumentarischer Titel/ })

    const hauptInput = screen.getByRole('textbox', { name: /^Hauptsachtitel\b/ })
    const zusatzInput = screen.getByRole('textbox', { name: 'Zusatz zum Hauptsachtitel' })

    await user.type(hauptInput, 'Main')
    await user.type(zusatzInput, 'Zusatz')

    expect(docInput).toBeDisabled()

    await user.clear(hauptInput)
    await user.clear(zusatzInput)

    expect(docInput).toBeEnabled()
  })

  it('does not disable dokumentarischerTitel when hauptsachtitel has only whitespace', async () => {
    renderComponent({ hauptsachtitel: '   ' })

    const docButton = screen.getByRole('button', { name: 'Dokumentarischer Titel' })
    expect(docButton).toBeEnabled()
  })

  it('does not disable dokumentarischerTitel when hauptsachtitelZusatz has only whitespace', async () => {
    renderComponent({ hauptsachtitelZusatz: '   ' })

    const docButton = screen.getByRole('button', { name: 'Dokumentarischer Titel' })
    expect(docButton).toBeEnabled()
  })

  it('trims whitespace on blur but keeps field open if content remains', async () => {
    const user = userEvent.setup()
    renderComponent()

    await user.click(screen.getByRole('button', { name: 'Dokumentarischer Titel' }))
    const docInput = screen.getByRole('textbox', { name: /Dokumentarischer Titel/ })

    await user.type(docInput, '  Title  ')
    await user.tab()

    expect(docInput).toBeVisible()
    expect(docInput).toHaveValue('Title')
  })

  it('handles null/undefined dokumentarischerTitel value', () => {
    renderComponent({ dokumentarischerTitel: undefined })
    expect(screen.getByRole('button', { name: 'Dokumentarischer Titel' })).toBeVisible()
  })

  it('disables button when hauptsachtitel has content', async () => {
    const user = userEvent.setup()
    renderComponent()

    const button = screen.getByRole('button', { name: 'Dokumentarischer Titel' })
    expect(button).toBeEnabled()

    const hauptInput = screen.getByRole('textbox', { name: /^Hauptsachtitel\b/ })
    await user.type(hauptInput, 'Main Title')

    expect(button).toBeDisabled()
  })

  it('disables button when hauptsachtitelZusatz has content', async () => {
    const user = userEvent.setup()
    renderComponent()

    const button = screen.getByRole('button', { name: 'Dokumentarischer Titel' })
    expect(button).toBeEnabled()

    const zusatzInput = screen.getByRole('textbox', { name: 'Zusatz zum Hauptsachtitel' })
    await user.type(zusatzInput, 'Zusatz')

    expect(button).toBeDisabled()
  })

  it('disables button when both hauptsachtitel and zusatz have content', () => {
    renderComponent({ hauptsachtitel: 'Main', hauptsachtitelZusatz: 'Zusatz' })

    const button = screen.getByRole('button', { name: 'Dokumentarischer Titel' })
    expect(button).toBeDisabled()
  })

  it('re-enables button when both hauptsachtitel and zusatz are cleared', async () => {
    const user = userEvent.setup()
    renderComponent({ hauptsachtitel: 'Main', hauptsachtitelZusatz: 'Zusatz' })

    const button = screen.getByRole('button', { name: 'Dokumentarischer Titel' })
    expect(button).toBeDisabled()

    const hauptInput = screen.getByRole('textbox', { name: /^Hauptsachtitel\b/ })
    const zusatzInput = screen.getByRole('textbox', { name: 'Zusatz zum Hauptsachtitel' })

    await user.clear(hauptInput)
    await user.clear(zusatzInput)

    expect(button).toBeEnabled()
  })

  it('does not disable button when hauptsachtitel has only whitespace', () => {
    renderComponent({ hauptsachtitel: '   ' })

    const button = screen.getByRole('button', { name: 'Dokumentarischer Titel' })
    expect(button).toBeEnabled()
  })

  it('does not disable button when hauptsachtitelZusatz has only whitespace', () => {
    renderComponent({ hauptsachtitelZusatz: '   ' })

    const button = screen.getByRole('button', { name: 'Dokumentarischer Titel' })
    expect(button).toBeEnabled()
  })
})
