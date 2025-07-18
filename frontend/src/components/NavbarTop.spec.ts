import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/vue'
import NavbarTop from '@/components/NavbarTop.vue'

describe('NavbarTop', () => {
  it('renders properly', async () => {
    render(NavbarTop)

    expect(screen.getByText('Rechtsinformationen')).toBeInTheDocument()
    expect(screen.getByText('test test')).toBeInTheDocument()
  })
})
