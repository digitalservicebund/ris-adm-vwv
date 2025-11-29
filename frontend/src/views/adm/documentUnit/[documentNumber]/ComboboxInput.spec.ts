import { userEvent } from '@testing-library/user-event'
import { render, screen, fireEvent } from '@testing-library/vue'
import ComboboxInput from './ComboboxInput.vue'
import type { ComboboxItem, ComboboxAttributes } from '@/components/input/types'
import comboboxItemService from '@/services/comboboxItemService'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const documentTypeItems = [
  {
    name: 'Verwaltungsvorschrift',
    abbreviation: 'VV',
  },
  {
    name: 'Verwaltungsregelung',
    abbreviation: 'VR',
  },
]
const fieldOfLawItems = [
  {
    identifier: 'PR',
    text: 'Phantasierecht',
  },
  {
    identifier: 'AV',
    text: 'Allgemeines Verwaltungsrecht',
  },
]

const pagination = {
  pageable: 'INSTANCE',
  last: true,
  totalElements: 2,
  totalPages: 1,
  first: true,
  size: 2,
  number: 0,
  sort: {
    empty: true,
    sorted: false,
    unsorted: true,
  },
  numberOfElements: 2,
  empty: false,
}

function renderComponent(
  options: {
    id?: string
    modelValue?: ComboboxItem
    itemService?: ComboboxAttributes['itemService']
    ariaLabel?: string
    manualEntry?: boolean
    noClear?: boolean
  } = {},
) {
  return {
    ...render(ComboboxInput, {
      props: {
        id: options.id ?? 'combobox-test',
        modelValue: options.modelValue,
        ariaLabel: options.ariaLabel ?? 'test label',
        manualEntry: options.manualEntry ?? false,
        noClear: options.noClear ?? false,
        itemService: options.itemService ?? comboboxItemService.getDocumentTypes,
      },
    }),
  }
}

const debounceTimeout = 200

