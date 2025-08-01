import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/vue'
import SanityCheck from '@/components/publication/SanityCheck.vue'

describe('SanityCheck', () => {
  it('renders properly', () => {
    render(SanityCheck)

    expect(screen.getByText('Plausibilitätsprüfung')).toBeInTheDocument()
  })
})
