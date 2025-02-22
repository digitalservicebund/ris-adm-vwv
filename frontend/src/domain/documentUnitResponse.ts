import type { DocumentUnit } from '@/domain/documentUnit.ts'
export default class DocumentUnitResponse {
  readonly id: string
  readonly documentNumber: string
  public documentUnit: DocumentUnit

  constructor(data: DocumentUnitResponse) {
    this.id = data.id
    this.documentNumber = data.documentNumber
    this.documentUnit = data.documentUnit
  }
}
