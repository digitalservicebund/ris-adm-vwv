export const ROUTE_NAMES = {
  ROOT_REDIRECT: 'RootRedirect',
  FORBIDDEN: 'Forbidden',
  NOT_FOUND: 'Error 404 not found',

  // VWV (Verwaltungsvorschriften)
  VWV: {
    START_PAGE: 'vwv-start-page',
    DOCUMENT_UNIT: {
      NEW: 'vwv-documentUnit-new',
      EDIT: 'vwv-documentUnit-documentNumber',
      FUNDSTELLEN: 'vwv-documentUnit-documentNumber-fundstellen',
      RUBRIKEN: 'vwv-documentUnit-documentNumber-rubriken',
      ABGABE: 'vwv-documentUnit-documentNumber-abgabe',
    },
  },

  // ULI (Unselbstständige Literatur)
  ULI: {
    START_PAGE: 'uli-start-page',
    DOCUMENT_UNIT: {
      NEW: 'uli-documentUnit-new',
      EDIT: 'uli-documentUnit-documentNumber',
      RUBRIKEN: 'uli-documentUnit-documentNumber-rubriken',
    },
  },
} as const

export const ROUTE_PATHS = {
  ROOT: '/',
  FORBIDDEN: '/forbidden',
  VWV: {
    BASE: '/verwaltungsvorschriften',
    DOCUMENT_UNIT: {
      NEW: 'documentUnit/new',
      EDIT: 'documentUnit/:documentNumber',
      FUNDSTELLEN: 'fundstellen',
      RUBRIKEN: 'rubriken',
      ABGABE: 'abgabe',
    },
  },
  ULI: {
    BASE: '/literatur-unselbstaendig',
    DOCUMENT_UNIT: {
      NEW: 'documentUnit/new',
      EDIT: 'documentUnit/:documentNumber',
      RUBRIKEN: 'rubriken',
    },
  },
} as const
