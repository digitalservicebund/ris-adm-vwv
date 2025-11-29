import { describe, expect, vi, beforeEach, afterEach, it } from 'vitest'
import { userEvent } from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import SearchResultList, { type SearchResults } from './SearchResultList.vue'
import RelatedDocumentation from '@/domain/relatedDocumentation'

function renderSearchResults(
  searchResults?: SearchResults<RelatedDocumentation>,
  isLoading?: boolean,
) {
  const props: {
    searchResults: SearchResults<RelatedDocumentation>
    isLoading: boolean
  } = {
    searchResults: searchResults ?? [
      {
        decision: new RelatedDocumentation({
          ...{
            court: {
              id: 'courtId',
              type: 'fooType',
              location: 'fooLocation',
            },
            documentNumber: 'fooDocumentNumber',
          },
        }),
        isLinked: false,
      },
    ],
    isLoading: isLoading ?? false,
  }

  const utils = render(SearchResultList, {
    props,

    global: {
      stubs: { routerLink: { template: '<a><slot/></a>' } },
    },
  })

  const user = userEvent.setup()
  return { user, ...utils }
}

describe('Search result list', () => {
  beforeEach(() => {
    vi.spyOn(window, 'scrollTo').mockImplementation(function () {
      vi.fn()
    })
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })
  it('renders correctly', async () => {
    renderSearchResults()

    expect(await screen.findByText(/fooType fooLocation/)).toBeVisible()
    expect(await screen.findByText('fooDocumentNumber')).toBeVisible()

    expect(await screen.findByTestId('add-decision-button')).toBeVisible()
    expect(screen.queryByText(/Bereits hinzugefügt/)).not.toBeInTheDocument()
  })

  it('indicates not yet added previous decisions', async () => {
    renderSearchResults()

    expect(await screen.findByTestId('add-decision-button')).toBeVisible()
    expect(screen.queryByText(/Bereits hinzugefügt/)).not.toBeInTheDocument()
  })

  it('indicates already added previous decisions', async () => {
    renderSearchResults([
      {
        decision: new RelatedDocumentation({
          ...{
            court: {
              id: 'courtId',
              type: 'fooType',
              location: 'fooLocation',
            },
            documentNumber: 'fooDocumentNumber',
          },
        }),
        isLinked: true,
      },
    ])

    expect(await screen.findByTestId('add-decision-button')).toBeVisible()
    expect(await screen.findByText(/Bereits hinzugefügt/)).toBeVisible()
  })

  it("clicking on 'Übernehmen' emits link decision event", async () => {
    const { user, emitted } = renderSearchResults()

    expect(await screen.findByText(/fooType fooLocation/)).toBeVisible()
    expect(await screen.findByText('fooDocumentNumber')).toBeVisible()

    expect(await screen.findByTestId('add-decision-button')).toBeVisible()
    expect(screen.queryByText(/Bereits hinzugefügt/)).not.toBeInTheDocument()

    const button = await screen.findByTestId('add-decision-button')
    await user.click(button)

    expect(emitted().linkDecision).toBeTruthy()
  })

  it('renders search results for active citations', async () => {
    renderSearchResults([
      {
        decision: new RelatedDocumentation({
          ...{
            court: {
              id: 'courtId',
              type: 'fooType',
              location: 'fooLocation',
            },
            documentNumber: 'fooDocumentNumber',
          },
        }),
        isLinked: true,
      },
    ])

    expect(await screen.findByTestId('add-decision-button')).toBeVisible()
    expect(await screen.findByText(/Bereits hinzugefügt/)).toBeVisible()
  })

  it('renders loading spinner, when loading', async () => {
    renderSearchResults([], true)
    expect(await screen.findByLabelText('Ladestatus')).toBeVisible()
  })
})
