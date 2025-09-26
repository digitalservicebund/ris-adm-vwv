import NormReference from '@/domain/normReference.ts'
import type EditableListItem from '@/domain/editableListItem.ts'

export enum ReferenceTypeEnum {
  ANWENDUNG = 'anwendung',
  NEUREGELUNG = 'neuregelung',
  RECHTSGRUNDLAGE = 'rechtsgrundlage',
}

export enum ActiveReferenceDocumentType {
  NORM = 'norm',
  ADMINISTRATIVE_REGULATION = 'administrative_regulation',
}

export const referenceTypeToLabel = {
  [ReferenceTypeEnum.ANWENDUNG]: 'Anwendung',
  [ReferenceTypeEnum.NEUREGELUNG]: 'Neuregelung',
  [ReferenceTypeEnum.RECHTSGRUNDLAGE]: 'Rechtsgrundlage',
}

export default class ActiveReference extends NormReference {
  /**
   * Reference document type is either NORM or ADMINISTRATIVE_REGULATION
   */
  public referenceDocumentType: ActiveReferenceDocumentType = ActiveReferenceDocumentType.NORM
  public referenceType?: ReferenceTypeEnum

  constructor(data: Partial<ActiveReference> = {}) {
    super(data)
    Object.assign(this, data)
  }

  equals(entry: EditableListItem): boolean {
    const activeReferenceEntry = entry as ActiveReference
    if (activeReferenceEntry.isEmpty) return true

    return (
      super.equals(entry as NormReference) &&
      activeReferenceEntry.referenceDocumentType == this.referenceDocumentType
    )
  }

  get renderReferenceType(): string {
    if (this.referenceType) {
      return referenceTypeToLabel[this.referenceType] ?? ''
    }
    return ''
  }
}
