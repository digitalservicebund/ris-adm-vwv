import { afterEach, describe, expect, it, vi } from 'vitest'
import { userEvent } from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/vue'
import FieldOfLawTreeVue from './FieldOfLawTree.vue'
import { type FieldOfLaw } from '@/domain/fieldOfLaw'

function renderComponent(
  options: {
    selectedNodes?: FieldOfLaw[]
    nodeOfInterest?: FieldOfLaw
  } = {},
) {
  const user = userEvent.setup()
  return {
    user,
    ...render(FieldOfLawTreeVue, {
      props: {
        selectedNodes: options.selectedNodes ?? [],
        nodeOfInterest: options.nodeOfInterest,
        showNorms: true,
      },
    }),
  }
}

const rootFixture = {
  fieldsOfLaw: [
    {
      hasChildren: true,
      identifier: 'PR',
      text: 'Phantasierecht',
      linkedFields: [],
      norms: [],
      children: [],
    },
    {
      hasChildren: true,
      identifier: 'AV',
      text: 'Allgemeines Verwaltungsrecht',
      linkedFields: [],
      norms: [],
      children: [],
    },
    {
      identifier: 'AB-01',
      text: 'Text for AB',
      children: [],
      norms: [],
      isExpanded: false,
      hasChildren: false,
    },
    {
      identifier: 'CD-02',
      text: 'And text for CD with link to AB-01',
      children: [],
      norms: [],
      linkedFields: ['AB-01'],
      isExpanded: false,
      hasChildren: false,
    },
  ],
}

const prFixture = {
  fieldsOfLaw: [
    {
      hasChildren: true,
      identifier: 'PR-05',
      text: 'Beendigung der Phantasieverhältnisse',
      linkedFields: [],
      norms: [
        {
          abbreviation: 'PStG',
          singleNormDescription: '§ 99',
        },
      ],
      children: [],
      parent: {
        hasChildren: true,
        identifier: 'PR',
        text: 'Phantasierecht',
        linkedFields: [],
        norms: [],
        children: [],
        parent: undefined,
      },
    },
  ],
}

const childrenAnParentFixture = {
  hasChildren: true,
  identifier: 'PR-05',
  text: 'Beendigung der Phantasieverhältnisse',
  norms: [
    {
      abbreviation: 'PStG',
      singleNormDescription: '§ 99',
    },
  ],
  children: [
    {
      hasChildren: false,
      identifier: 'PR-05-01',
      text: 'Phantasie besonderer Art, Ansprüche anderer Art',
      norms: [],
      children: [],
      parent: {
        hasChildren: true,
        identifier: 'PR-05',
        text: 'Beendigung der Phantasieverhältnisse',
        linkedFields: [],
        norms: [
          {
            abbreviation: 'PStG',
            singleNormDescription: '§ 99',
          },
        ],
        children: [],
        parent: {
          hasChildren: true,
          identifier: 'PR',
          text: 'Phantasierecht',
          norms: [],
          children: [],
        },
      },
    },
  ],
  parent: {
    id: 'a785fb96-a45d-4d4c-8d9c-92d8a6592b22',
    hasChildren: true,
    identifier: 'PR',
    text: 'Phantasierecht',
    norms: [
      {
        abbreviation: 'PStG',
        singleNormDescription: '§ 99',
      },
    ],
    children: [],
  },
}

const pr0501Fixture = {
  fieldsOfLaw: [
    {
      hasChildren: false,
      identifier: 'PR-05-01',
      text: 'Phantasie besonderer Art, Ansprüche anderer Art',
      norms: [],
      children: [],
      parent: {
        hasChildren: true,
        identifier: 'PR-05',
        text: 'Beendigung der Phantasieverhältnisse',
        linkedFields: [],
        norms: [
          {
            abbreviation: 'PStG',
            singleNormDescription: '§ 99',
          },
        ],
        children: [],
        parent: {
          hasChildren: true,
          identifier: 'PR',
          text: 'Phantasierecht',
          norms: [],
          children: [],
        },
      },
    },
  ],
}

