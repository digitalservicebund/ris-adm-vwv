import { describe, it, expect, vi } from 'vitest'
import { getAdmVwvMenuItems, getUliMenuItems } from '@/utils/menuItems'
import { ROUTE_NAMES } from '@/constants/routes'
import type MenuItem from '@/domain/menuItem'

vi.spyOn(console, 'warn').mockImplementation(() => {})

describe('getAdmVwvMenuItems', () => {
  const mockDocumentNumber = '12345'
  const mockRouteQuery = { tab: 'details' }

  it('returns an empty array if documentNumber is undefined', () => {
    const result = getAdmVwvMenuItems(undefined, mockRouteQuery)
    expect(result).toEqual([])
    expect(console.warn).toHaveBeenCalledWith('documentNumber is required to generate menu items.')
  })

  it('returns an array of menu items if documentNumber is provided', () => {
    const result = getAdmVwvMenuItems(mockDocumentNumber, mockRouteQuery)
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBe(3) // Fundstellen, Rubriken, Abgabe
  })

  it('includes all expected top-level menu items', () => {
    const result = getAdmVwvMenuItems(mockDocumentNumber, mockRouteQuery)
    const labels = result.map((item: MenuItem) => item.label)
    expect(labels).toEqual(['Fundstellen', 'Rubriken', 'Abgabe'])
  })

  it('sets the correct route for each top-level menu item', () => {
    const result = getAdmVwvMenuItems(mockDocumentNumber, mockRouteQuery)

    // Fundstellen
    expect(result[0]?.route.name).toBe(ROUTE_NAMES.VWV.DOCUMENT_UNIT.FUNDSTELLEN)
    expect(result[0]?.route.params?.documentNumber).toBe(mockDocumentNumber)
    expect(result[0]?.route.query).toEqual(mockRouteQuery)

    // Rubriken
    expect(result[1]?.route.name).toBe(ROUTE_NAMES.VWV.DOCUMENT_UNIT.RUBRIKEN)
    expect(result[1]?.route.params?.documentNumber).toBe(mockDocumentNumber)
    expect(result[1]?.route.query).toEqual(mockRouteQuery)

    // Abgabe
    expect(result[2]?.route.name).toBe(ROUTE_NAMES.VWV.DOCUMENT_UNIT.ABGABE)
    expect(result[2]?.route.params?.documentNumber).toBe(mockDocumentNumber)
    expect(result[2]?.route.query).toEqual(mockRouteQuery)
  })

  it('includes all expected children for the "Rubriken" menu item', () => {
    const result = getAdmVwvMenuItems(mockDocumentNumber, mockRouteQuery)
    const rubrikenItem = result.find((item: MenuItem) => item.label === 'Rubriken')
    expect(rubrikenItem?.children).toBeDefined()
    expect(rubrikenItem?.children?.length).toBe(4)

    const childLabels = rubrikenItem?.children?.map((child: MenuItem) => child.label)
    expect(childLabels).toEqual([
      'Formaldaten',
      'Gliederung',
      'Inhaltliche Erschließung',
      'Kurzreferat',
    ])
  })

  it('sets the correct route and hash for each child of "Rubriken"', () => {
    const result = getAdmVwvMenuItems(mockDocumentNumber, mockRouteQuery)
    const rubrikenItem = result.find((item: MenuItem) => item.label === 'Rubriken')

    rubrikenItem?.children?.forEach((child: MenuItem) => {
      expect(child.route.name).toBe(ROUTE_NAMES.VWV.DOCUMENT_UNIT.RUBRIKEN)
      expect(child.route.params?.documentNumber).toBe(mockDocumentNumber)
      expect(child.route.query).toEqual(mockRouteQuery)
      expect(child.route.hash).toBeDefined()
    })
  })

  it('handles empty routeQuery gracefully', () => {
    const result = getAdmVwvMenuItems(mockDocumentNumber, {})
    result.forEach((item: MenuItem) => {
      expect(item.route.query).toEqual({})
      if (item.children) {
        item.children.forEach((child: MenuItem) => {
          expect(child.route.query).toEqual({})
        })
      }
    })
  })
})

describe('getUliMenuItems', () => {
  const mockDocumentNumber = '12345'
  const mockRouteQuery = { tab: 'details' }

  it('returns an empty array if documentNumber is undefined', () => {
    const result = getUliMenuItems(undefined, mockRouteQuery)
    expect(result).toEqual([])
    expect(console.warn).toHaveBeenCalledWith('documentNumber is required to generate menu items.')
  })

  it('returns an array with a single "Rubriken" menu item if documentNumber is provided', () => {
    const result = getUliMenuItems(mockDocumentNumber, mockRouteQuery)
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBe(1)
    expect(result[0]?.label).toBe('Rubriken')
  })

  it('sets the correct route for the "Rubriken" menu item', () => {
    const result = getUliMenuItems(mockDocumentNumber, mockRouteQuery)
    expect(result[0]?.route.name).toBe(ROUTE_NAMES.ULI.DOCUMENT_UNIT.RUBRIKEN)
    expect(result[0]?.route.params?.documentNumber).toBe(mockDocumentNumber)
    expect(result[0]?.route.query).toEqual(mockRouteQuery)
  })

  it('includes a single "Formaldaten" child for the "Rubriken" menu item', () => {
    const result = getUliMenuItems(mockDocumentNumber, mockRouteQuery)
    const rubrikenItem = result[0]
    expect(rubrikenItem?.children).toBeDefined()
    expect(rubrikenItem?.children?.length).toBe(1)
    expect(rubrikenItem?.children?.[0]?.label).toBe('Formaldaten')
  })

  it('sets the correct route and hash for the "Formaldaten" child', () => {
    const result = getUliMenuItems(mockDocumentNumber, mockRouteQuery)
    const formaldatenItem = result[0]?.children?.[0]
    expect(formaldatenItem?.route.name).toBe(ROUTE_NAMES.ULI.DOCUMENT_UNIT.RUBRIKEN)
    expect(formaldatenItem?.route.params?.documentNumber).toBe(mockDocumentNumber)
    expect(formaldatenItem?.route.query).toEqual(mockRouteQuery)
    expect(formaldatenItem?.route.hash).toBe('#formaldaten')
  })

  it('handles empty routeQuery gracefully', () => {
    const result = getUliMenuItems(mockDocumentNumber, {})
    expect(result[0]?.route.query).toEqual({})
    expect(result[0]?.children?.[0]?.route.query).toEqual({})
  })
})
