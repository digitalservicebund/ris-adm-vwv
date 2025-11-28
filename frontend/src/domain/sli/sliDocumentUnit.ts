import type { DocumentType } from '@/domain/documentType'
import type { Page } from '@/domain/pagination'

export interface SliDocumentationUnit {
  readonly id: string
  readonly documentNumber: string
  veroeffentlichungsjahr?: string
  dokumenttypen?: DocumentType[]
  hauptsachtitel?: string
  dokumentarischerTitel?: string
  hauptsachtitelZusatz?: string
  note: string
}

export interface SliDocumentUnitResponse {
  id: string
  documentNumber: string
  json: SliDocumentationUnit
}

export interface SliDocUnitListItem {
  readonly id: string
  readonly documentNumber: string
  veroeffentlichungsjahr?: string
  dokumenttypen?: DocumentType[]
  hauptsachtitel?: string
  dokumentarischerTitel?: string
}

export interface PaginatedSliDocUnitListResponse {
  documentationUnitsOverview: SliDocUnitListItem[]
  page: Page
}

export interface SliDocUnitSearchParams {
  veroeffentlichungsjahr?: string
  titel?: string
  dokumenttypen?: string[]
  verfasser?: string[]
}
