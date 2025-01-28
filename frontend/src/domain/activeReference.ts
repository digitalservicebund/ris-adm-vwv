import NormReference from '@/domain/normReference.ts'
import type EditableListItem from '@/domain/editableListItem.ts'

export enum ActiveReferenceType {
  ANWENDUNG = 'anwendung',
  NEUREGELUNG = 'neuregelung',
  RECHTSGRUNDLAGE = 'rechtsgrundlage',
}

export enum ActiveReferenceDocumentType {
  NORM = 'norm',
  ADMINISTRATIVE_REGULATION = 'administrative_regulation',
}

export default class ActiveReference extends NormReference {
  /**
   * Reference document type is either NORM or ADMINISTRATIVE_REGULATION
   */
  public referenceDocumentType: ActiveReferenceDocumentType = ActiveReferenceDocumentType.NORM
  public referenceType?: ActiveReferenceType

  // static readonly fields = ['referenceDocumentType', 'referenceType', 'normAbbreviation', 'normAbbreviationRawValue'] as const
  static readonly activeReferenceTypeSummary: Record<ActiveReferenceType, string> = {
    [ActiveReferenceType.ANWENDUNG]: 'Anwendung',
    [ActiveReferenceType.NEUREGELUNG]: 'Neuregelung',
    [ActiveReferenceType.RECHTSGRUNDLAGE]: 'Rechtsgrundlage',
  } as const

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

  get renderSummary(): string {
    let result: string[]
    if (this.referenceType) {
      result = [`${ActiveReference.activeReferenceTypeSummary[this.referenceType]}`]
    } else {
      result = []
    }
    return [super.renderSummary].concat([...result]).join(', ')
  }
}
