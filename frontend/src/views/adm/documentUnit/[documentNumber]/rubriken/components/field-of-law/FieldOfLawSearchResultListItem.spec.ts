import { describe, expect, it } from 'vitest'
import { userEvent } from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import FieldOfLawSearchResultsListItem from './FieldOfLawSearchResultsListItem.vue'

function renderComponent(options?: {
  identifier?: string
  text?: string
  linkedFields?: string[]
}) {
  const fieldOfLaw = {
    identifier: options?.identifier ?? 'PR',
    text: options?.text ?? 'Phantasierecht',
    linkedFields: options?.linkedFields ?? [],
    norms: [],
    children: [],
    parent: undefined,
    hasChildren: false,
  }

  const user = userEvent.setup()

  return {
    user,
    ...render(FieldOfLawSearchResultsListItem, { props: { fieldOfLaw } }),
  }
}

describe('FieldOfLawSearchResults', () => {
  it('render search results', () => {
    renderComponent()

    expect(screen.getByText('PR')).toBeInTheDocument()
    expect(screen.getByText('Phantasierecht')).toBeInTheDocument()
  })

  it("on identifier click emit 'node:add'", async () => {
    const { emitted, user } = renderComponent({ identifier: 'PR-01' })

    await user.click(screen.getByLabelText('PR-01 hinzufügen'))

    expect(emitted()['node:add']).toBeTruthy()
  })

  it("on linked field click emit 'linked-field:clicked'", async () => {
    const { emitted, user } = renderComponent({
      identifier: 'BR-01',
      text: 'mit Link zu BR-02',
      linkedFields: ['BR-02'],
    })

    await user.click(screen.getByText('BR-02'))

    expect(emitted()['linked-field:clicked']).toBeTruthy()
  })
})
