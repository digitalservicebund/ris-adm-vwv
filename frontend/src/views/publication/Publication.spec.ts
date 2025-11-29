import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import Publication from './Publication.vue'

describe('Publication', () => {
  it('renders info message', () => {
    render(Publication, {
      props: {
        isLoading: false,
        isPublished: false,
        isDisabled: false,
        error: null,
      },
    })

    expect(screen.getByText('Hinweise zur Veröffentlichung')).toBeInTheDocument()
  })

  it('shows success message when published', () => {
    render(Publication, {
      props: {
        isLoading: false,
        isPublished: true,
        isDisabled: false,
        error: null,
      },
    })

    expect(screen.getByText('Freigabe ist abgeschlossen.')).toBeVisible()
  })

  it('shows error message when error exists', () => {
    render(Publication, {
      props: {
        isLoading: false,
        isPublished: true,
        isDisabled: false,
        error: new Error('some error'),
      },
    })

    expect(
      screen.getByText('Die Freigabe ist aus technischen Gründen nicht durchgeführt worden.'),
    ).toBeVisible()
  })

  it('disables button when isDisabled is true', () => {
    render(Publication, {
      props: {
        isLoading: false,
        isPublished: false,
        isDisabled: true,
        error: null,
      },
    })

    expect(screen.getByRole('button', { name: 'Zur Veröffentlichung freigeben' })).toBeDisabled()
  })

  it('emits publish event on click', async () => {
    const user = userEvent.setup()
    const { emitted } = render(Publication, {
      props: {
        isLoading: false,
        isPublished: false,
        isDisabled: false,
        error: null,
      },
    })

    await user.click(screen.getByRole('button', { name: 'Zur Veröffentlichung freigeben' }))

    expect(emitted()).toHaveProperty('publish')
    expect(emitted().publish).toHaveLength(1)
  })
})
