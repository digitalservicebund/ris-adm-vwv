import type DocumentationOffice from './documentationOffice'

export interface Court {
  readonly id: string
  type: string
  location?: string
  revoked?: string
  responsibleDocOffice?: DocumentationOffice
}
