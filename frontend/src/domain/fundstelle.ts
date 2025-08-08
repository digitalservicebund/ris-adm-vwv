export interface Periodikum {
  readonly id: string
  title: string
  subtitle?: string
  abbreviation?: string
  citationStyle?: string
}

export interface Fundstelle {
  readonly id: string
  zitatstelle: string
  periodikum: Periodikum
}
