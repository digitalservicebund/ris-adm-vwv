import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
dayjs.extend(customParseFormat)

/**
 * Parses an ISO date (YYYY-MM-DD) and returns it in local format (DD.MM.YYYY)
 * Returns `null` if the input is invalid
 */
export function parseIsoDateToLocal(isoDate: string): string | null {
  const date = dayjs(isoDate, 'YYYY-MM-DD', true)
  if (!date.isValid()) {
    return null
  }
  return date.format('DD.MM.YYYY')
}

/**
 * Parses a local date (DD.MM.YYYY) to an ISO format (YYYY-MM-DD)
 * Returns `null` if the input is invalid
 */
export function parseLocalDateToIso(localDate: string): string | null {
  const date = dayjs(localDate, 'DD.MM.YYYY', true)
  if (!date.isValid()) {
    return null
  }
  return date.format('YYYY-MM-DD')
}
