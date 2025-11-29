import { describe, expect, it } from 'vitest'
import { fireEvent, render, type RenderResult, screen } from '@testing-library/vue'
import FieldOfLawSummary from './FieldOfLawSummary.vue'
import { type FieldOfLaw } from '@/domain/fieldOfLaw'

function renderComponent(fieldsOfLaw: FieldOfLaw[]): RenderResult {
  return render(FieldOfLawSummary, { props: { fieldsOfLaw } })
}

function generateFieldOfLawOld(): FieldOfLaw {
  return {
    identifier: '01-',
    text: 'Ganz altes Recht 1-2-3',
    notation: 'OLD',
    norms: [],
    children: [],
    hasChildren: false,
  }
}

function generateFieldOfLawNew(): FieldOfLaw {
  return {
    identifier: 'ST-01-02-03',
    text: 'Steuerrecht 1-2-3',
    notation: 'NEW',
    norms: [],
    children: [],
    hasChildren: false,
  }
}

describe('FieldOfLawSummary', () => {
  it('render one old entry', () => {
    renderComponent([generateFieldOfLawOld()])

    expect(screen.getByText('01-')).toBeInTheDocument()
    expect(screen.getByText('Ganz altes Recht 1-2-3')).toBeInTheDocument()
    expect(
      screen.queryByLabelText('01- Ganz altes Recht 1-2-3 im Sachgebietsbaum anzeigen'),
    ).not.toBeInTheDocument()
    expect(
      screen.getByLabelText('01- Ganz altes Recht 1-2-3 aus Liste entfernen'),
    ).toBeInTheDocument()
  })

  it('render one new entry', () => {
    renderComponent([generateFieldOfLawNew()])

    expect(screen.getByText('ST-01-02-03')).toBeInTheDocument()
    expect(screen.getByText('Steuerrecht 1-2-3')).toBeInTheDocument()
    expect(
      screen.getByLabelText('ST-01-02-03 Steuerrecht 1-2-3 im Sachgebietsbaum anzeigen'),
    ).toBeInTheDocument()
    expect(
      screen.getByLabelText('ST-01-02-03 Steuerrecht 1-2-3 aus Liste entfernen'),
    ).toBeInTheDocument()
  })

  it("click on 'Löschen' emit 'node:remove'", async () => {
    const { emitted } = renderComponent([generateFieldOfLawNew()])

    await fireEvent.click(
      screen.getByLabelText('ST-01-02-03 Steuerrecht 1-2-3 aus Liste entfernen'),
    )

    expect(emitted()['node:remove']).toBeTruthy()
  })

  it("click on 'Auswahl im Sachgebietsbaum anzeigen' emit 'node:clicked", async () => {
    const { emitted } = renderComponent([generateFieldOfLawNew()])

    await fireEvent.click(
      screen.getByLabelText('ST-01-02-03 Steuerrecht 1-2-3 im Sachgebietsbaum anzeigen'),
    )
    expect(emitted()['node:clicked']).toBeTruthy()
  })
})
