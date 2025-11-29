import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { nextTick, reactive } from 'vue'
import userEvent from '@testing-library/user-event'
import RisTabs from './RisTabs.vue'
import type { RisTab } from './RisTabs.vue'
import { DocumentCategory } from '@/domain/documentType'
import { ROUTE_NAMES } from '@/constants/routes'

const mockPush = vi.fn()
const mockRoute = reactive({
  meta: {},
})

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
  useRouter: () => ({ push: mockPush }),
}))

describe('RisTabs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRoute.meta = {}
  })

  it('renders tabs with labels', async () => {
    const tabs: RisTab[] = [
      { id: '0', routeName: ROUTE_NAMES.ULI.START_PAGE, label: 'Unselbständige Literatur' },
      { id: '1', routeName: ROUTE_NAMES.SLI.START_PAGE, label: 'Selbständige Literatur' },
    ]

    render(RisTabs, {
      props: { tabs },
      global: {
        stubs: { RouterLink: true },
        renderStubDefaultSlot: true,
      },
    })

    await nextTick()

    expect(screen.getByRole('tab', { name: 'Unselbständige Literatur' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Selbständige Literatur' })).toBeInTheDocument()
  })

  it('activates tab based on route.meta.documentCategory', async () => {
    mockRoute.meta = { documentCategory: DocumentCategory.LITERATUR_SELBSTAENDIG }

    const tabs: RisTab[] = [
      {
        id: '0',
        routeName: ROUTE_NAMES.ULI.START_PAGE,
        label: 'Unselbständige Literatur',
        documentCategory: DocumentCategory.LITERATUR_UNSELBSTAENDIG,
      },
      {
        id: '1',
        routeName: ROUTE_NAMES.SLI.START_PAGE,
        label: 'Selbständige Literatur',
        documentCategory: DocumentCategory.LITERATUR_SELBSTAENDIG,
      },
    ]

    render(RisTabs, {
      props: { tabs },
      global: {
        stubs: { RouterLink: true },
        renderStubDefaultSlot: true,
      },
    })

    await nextTick()

    const tab2 = screen.getByRole('tab', { name: 'Selbständige Literatur' })
    expect(tab2).toHaveAttribute('aria-selected', 'true')
  })

  it('activates tab based on defaultTab prop when no documentCategory', async () => {
    mockRoute.meta = {}

    const tabs: RisTab[] = [
      { id: '0', routeName: ROUTE_NAMES.ULI.START_PAGE, label: 'Unselbständige Literatur' },
      { id: '1', routeName: ROUTE_NAMES.SLI.START_PAGE, label: 'Selbständige Literatur' },
    ]

    render(RisTabs, {
      props: { tabs, defaultTab: '1' },
      global: {
        stubs: { RouterLink: true },
        renderStubDefaultSlot: true,
      },
    })

    await nextTick()

    const tab2 = screen.getByRole('tab', { name: 'Selbständige Literatur' })
    expect(tab2).toHaveAttribute('aria-selected', 'true')
  })

  it('falls back to first tab if no defaultTab and no matching documentCategory', async () => {
    const tabs: RisTab[] = [
      { id: '0', routeName: ROUTE_NAMES.ULI.START_PAGE, label: 'Unselbständige Literatur' },
      { id: '1', routeName: ROUTE_NAMES.SLI.START_PAGE, label: 'Selbständige Literatur' },
    ]

    mockRoute.meta = {}

    render(RisTabs, {
      props: { tabs },
      global: {
        stubs: { RouterLink: true },
        renderStubDefaultSlot: true,
      },
    })

    await nextTick()

    const tab1 = screen.getByRole('tab', { name: 'Unselbständige Literatur' })
    expect(tab1).toHaveAttribute('aria-selected', 'true')
  })

  it('navigates to correct route when tab is clicked', async () => {
    const user = userEvent.setup()
    const tabs: RisTab[] = [
      { id: '0', routeName: ROUTE_NAMES.ULI.START_PAGE, label: 'Unselbständige Literatur' },
      { id: '1', routeName: ROUTE_NAMES.SLI.START_PAGE, label: 'Selbständige Literatur' },
    ]

    render(RisTabs, {
      props: { tabs },
      global: {
        stubs: { RouterLink: true },
        renderStubDefaultSlot: true,
      },
    })

    await nextTick()

    const tab2 = screen.getByRole('tab', { name: 'Selbständige Literatur' })
    await user.click(tab2)

    expect(mockPush).toHaveBeenCalledWith({ name: ROUTE_NAMES.SLI.START_PAGE })
  })

  it('prioritizes documentCategory over defaultTab', async () => {
    mockRoute.meta = { documentCategory: DocumentCategory.LITERATUR_UNSELBSTAENDIG }

    const tabs: RisTab[] = [
      {
        id: '0',
        routeName: ROUTE_NAMES.ULI.START_PAGE,
        label: 'Unselbständige Literatur',
        documentCategory: DocumentCategory.LITERATUR_UNSELBSTAENDIG,
      },
      {
        id: '1',
        routeName: ROUTE_NAMES.SLI.START_PAGE,
        label: 'Selbständige Literatur',
        documentCategory: DocumentCategory.LITERATUR_SELBSTAENDIG,
      },
    ]

    render(RisTabs, {
      props: { tabs, defaultTab: '1' },
      global: {
        stubs: { RouterLink: true },
        renderStubDefaultSlot: true,
      },
    })

    await nextTick()

    const tab1 = screen.getByRole('tab', { name: 'Unselbständige Literatur' })
    expect(tab1).toHaveAttribute('aria-selected', 'true')
  })

  it('handles empty tabs array gracefully, i.e. not show the tabs', async () => {
    render(RisTabs, {
      props: { tabs: [] },
      global: {
        stubs: { RouterLink: true },
        renderStubDefaultSlot: true,
      },
    })

    await nextTick()

    expect(screen.queryByRole('tab')).not.toBeInTheDocument()
  })
})
