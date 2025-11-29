import { render, screen } from '@testing-library/vue'
import { describe, expect, test } from 'vitest'
import { userEvent } from '@testing-library/user-event'
import TextEditorCategory from './TextEditorCategory.vue'

describe('TextEditorCategory', async () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  global.ResizeObserver = require('resize-observer-polyfill')

  const renderComponent = (shouldShowButton: boolean) =>
    render(TextEditorCategory, {
      props: {
        id: 'gliederung',
        label: 'Gliederung',
        shouldShowButton: shouldShowButton,
      },
    })

  test('renders text editor without show button', async () => {
    expect(true).toBeTruthy()
  })

  test('renders text editor without show button', async () => {
    renderComponent(false)
    // await flushPromises()

    // 'Erweitern' is the first button of the editor´s menu bar
    expect(screen.getByRole('button', { name: 'Erweitern' })).toBeInTheDocument()
  })

  test('renders text editor hidden with show button', async () => {
    renderComponent(true)
    // await flushPromises()

    expect(screen.getByRole('button', { name: 'Gliederung' })).toBeInTheDocument()
  })

  test('shows text editor on show button click', async () => {
    renderComponent(true)
    // await flushPromises()

    await userEvent.click(screen.getByRole('button', { name: 'Gliederung' }))

    expect(screen.getByRole('button', { name: 'Erweitern' })).toBeInTheDocument()
  })
})
