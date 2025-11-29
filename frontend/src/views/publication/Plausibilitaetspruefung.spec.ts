import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/vue'
import Plausibilitaetspruefung from './Plausibilitaetspruefung.vue'
import router from '@/router'

describe('Plausibilitaetspruefung', () => {
  it('renders positive message when there is no missing fields', () => {
    render(Plausibilitaetspruefung, {
      props: {
        missingFields: [],
      },
      global: {
        plugins: [router],
      },
    })

    expect(screen.getByText('Plausibilitätsprüfung')).toBeInTheDocument()
    expect(screen.getByText('Alle Pflichtfelder sind korrekt ausgefüllt.')).toBeInTheDocument()
  })

  it('renders 5 missing fields and a link to rubriken', () => {
    render(Plausibilitaetspruefung, {
      props: {
        missingFields: [
          'langueberschrift',
          'inkrafttretedatum',
          'dokumenttyp',
          'normgeberList',
          'zitierdaten',
        ],
      },
      global: {
        plugins: [router],
      },
    })

    expect(screen.getByText('Plausibilitätsprüfung')).toBeInTheDocument()
    expect(screen.getByText('Folgende Pflichtfelder sind nicht befüllt:')).toBeInTheDocument()
    expect(screen.getByText('Amtl. Langüberschrift')).toBeInTheDocument()
    expect(screen.getByText('Datum des Inkrafttretens')).toBeInTheDocument()
    expect(screen.getByText('Dokumenttyp')).toBeInTheDocument()
    expect(screen.getByText('Normgeber')).toBeInTheDocument()
    expect(screen.getByText('Zitierdatum')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Rubriken bearbeiten' })).toBeInTheDocument()
  })

  it('renders the field key if not mapped', () => {
    render(Plausibilitaetspruefung, {
      props: {
        missingFields: ['unmappedField'],
      },
      global: {
        plugins: [router],
      },
    })

    expect(screen.getByText('unmappedField')).toBeInTheDocument()
  })

  it('renders anchor links to the missing rubriken', () => {
    render(Plausibilitaetspruefung, {
      props: {
        missingFields: ['langueberschrift', 'inkrafttretedatum'],
      },
      global: {
        plugins: [router],
      },
    })

    expect(screen.getByRole('link', { name: 'Amtl. Langüberschrift' })).toHaveAttribute(
      'href',
      '/rubriken#langueberschrift',
    )
    expect(screen.getByRole('link', { name: 'Datum des Inkrafttretens' })).toHaveAttribute(
      'href',
      '/rubriken#inkrafttretedatum',
    )
  })
})
