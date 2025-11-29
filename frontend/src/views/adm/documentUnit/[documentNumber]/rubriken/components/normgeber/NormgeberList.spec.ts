import { userEvent } from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { InstitutionType, type Normgeber } from '@/domain/normgeber'
import NormgeberList from './NormgeberList.vue'
import { createTestingPinia } from '@pinia/testing'
import type { AdmDocumentationUnit } from '@/domain/adm/admDocumentUnit'

const mocknormgeberList: Normgeber[] = [
  {
    id: 'normgeberId',
    institution: {
      id: 'institutionId',
      name: 'new institution',
      type: InstitutionType.Institution,
    },
    regions: [{ id: 'regionId', code: 'DEU' }],
  },
]

function renderComponent(normgeberList?: Normgeber[]) {
  const user = userEvent.setup()

  return {
    user,
    ...render(NormgeberList, {
      global: {
        plugins: [
          [
            createTestingPinia({
              initialState: {
                admDocumentUnit: {
                  documentUnit: <AdmDocumentationUnit>{
                    documentNumber: '1234567891234',
                    normgeberList: normgeberList ?? [],
                  },
                },
              },
            }),
          ],
        ],
      },
    }),
  }
}

describe('NormgeberList', () => {
  it('renders creation panel when there is no normgeber', async () => {
    renderComponent()
    expect(screen.getByRole('heading', { level: 2, name: 'Normgeber' })).toBeInTheDocument()
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
    expect(screen.getByLabelText('Normgeber *')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Normgeber hinzufügen' })).not.toBeInTheDocument()
  })

  it('renders a list of existing normgeberList', async () => {
    renderComponent(mocknormgeberList)
    expect(screen.queryAllByRole('listitem')).toHaveLength(1)
    expect(screen.getByText('DEU, new institution')).toBeInTheDocument()
    expect(screen.getByLabelText('Normgeber Editieren')).toBeInTheDocument()
  })

  it('opens the creation panel on clicking add', async () => {
    const { user } = renderComponent(mocknormgeberList)

    // when
    await user.click(screen.getByRole('button', { name: 'Normgeber hinzufügen' }))

    // then
    expect(screen.getByLabelText('Normgeber *')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Normgeber hinzufügen' })).not.toBeInTheDocument()
  })
})
