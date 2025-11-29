import { describe, expect, it } from 'vitest'
import { userEvent } from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import FieldOfLawSearchResults from './FieldOfLawSearchResults.vue'

function renderComponent() {
  const results = [
    {
      identifier: 'PR',
      text: 'Phantasierecht',
      linkedFields: undefined,
      norms: [],
      children: [],
      parent: undefined,
      hasChildren: false,
    },
    {
      identifier: 'PR-01',
      text: 'Arbeitsvertrag',
      linkedFields: undefined,
      norms: [],
      children: [],
      parent: undefined,
      hasChildren: false,
    },
    {
      identifier: 'BR-01',
      text: 'Person, Sache, siehe auch BR-02',
      linkedFields: ['BR-02'],
      norms: [],
      children: [],
      parent: undefined,
      hasChildren: false,
    },
  ]
  const currentPage = {
    content: results,
    size: 1,
    number: 0,
    numberOfElements: results.length,
    first: true,
    last: false,
    empty: false,
  }
  const props = {
    currentPage,
    results,
  }

  const user = userEvent.setup()

  return { user, ...render(FieldOfLawSearchResults, { props }) }
}

describe('FieldOfLawSearchResults', () => {
  it('render search results', () => {
    renderComponent()

    expect(screen.getByText('PR')).toBeInTheDocument()
    expect(screen.getByText('Phantasierecht')).toBeInTheDocument()
    expect(screen.getByText('PR-01')).toBeInTheDocument()
    expect(screen.getByText('Arbeitsvertrag')).toBeInTheDocument()
    expect(screen.getByText('3 Ergebnisse angezeigt')).toBeInTheDocument()
  })

  it("on identifier click emit 'node:add'", async () => {
    const { emitted, user } = renderComponent()

    await user.click(screen.getByLabelText('PR-01 hinzufügen'))

    expect(emitted()['node:add']).toBeTruthy()
  })

  it("on linked field click emit 'linkedField:clicked'", async () => {
    const { emitted, user } = renderComponent()

    await user.click(screen.getByText('BR-02'))

    expect(emitted()['linkedField:clicked']).toBeTruthy()
  })

  it("page change emit 'search'", async () => {
    const { emitted, user } = renderComponent()

    await user.click(screen.getByText('Weiter'))

    expect(emitted()['search']).toBeTruthy()
  })
})