describe('Combobox Element', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          documentTypes: documentTypeItems,
          paginatedDocumentTypes: { ...pagination, content: documentTypeItems },
        }),
        { status: 200 },
      ),
    )
    vi.useFakeTimers({
      toFake: ['setTimeout', 'clearTimeout', 'Date'],
    })
  })
  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

  it('is closed', () => {
    renderComponent()

    expect(screen.queryByDisplayValue('Verwaltungsvorschrift')).not.toBeInTheDocument()
    expect(screen.queryByDisplayValue('Verwaltungsregelung')).not.toBeInTheDocument()
  })

  it('is opened', async () => {
    renderComponent()

    const openComboboxContainer = screen.getByLabelText('Dropdown öffnen')
    await user.click(openComboboxContainer)
    await vi.advanceTimersByTimeAsync(debounceTimeout)
    expect(screen.getAllByLabelText('dropdown-option')).toHaveLength(2)
    const input = screen.getByLabelText('test label')
    await fireEvent.focus(input)
    await user.keyboard('{escape}')
    expect(screen.queryByLabelText('dropdown-option')).not.toBeInTheDocument()
  })

  it('focus should open dropdown', async () => {
    renderComponent()
    const input = screen.getByLabelText('test label')
    await fireEvent.focus(input)
    await vi.advanceTimersByTimeAsync(debounceTimeout)

    expect(screen.getAllByLabelText('dropdown-option')).toHaveLength(2)
  })

  it('enter should select top value', async () => {
    const { emitted } = renderComponent()
    const input = screen.getByLabelText('test label')
    await fireEvent.focus(input)
    await vi.advanceTimersByTimeAsync(debounceTimeout)
    expect(screen.getAllByLabelText('dropdown-option')).toHaveLength(2)

    input.focus()
    await user.keyboard('{ArrowDown}')
    await user.keyboard('{enter}')

    await vi.advanceTimersByTimeAsync(debounceTimeout)

    expect(emitted()['update:modelValue']).toEqual([
      [
        {
          name: 'Verwaltungsvorschrift',
          abbreviation: 'VV',
        },
      ],
      [
        {
          name: 'Verwaltungsvorschrift',
          abbreviation: 'VV',
        },
      ],
    ])
  })

  it('clear-button should unset the currently set value', async () => {
    const { emitted } = renderComponent()
    const input = screen.getByLabelText('test label')

    await user.type(input, 'verwalt')
    await vi.advanceTimersByTimeAsync(debounceTimeout)
    const dropdownItems = screen.getAllByLabelText('dropdown-option')

    await user.click(dropdownItems[1])

    expect(screen.queryByLabelText('dropdown-option')).not.toBeInTheDocument()

    const resetButton = screen.getByLabelText('Auswahl zurücksetzen')
    await user.click(resetButton)

    expect(input).toHaveValue('')
    expect(emitted()['update:modelValue']).toEqual([
      [
        {
          abbreviation: 'VR',
          name: 'Verwaltungsregelung',
        },
      ],
      [undefined],
    ])
  })

  it('items should be filtered', async () => {
    vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          documentTypes: [
            {
              name: 'Verwaltungsvorschrift',
              abbreviation: 'VV',
            },
          ],
          paginatedDocumentTypes: {
            ...pagination,
            content: [
              {
                name: 'Verwaltungsvorschrift',
                abbreviation: 'VV',
              },
            ],
          },
        }),
        { status: 200 },
      ),
    )

    renderComponent()

    const input = screen.getByLabelText('test label')
    await user.type(input, 'verwaltungsvorschrift')

    await vi.advanceTimersByTimeAsync(debounceTimeout)
    const dropdownItems = screen.queryAllByLabelText('dropdown-option')
    expect(dropdownItems).toHaveLength(1)

    expect(dropdownItems[0]).toHaveTextContent('Verwaltungsvorschrift')
  })

  it('items should stay filtered after selection', async () => {
    vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          documentTypes: [
            {
              name: 'Verwaltungsvorschrift',
              abbreviation: 'VV',
            },
          ],
          paginatedDocumentTypes: {
            ...pagination,
            content: [
              {
                name: 'Verwaltungsvorschrift',
                abbreviation: 'VV',
              },
            ],
          },
        }),
        { status: 200 },
      ),
    )

    renderComponent()

    const input = screen.getByLabelText('test label')
    await user.type(input, 'verwaltungsvorschrift')

    await vi.advanceTimersByTimeAsync(debounceTimeout)
    const dropdownItems = screen.getAllByLabelText('dropdown-option')

    expect(dropdownItems[0]).toHaveTextContent('Verwaltungsvorschrift')

    await user.click(dropdownItems[0])

    const openDropdownContainer = screen.getByLabelText('Dropdown öffnen')

    await user.click(openDropdownContainer)

    await vi.advanceTimersByTimeAsync(debounceTimeout)
    expect(screen.getAllByLabelText('dropdown-option')).toHaveLength(1)
  })

  it('items should stay filtered after typing without selection', async () => {
    vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          documentTypes: [
            {
              name: 'Verwaltungsvorschrift',
              abbreviation: 'VV',
            },
          ],
          paginatedDocumentTypes: {
            ...pagination,
            content: [
              {
                name: 'Verwaltungsvorschrift',
                abbreviation: 'VV',
              },
            ],
          },
        }),
        { status: 200 },
      ),
    )

    renderComponent()

    const input = screen.getByLabelText('test label')
    await user.type(input, 'verwaltungsvorschrift')

    await vi.advanceTimersByTimeAsync(debounceTimeout)
    const dropdownItems = screen.getAllByLabelText('dropdown-option')

    expect(dropdownItems).toHaveLength(1)
    expect(dropdownItems[0]).toHaveTextContent('Verwaltungsvorschrift')

    const closeDropdownContainer = screen.getByLabelText('Dropdown schließen')

    await user.click(closeDropdownContainer)
    const openDropdownContainer = screen.getByLabelText('Dropdown öffnen')
    await user.click(openDropdownContainer)

    expect(screen.getAllByLabelText('dropdown-option')).toHaveLength(1)
  })

  it('items should be filtered if selected value exists', async () => {
    vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          documentTypes: [
            {
              name: 'Verwaltungsregelung',
              abbreviation: 'VR',
            },
          ],
          paginatedDocumentTypes: {
            ...pagination,
            content: [
              {
                name: 'Verwaltungsregelung',
                abbreviation: 'VR',
              },
            ],
          },
        }),
        { status: 200 },
      ),
    )

    renderComponent({
      modelValue: {
        label: 'Verwaltungsregelung',
        value: {
          name: 'Verwaltungsregelung',
          abbreviation: 'VR',
        },
      },
    })

    const openDropdownContainer = screen.getByLabelText('Dropdown öffnen')

    await user.click(openDropdownContainer)
    await vi.advanceTimersByTimeAsync(debounceTimeout)
    const dropdownItems = screen.getAllByLabelText('dropdown-option')
    expect(dropdownItems).toHaveLength(1)
    expect(dropdownItems[0]).toHaveTextContent('Verwaltungsregelung')
  })

  it('items should show message if no items matched', async () => {
    vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          documentTypes: [],
          paginatedDocumentTypes: { ...pagination, content: [] },
        }),
        { status: 200 },
      ),
    )

    renderComponent()

    const input = screen.getByLabelText('test label')
    await user.type(input, 'courtlabel10')

    await vi.advanceTimersByTimeAsync(debounceTimeout)
    const dropdownItems = screen.getAllByLabelText('dropdown-option')

    expect(dropdownItems).toHaveLength(1)
    expect(dropdownItems[0]).toHaveTextContent('Kein passender Eintrag')
  })

  it('Dropdown item should be visible after selecting', async () => {
    vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          documentTypes: [
            {
              name: 'Verwaltungsregelung',
              abbreviation: 'VR',
            },
          ],
          paginatedDocumentTypes: {
            ...pagination,
            content: [
              {
                name: 'Verwaltungsregelung',
                abbreviation: 'VR',
              },
            ],
          },
        }),
        { status: 200 },
      ),
    )

    renderComponent()

    const input = screen.getByLabelText('test label')
    await user.type(input, 'Verwaltungsregelung')

    await vi.advanceTimersByTimeAsync(debounceTimeout)
    const dropdownItems = screen.getAllByLabelText('dropdown-option')
    expect(screen.getAllByLabelText('dropdown-option')).toHaveLength(1)
    expect(dropdownItems[0]).toHaveTextContent('Verwaltungsregelung')

    await user.click(dropdownItems[0])
    expect(screen.queryByLabelText('dropdown-option')).not.toBeInTheDocument()
    expect(input).toHaveValue('Verwaltungsregelung')

    const openDropdownContainer = screen.getByLabelText('Dropdown öffnen') as HTMLElement
    await user.click(openDropdownContainer)
    // the filter is still set to "testItem2", so we expect only that one item
    expect(screen.getAllByLabelText('dropdown-option')).toHaveLength(1)
  })

  it('uses endpoint to fetch all document type items', async () => {
    renderComponent({
      itemService: comboboxItemService.getDocumentTypes,
    })

    const openDropdownContainer = screen.getByLabelText('Dropdown öffnen')
    await user.click(openDropdownContainer)
    await vi.advanceTimersByTimeAsync(debounceTimeout)

    const dropdownItems = screen.getAllByLabelText('dropdown-option')

    expect(dropdownItems).toHaveLength(2)
    expect(dropdownItems[0]).toHaveTextContent('VerwaltungsvorschriftVV')
    await vi.advanceTimersByTimeAsync(debounceTimeout)
  })

  it('uses endpoint to fetch all field of law items', async () => {
    vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          fieldsOfLaw: fieldOfLawItems,
          page: { ...pagination, content: fieldOfLawItems },
        }),
        { status: 200 },
      ),
    )

    renderComponent({
      itemService: comboboxItemService.getFieldOfLawSearchByIdentifier,
    })

    const openDropdownContainer = screen.getByLabelText('Dropdown öffnen')
    await user.click(openDropdownContainer)
    await vi.advanceTimersByTimeAsync(debounceTimeout)

    const dropdownItems = screen.getAllByLabelText('dropdown-option')

    expect(dropdownItems).toHaveLength(2)
    expect(dropdownItems[0]).toHaveTextContent('PRPhantasierecht')
    await vi.advanceTimersByTimeAsync(debounceTimeout)
  })

  it('dropdown uses endpoint to fetch Court items based on search string', async () => {
    vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          documentTypes: [
            {
              name: 'Verwaltungsregelung',
              abbreviation: 'VR',
            },
          ],
          paginatedDocumentTypes: {
            ...pagination,
            content: [
              {
                name: 'Verwaltungsregelung',
                abbreviation: 'VR',
              },
            ],
          },
        }),
        { status: 200 },
      ),
    )

    renderComponent({})

    const input = screen.getByLabelText('test label')
    await user.type(input, 'reg')
    await vi.advanceTimersByTimeAsync(debounceTimeout)

    const dropdownItemElements = screen.getAllByLabelText('dropdown-option')

    // TODO checking for "b", "bg", "bgh" as the three arguments does not work though
    expect(dropdownItemElements).toHaveLength(1)
    expect(dropdownItemElements[0]).toHaveTextContent('Verwaltungsregelung')
  })

  it('should revert to last saved state when leaving the input field via esc/tab', async () => {
    vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          documentTypes: [],
          paginatedDocumentTypes: { ...pagination, content: [] },
        }),
        { status: 200 },
      ),
    )

    const { emitted } = renderComponent()

    const input = screen.getByLabelText('test label')
    await user.type(input, 'xxxxxx')
    await vi.advanceTimersByTimeAsync(debounceTimeout)

    let dropdownItems = screen.getAllByLabelText('dropdown-option')
    expect(dropdownItems).toHaveLength(1)
    expect(dropdownItems[0]).toHaveTextContent('Kein passender Eintrag')

    await user.keyboard('{escape}')
    await vi.advanceTimersByTimeAsync(debounceTimeout)

    expect(screen.queryByLabelText('dropdown-option')).not.toBeInTheDocument()
    expect(input).toHaveValue('')

    vi.spyOn(window, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          documentTypes: [
            {
              name: 'Verwaltungsregelung',
              abbreviation: 'VR',
            },
          ],
          paginatedDocumentTypes: {
            ...pagination,
            content: [
              {
                name: 'Verwaltungsregelung',
                abbreviation: 'VR',
              },
            ],
          },
        }),
        { status: 200 },
      ),
    )

    await user.type(input, 'Verwaltungsregelung')
    await vi.advanceTimersByTimeAsync(debounceTimeout)
    dropdownItems = screen.getAllByLabelText('dropdown-option')

    expect(dropdownItems).toHaveLength(1)
    expect(dropdownItems[0]).toHaveTextContent('VerwaltungsregelungVR')

    await user.keyboard('{enter}') // save the value
    await vi.advanceTimersByTimeAsync(debounceTimeout)
    expect(screen.queryByLabelText('dropdown-option')).not.toBeInTheDocument()
    expect(input).toHaveValue('Verwaltungsregelung')

    await user.type(input, 'foo')
    await user.keyboard('{tab}')
    await vi.advanceTimersByTimeAsync(debounceTimeout)

    expect(screen.queryByLabelText('dropdown-option')).not.toBeInTheDocument()
    // expect(input).toHaveValue("testItem1") does not work here anymore because
    // it doesn't appear in the DOM --> gets tested via e2e test instead
    // The workaround is to ensure that the model value was only updated once (on enter)
    expect(emitted()['update:modelValue']).toHaveLength(1)
  })

  it('top search result should get chosen upon enter', async () => {
    vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          documentTypes: [
            {
              name: 'Verwaltungsregelung',
              abbreviation: 'VR',
            },
          ],
          paginatedDocumentTypes: {
            ...pagination,
            content: [
              {
                name: 'Verwaltungsregelung',
                abbreviation: 'VR',
              },
            ],
          },
        }),
        { status: 200 },
      ),
    )

    const { emitted } = renderComponent()
    const input = screen.getByLabelText('test label')
    await user.type(input, 'VR')
    await vi.advanceTimersByTimeAsync(debounceTimeout)
    expect(screen.getAllByLabelText('dropdown-option')).toHaveLength(1)

    await user.keyboard('{enter}')

    expect(screen.queryByLabelText('dropdown-option')).not.toBeInTheDocument()
    // like in previous test: workaround for not being able to read testItem1 from the DOM
    expect(emitted()['update:modelValue']).toHaveLength(1)
    expect(emitted()['update:modelValue']).toEqual([
      [
        {
          name: 'Verwaltungsregelung',
          abbreviation: 'VR',
        },
      ],
    ])
  })

  it('adds new entry option if manual entry flag set and no result found', async () => {
    vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          documentTypes: [],
          paginatedDocumentTypes: { ...pagination, content: [] },
        }),
        { status: 200 },
      ),
    )

    const { emitted } = renderComponent({ manualEntry: true })

    const input = screen.getByLabelText('test label')
    await user.type(input, 'foo')

    await vi.advanceTimersByTimeAsync(debounceTimeout)
    const dropdownItems = screen.queryAllByLabelText('dropdown-option')
    expect(dropdownItems).toHaveLength(1)
    expect(dropdownItems[0]).toHaveTextContent('foo neu erstellen')
    await user.click(screen.getByText('foo neu erstellen'))

    expect(emitted()['update:modelValue']).toEqual([
      [
        {
          label: 'foo',
        },
      ],
    ])
  })

  it('adds new entry option if manual entry flag set and no exact match found', async () => {
    vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          documentTypes: [
            {
              name: 'Verwaltungsregelung',
              abbreviation: 'VR',
            },
          ],
          paginatedDocumentTypes: {
            ...pagination,
            content: [
              {
                name: 'Verwaltungsregelung',
                abbreviation: 'VR',
              },
            ],
          },
        }),
        { status: 200 },
      ),
    )

    renderComponent({ manualEntry: true })

    const input = screen.getByLabelText('test label')
    await user.type(input, 'Ver')

    await vi.advanceTimersByTimeAsync(debounceTimeout)
    const dropdownItems = screen.queryAllByLabelText('dropdown-option')
    expect(dropdownItems).toHaveLength(2)
    expect(dropdownItems[0]).toHaveTextContent('Verwaltungsregelung')
    expect(dropdownItems[1]).toHaveTextContent('Ver neu erstellen')
  })

  it('removes new entry option when exact match found', async () => {
    vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          documentTypes: [
            {
              name: 'Verwaltungsregelung',
              abbreviation: 'VR',
            },
          ],
          paginatedDocumentTypes: {
            ...pagination,
            content: [
              {
                name: 'Verwaltungsregelung',
                abbreviation: 'VR',
              },
            ],
          },
        }),
        { status: 200 },
      ),
    )

    renderComponent({ manualEntry: true })

    const input = screen.getByLabelText('test label')
    await user.type(input, 'Ver')

    await vi.advanceTimersByTimeAsync(debounceTimeout)
    const dropdownItems = screen.queryAllByLabelText('dropdown-option')

    expect(dropdownItems).toHaveLength(2)
    expect(dropdownItems[0]).toHaveTextContent('Verwaltungsregelung')
    expect(dropdownItems[1]).toHaveTextContent('Ver neu erstellen')

    await user.type(input, 'Verwaltungsregelung')
    await vi.advanceTimersByTimeAsync(debounceTimeout)

    expect(screen.queryAllByLabelText('dropdown-option')).toHaveLength(1)
    expect(screen.queryAllByLabelText('dropdown-option')[0]).toHaveTextContent(
      'VerwaltungsregelungVR',
    )
  })

  it('spaces should be ignored', async () => {
    vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          documentTypes: [],
          paginatedDocumentTypes: { ...pagination, content: [] },
        }),
        { status: 200 },
      ),
    )

    renderComponent({ manualEntry: true })

    const input = screen.getByLabelText('test label')
    await user.type(input, 'testItem1 ')

    await vi.advanceTimersByTimeAsync(debounceTimeout)
    const dropdownItems = screen.queryAllByLabelText('dropdown-option')
    expect(dropdownItems).toHaveLength(1)
    expect(dropdownItems[0]).toHaveTextContent('testItem1')
    expect(screen.queryByText('testItem1  neu erstellen')).not.toBeInTheDocument()
  })

  it('does not add new entry option if flag for manual entry is not set', async () => {
    const { emitted } = renderComponent({ manualEntry: false })

    await user.type(screen.getByLabelText('test label'), 'foo')
    expect(screen.queryByText('foo neu erstellen')).not.toBeInTheDocument()

    await user.tab()

    expect(emitted()['update:modelValue']).toBeUndefined()
  })

  it('does not render clear button if noClear flag is set', async () => {
    renderComponent({ noClear: true })

    await user.type(screen.getByLabelText('test label'), 'a')
    await vi.advanceTimersByTimeAsync(debounceTimeout)
    const dropdownItems = screen.getAllByLabelText('dropdown-option')
    await user.click(dropdownItems[1])

    expect(screen.queryByLabelText('dropdown-option')).not.toBeInTheDocument()

    expect(screen.queryByLabelText('Auswahl zurücksetzen')).not.toBeInTheDocument()
  })

  it('deleting manually updates the filter', async () => {
    vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          documentTypes: [],
          paginatedDocumentTypes: { ...pagination, content: [] },
        }),
        { status: 200 },
      ),
    )

    renderComponent()

    const input = screen.getByLabelText('test label')
    await user.type(input, 'x')

    await vi.advanceTimersByTimeAsync(debounceTimeout)
    const dropdownItems = screen.getAllByLabelText('dropdown-option')
    expect(dropdownItems).toHaveLength(1)
    expect(dropdownItems[0]).toHaveTextContent('Kein passender Eintrag')

    vi.spyOn(window, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          documentTypes: [
            {
              name: 'Verwaltungsregelung',
              abbreviation: 'VR',
            },
          ],
          paginatedDocumentTypes: {
            ...pagination,
            content: [
              {
                name: 'Verwaltungsregelung',
                abbreviation: 'VR',
              },
            ],
          },
        }),
        { status: 200 },
      ),
    )

    input.focus()
    await user.keyboard('{Backspace}')
    await vi.advanceTimersByTimeAsync(debounceTimeout)
    expect(screen.getAllByLabelText('dropdown-option')).toHaveLength(1)
    expect(screen.getAllByLabelText('dropdown-option')[0]).toHaveTextContent('Verwaltungsregelung')
  })

  describe('keyboard navigation', () => {
    it('should select next value on arrow down', async () => {
      renderComponent()
      const input = screen.getByLabelText('test label')
      await fireEvent.focus(input)
      await vi.advanceTimersByTimeAsync(debounceTimeout)
      const items = screen.getAllByLabelText('dropdown-option')

      input.focus()
      expect(input).toHaveFocus()

      await fireEvent.keyDown(input, { key: 'ArrowDown' })
      expect(items[0]).toHaveFocus()

      // Focus does not change on last element
      await fireEvent.keyDown(items[1], { key: 'ArrowDown' })
      expect(items[1]).toHaveFocus()

      // Check that I can immediately move up even when pressing arrow-down multiple times before -> index in bounds
      await fireEvent.keyDown(items[1], { key: 'ArrowUp' })
      expect(items[0]).toHaveFocus()
    })

    it('should select previous value on arrow up', async () => {
      renderComponent()
      const input = screen.getByLabelText('test label')
      await fireEvent.focus(input)
      await vi.advanceTimersByTimeAsync(debounceTimeout)
      const items = screen.getAllByLabelText('dropdown-option')

      input.focus()
      await fireEvent.keyDown(input, { key: 'ArrowDown' })
      expect(items[0]).toHaveFocus()

      await fireEvent.keyDown(input, { key: 'ArrowDown' })
      expect(items[1]).toHaveFocus()

      await fireEvent.keyDown(items[1], { key: 'ArrowUp' })
      expect(items[0]).toHaveFocus()

      // Focus does not change when pressing arrow-up on first element
      await fireEvent.keyDown(items[0], { key: 'ArrowUp' })
      expect(items[0]).toHaveFocus()

      // Make sure index is in bounds (not smaller than 0)
      await fireEvent.keyDown(input, { key: 'ArrowDown' })
      expect(items[1]).toHaveFocus()
    })

    it('should work with createNewItem link without any items', async () => {
      vi.spyOn(window, 'fetch').mockResolvedValue(
        new Response(
          JSON.stringify({
            documentTypes: [],
            paginatedDocumentTypes: { ...pagination, content: [] },
          }),
          { status: 200 },
        ),
      )

      renderComponent({ manualEntry: true })
      const input = screen.getByLabelText('test label')
      await fireEvent.focus(input)
      await user.type(input, 'testItem')
      await vi.advanceTimersByTimeAsync(debounceTimeout)
      const items = screen.getAllByLabelText('dropdown-option')

      expect(items[0]).not.toHaveFocus()
      await fireEvent.keyDown(input, { key: 'ArrowDown' })
      expect(items[0]).toHaveFocus()
    })

    it('should work with only createNewItem link with items', async () => {
      vi.spyOn(window, 'fetch').mockResolvedValue(
        new Response(
          JSON.stringify({
            documentTypes: [
              {
                name: 'Verwaltungsregelung',
                abbreviation: 'VR',
              },
            ],
            paginatedDocumentTypes: {
              ...pagination,
              content: [
                {
                  name: 'Verwaltungsregelung',
                  abbreviation: 'VR',
                },
              ],
            },
          }),
          { status: 200 },
        ),
      )

      renderComponent({ manualEntry: true })
      const input = screen.getByLabelText('test label')
      await fireEvent.focus(input)
      await user.type(input, 'Ver')
      await vi.advanceTimersByTimeAsync(debounceTimeout)
      const items = screen.getAllByLabelText('dropdown-option')
      // Move to createNewItem link
      await fireEvent.keyDown(input, { key: 'ArrowDown' })
      await fireEvent.keyDown(input, { key: 'ArrowDown' })

      expect(items[1]).toHaveFocus()

      // Focus stays the same on last element
      await fireEvent.keyDown(items[1], { key: 'ArrowDown' })
      expect(items[1]).toHaveFocus()

      // You can move up again from the focused create link element
      await fireEvent.keyDown(items[1], { key: 'ArrowUp' })
      expect(items[0]).toHaveFocus()
    })
  })
})
