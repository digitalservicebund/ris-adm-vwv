import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import LazyFieldToggle from './LazyFieldToggle.vue'

describe('LazyFieldToggle', () => {
  it('shows button and hides slot by default', () => {
    render(LazyFieldToggle, {
      props: { buttonLabel: 'Dokumentarischer Titel' },
      slots: { default: '<div>inner content</div>' },
    })

    expect(screen.getByRole('button', { name: 'Dokumentarischer Titel' })).toBeVisible()
    expect(screen.queryByText('inner content')).not.toBeInTheDocument()
  })

  it('reveals slot after button click and emits update', async () => {
    const onUpdateVisible = vi.fn()
    const user = userEvent.setup()

    render(LazyFieldToggle, {
      props: {
        buttonLabel: 'Dokumentarischer Titel',
        'onUpdate:visible': onUpdateVisible,
      },
      slots: { default: '<div>inner content</div>' },
    })

    await user.click(screen.getByRole('button', { name: 'Dokumentarischer Titel' }))

    expect(onUpdateVisible).toHaveBeenCalledWith(true)
    expect(screen.getByText('inner content')).toBeVisible()
  })

  it('renders slot immediately when visible is true', () => {
    render(LazyFieldToggle, {
      props: {
        buttonLabel: 'Dokumentarischer Titel',
        visible: true,
      },
      slots: { default: '<div>inner content</div>' },
    })

    expect(screen.queryByRole('button', { name: 'Dokumentarischer Titel' })).not.toBeInTheDocument()
    expect(screen.getByText('inner content')).toBeVisible()
  })

  it('disables button when disabled prop is true', () => {
    render(LazyFieldToggle, {
      props: {
        buttonLabel: 'Dokumentarischer Titel',
        disabled: true,
      },
      slots: { default: '<div>inner content</div>' },
    })

    const button = screen.getByRole('button', { name: 'Dokumentarischer Titel' })
    expect(button).toBeDisabled()
  })
})
