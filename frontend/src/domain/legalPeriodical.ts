export default class LegalPeriodical {
  uuid?: string
  title?: string
  subtitle?: string
  abbreviation?: string
  primaryReference?: boolean
  citationStyle?: string

  constructor(data: Partial<LegalPeriodical> = {}) {
    Object.assign(this, data)
  }
}

export interface LegalPeriodicalInterface {
  readonly id: string
  title: string
  subtitle?: string
  abbreviation: string
  primaryReference?: boolean
  citationStyle?: string
}
