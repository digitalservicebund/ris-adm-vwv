import type { Fundstelle } from '@/domain/fundstelle'
import { bundesanzeigerFixture } from './periodikum'

export const fundstelleFixture: Fundstelle = {
  id: 'fundstelleTestId',
  zitatstelle: '1973, 608',
  periodikum: bundesanzeigerFixture,
}
