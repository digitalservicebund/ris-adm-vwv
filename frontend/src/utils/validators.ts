import { requiredDocumentUnitFields, type DocumentUnit } from '@/domain/documentUnit'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
dayjs.extend(customParseFormat)

// Checks if all provided date strings are valid according to the 'DD.MM.YYYY' format
export function areDatesValid(dates: string[]): boolean {
  return dates.every((d) => dayjs(d, 'DD.MM.YYYY', true).isValid())
}

// Returns an error message listing any invalid dates in the array
export function getInvalidDateErrMessage(dates: string[]): string {
  const invalidDates = dates.filter((d) => !dayjs(d, 'DD.MM.YYYY', true).isValid())
  return invalidDates.length > 0 ? `Kein valides Datum: ${invalidDates.join(', ')}` : ''
}

// Returns an error message listing any future dates in the array
export function getFutureDateErrMessage(dates: string[]): string {
  const futureDates = dates.filter((d) => dayjs(d, 'DD.MM.YYYY', true).isAfter(dayjs()))
  return futureDates.length > 0
    ? `Das Datum darf nicht in der Zukunft liegen: ${futureDates.join(', ')}`
    : ''
}

// Returns a list of missing required fields
export function missingDocUnitFields(doc: DocumentUnit): string[] {
  return requiredDocumentUnitFields.filter((field) => {
    const value = doc[field]
    return !value || (Array.isArray(value) && value.length === 0)
  })
}
