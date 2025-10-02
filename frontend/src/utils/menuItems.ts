import { ROUTE_NAMES } from '@/constants/routes'
import type MenuItem from '@/domain/menuItem'
import type { LocationQuery } from 'vue-router'

export function getAdmVwvMenuItems(
  documentNumber: string | undefined,
  routeQuery: LocationQuery,
): MenuItem[] {
  if (!documentNumber) {
    console.warn('documentNumber is required to generate menu items.')
    return []
  }

  const baseRoute = {
    params: { documentNumber },
    query: routeQuery,
  }

  return [
    {
      label: 'Fundstellen',
      route: {
        ...baseRoute,
        name: ROUTE_NAMES.VWV.DOCUMENT_UNIT.FUNDSTELLEN,
      },
    },
    {
      label: 'Rubriken',
      route: {
        name: ROUTE_NAMES.VWV.DOCUMENT_UNIT.RUBRIKEN,
        ...baseRoute,
      },
      children: [
        {
          label: 'Formaldaten',
          route: {
            ...baseRoute,
            name: ROUTE_NAMES.VWV.DOCUMENT_UNIT.RUBRIKEN,
            hash: '#formaldaten',
          },
        },
        {
          label: 'Gliederung',
          route: {
            ...baseRoute,
            name: ROUTE_NAMES.VWV.DOCUMENT_UNIT.RUBRIKEN,
            hash: '#gliederung',
          },
        },
        {
          label: 'Inhaltliche Erschließung',
          route: {
            ...baseRoute,
            name: ROUTE_NAMES.VWV.DOCUMENT_UNIT.RUBRIKEN,
            hash: '#inhaltlicheErschliessung',
          },
        },
        {
          label: 'Kurzreferat',
          route: {
            ...baseRoute,
            name: ROUTE_NAMES.VWV.DOCUMENT_UNIT.RUBRIKEN,
            hash: '#kurzreferat',
          },
        },
      ],
    },
    {
      label: 'Abgabe',
      route: {
        ...baseRoute,
        name: ROUTE_NAMES.VWV.DOCUMENT_UNIT.ABGABE,
      },
    },
  ]
}

export function getUliMenuItems(
  documentNumber: string | undefined,
  routeQuery: LocationQuery,
): MenuItem[] {
  if (!documentNumber) {
    console.warn('documentNumber is required to generate menu items.')
    return []
  }

  const baseRoute = {
    params: { documentNumber },
    query: routeQuery,
  }

  return [
    {
      label: 'Rubriken',
      route: {
        name: ROUTE_NAMES.ULI.DOCUMENT_UNIT.RUBRIKEN,
        ...baseRoute,
      },
      children: [
        {
          label: 'Formaldaten',
          route: {
            ...baseRoute,
            name: ROUTE_NAMES.ULI.DOCUMENT_UNIT.RUBRIKEN,
            hash: '#formaldaten',
          },
        },
      ],
    },
  ]
}
