import { describe, it, expect } from 'vitest'
import {
  areDatesValid,
  getFutureDateErrMessage,
  getInvalidDateErrMessage,
  missingDocUnitFields,
} from './validators'
import dayjs from 'dayjs'
import type { DocumentUnit } from '@/domain/documentUnit'

describe('Validators functions', () => {
  describe('areDatesValid', () => {
    it('should return true for an array of valid dates', () => {
      const validDates = ['01.01.2023', '31.12.2023', '15.06.2023']
      expect(areDatesValid(validDates)).toBe(true)
    })

    it('should return false for an array containing invalid dates', () => {
      const invalidDates = ['01.01.2023', '31-12-2023', '15.06.2023']
      expect(areDatesValid(invalidDates)).toBe(false)
    })

    it('should return true for an empty array', () => {
      expect(areDatesValid([])).toBe(true)
    })
  })

  describe('getInvalidDateMessage', () => {
    it('should return an error message for an array containing invalid dates', () => {
      const datesWithInvalid = ['01.01.2023', '31-12-2023', '15.06.2023']
      const expectedMessage = 'Kein valides Datum: 31-12-2023'
      expect(getInvalidDateErrMessage(datesWithInvalid)).toBe(expectedMessage)
    })

    it('should return an empty string for an array of valid dates', () => {
      const validDates = ['01.01.2023', '31.12.2023', '15.06.2023']
      expect(getInvalidDateErrMessage(validDates)).toBe('')
    })

    it('should return an empty string for an empty array', () => {
      expect(getInvalidDateErrMessage([])).toBe('')
    })
  })

  describe('getFutureDateErrMessage', () => {
    it('should return an error message for an array containing future dates', () => {
      const futureDate = dayjs().add(1, 'day').format('DD.MM.YYYY')
      const dates = ['01.01.1970', futureDate]

      const expectedMessage = `Das Datum darf nicht in der Zukunft liegen: ${futureDate}`
      expect(getFutureDateErrMessage(dates)).toBe(expectedMessage)
    })

    it('should return an empty string for an array of past dates', () => {
      const today = dayjs()
      const pastDate1 = today.subtract(1, 'day').format('DD.MM.YYYY')
      const pastDate2 = today.subtract(2, 'day').format('DD.MM.YYYY')
      const dates = [pastDate1, pastDate2]

      expect(getFutureDateErrMessage(dates)).toBe('')
    })

    it('should return an empty string for an empty array', () => {
      expect(getFutureDateErrMessage([])).toBe('')
    })

    it('should return an error message for an array with mixed past and future dates', () => {
      const today = dayjs()
      const pastDate = today.subtract(1, 'day').format('DD.MM.YYYY')
      const futureDate1 = today.add(1, 'day').format('DD.MM.YYYY')
      const futureDate2 = today.add(2, 'day').format('DD.MM.YYYY')
      const dates = [pastDate, futureDate1, futureDate2]

      const expectedMessage = `Das Datum darf nicht in der Zukunft liegen: ${futureDate1}, ${futureDate2}`
      expect(getFutureDateErrMessage(dates)).toBe(expectedMessage)
    })
  })

  describe('validateDocumentUnit', () => {
    it('should return a list of missing fields', () => {
      const doc: DocumentUnit = {
        id: 'docId1',
        documentNumber: 'KSNR999999999',
        note: '',
        langueberschrift: 'this is a langueberschrift',
        inkrafttretedatum: '',
        zitierdaten: [],
      }

      const actual = missingDocUnitFields(doc)
      const expected = ['inkrafttretedatum', 'dokumenttyp', 'zitierdaten', 'normgeberList']

      expect(expected.sort()).toEqual(actual.sort())
    })
  })
})
