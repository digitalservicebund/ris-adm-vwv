import { describe, vi, it, expect } from 'vitest'
import { userEvent } from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import FieldOfLawTreeVue from '@/components/field-of-law/FieldOfLawTree.vue'
import { type FieldOfLaw } from '@/domain/fieldOfLaw'
import FieldOfLawService from '@/services/fieldOfLawService'

function renderComponent(
  options: {
    modelValue?: FieldOfLaw[]
    nodeOfInterest?: FieldOfLaw
  } = {},
) {
  return render(FieldOfLawTreeVue, {
    props: {
      modelValue: options.modelValue ?? [],
      nodeOfInterest: options.nodeOfInterest,
      showNorms: false,
    },
  })
}

describe('FieldOfLawTree', () => {
  const user = userEvent.setup()

  const dataOnRoot = Promise.resolve({
    status: 200,
    data: [
      {
        hasChildren: true,
        identifier: 'AR',
        text: 'Arbeitsrecht',
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
  })
  const dataOnAR = Promise.resolve({
    status: 200,
    data: [
      {
        hasChildren: true,
        identifier: 'AR-01',
        text: 'Arbeitsvertrag: Abschluss, Klauseln, Arten, Betriebsübergang',
        linkedFields: [],
        norms: [
          {
            abbreviation: 'BGB',
            singleNormDescription: '§ 611a',
          },
          {
            abbreviation: 'GewO',
            singleNormDescription: '§ 105',
          },
        ],
        children: [],
        parent: {
          hasChildren: true,
          identifier: 'AR',
          text: 'Arbeitsrecht',
          linkedFields: [],
          norms: [],
          children: [],
          parent: undefined,
        },
      },
    ],
  })

  const fetchSpy = vi
    .spyOn(FieldOfLawService, 'getChildrenOf')
    .mockImplementation((identifier: string) => {
      if (identifier != 'root') return dataOnAR
      return dataOnRoot
    })

  it('Tree is fully closed upon at start', async () => {
    renderComponent()
    expect(fetchSpy).toBeCalledTimes(1)
    expect(screen.getByText('Alle Sachgebiete')).toBeInTheDocument()
    expect(screen.getByLabelText('Alle Sachgebiete aufklappen')).toBeInTheDocument()
    expect(screen.queryByText('Text for AB')).not.toBeInTheDocument()
    expect(screen.queryByText('And text for CD')).not.toBeInTheDocument()
  })

  it('Tree opens top level nodes upon root click', async () => {
    renderComponent()

    await user.click(screen.getByLabelText('Alle Sachgebiete aufklappen'))

    expect(fetchSpy).toBeCalledTimes(4)
    expect(screen.getByText('Text for AB')).toBeInTheDocument()
    expect(screen.getByText('And text for CD with link to AB-01')).toBeInTheDocument()
    expect(screen.getByText('Alle Sachgebiete')).toBeInTheDocument()
  })

  it('Tree opens sub level nodes upon children click', async () => {
    renderComponent()

    await user.click(screen.getByLabelText('Alle Sachgebiete aufklappen'))

    await user.click(screen.getByLabelText('Arbeitsrecht aufklappen'))

    expect(fetchSpy).toBeCalledWith('AR')

    expect(
      screen.getByText('Arbeitsvertrag: Abschluss, Klauseln, Arten, Betriebsübergang'),
    ).toBeInTheDocument()
  })

  it('Node of interest is set and the tree is truncated', async () => {
    renderComponent({
      nodeOfInterest: {
        hasChildren: true,
        identifier: 'AR',
        text: 'Arbeitsrecht',
        linkedFields: [],
        norms: [],
        children: [],
      },
    })

    await user.click(screen.getByLabelText('Alle Sachgebiete aufklappen'))

    expect(screen.queryByText('Allgemeines Verwaltungsrecht')).not.toBeInTheDocument()
  })
})