describe('FieldOfLawTree', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('Tree is fully closed upon at start', async () => {
    vi.spyOn(window, 'fetch')
    renderComponent()
    expect(window.fetch).toBeCalledTimes(0)
    expect(screen.getByText('Alle Sachgebiete')).toBeInTheDocument()
    expect(screen.getByLabelText('Alle Sachgebiete aufklappen')).toBeInTheDocument()
    expect(screen.queryByText('Text for AB')).not.toBeInTheDocument()
    expect(screen.queryByText('And text for CD')).not.toBeInTheDocument()
  })

  it('Tree opens top level nodes upon root click', async () => {
    vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(rootFixture), { status: 200 }),
    )

    const { user } = renderComponent()

    await user.click(screen.getByLabelText('Alle Sachgebiete aufklappen'))

    expect(window.fetch).toBeCalledTimes(1)
    expect(screen.getByText('Text for AB')).toBeInTheDocument()
    expect(screen.getByText('And text for CD with link to AB-01')).toBeInTheDocument()
    expect(screen.getByText('Alle Sachgebiete')).toBeInTheDocument()
  })

  it('Tree opens sub level nodes upon children click', async () => {
    vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(rootFixture), { status: 200 }),
    )

    const { user } = renderComponent()

    await user.click(screen.getByLabelText('Alle Sachgebiete aufklappen'))

    vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(prFixture), { status: 200 }),
    )

    await user.click(screen.getByLabelText('Phantasierecht aufklappen'))

    expect(screen.getByText('Beendigung der Phantasieverhältnisse')).toBeInTheDocument()
  })

  it('Node of interest is set and corresponding nodes are opened in the tree (other nodes truncated)', async () => {
    vi.spyOn(window, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify(childrenAnParentFixture), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(rootFixture), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(pr0501Fixture), { status: 200 }))

    renderComponent({
      nodeOfInterest: {
        hasChildren: true,
        identifier: 'PR',
        text: 'Phantasierecht',
        linkedFields: [],
        norms: [],
        children: [],
        notation: '',
      },
    })

    await waitFor(() => {
      expect(screen.getByLabelText('Alle Sachgebiete einklappen')).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(
        screen.getByText('Phantasie besonderer Art, Ansprüche anderer Art'),
      ).toBeInTheDocument()
    })
    expect(window.fetch).toBeCalledTimes(3)
    expect(screen.queryByText('Allgemeines Verwaltungsrecht')).not.toBeInTheDocument()
  })

  it('Node of interest is set and corresponding nodes are opened in the tree (other nodes truncated) - when root child node is collapsed all other root children shall be loaded', async () => {
    vi.spyOn(window, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify(childrenAnParentFixture), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(rootFixture), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(pr0501Fixture), { status: 200 }))

    // given
    const { rerender, user } = renderComponent({
      nodeOfInterest: {
        hasChildren: true,
        identifier: 'PR',
        text: 'Phantasierecht',
        linkedFields: [],
        norms: [],
        children: [],
        notation: '',
      },
    })

    await waitFor(() => {
      expect(
        screen.getByText('Phantasie besonderer Art, Ansprüche anderer Art'),
      ).toBeInTheDocument()
    })

    // when
    // Simulate executing the event 'node-of-interest:reset'
    await rerender({
      nodeOfInterest: undefined,
    })
    await user.click(screen.getByLabelText('Phantasierecht einklappen'))

    // this means one more call for children
    await waitFor(() => {
      expect(window.fetch).toBeCalledTimes(3)
    })

    // then
    await waitFor(() => {
      expect(screen.getByText('Allgemeines Verwaltungsrecht')).toBeInTheDocument()
    })
  })

  it('norms checkbox is checked and norms are visible', async () => {
    vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(rootFixture), { status: 200 }),
    )

    const { user } = renderComponent()

    await user.click(screen.getByLabelText('Alle Sachgebiete aufklappen'))

    vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(prFixture), { status: 200 }),
    )

    await user.click(screen.getByLabelText('Phantasierecht aufklappen'))

    expect(screen.getByText('Beendigung der Phantasieverhältnisse')).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Normen anzeigen' })).toBeChecked()
    await waitFor(() => {
      expect(screen.getByText('§ 99')).toBeInTheDocument()
    })
  })

  it('toggles showNorms checkbox and emits event', async () => {
    const { user, emitted } = renderComponent()

    const checkbox = screen.getByRole('checkbox', { name: 'Normen anzeigen' })
    await user.click(checkbox)

    expect(emitted()['toggle-show-norms']).toBeTruthy()
  })
})
