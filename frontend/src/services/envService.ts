import type { Env } from '@/types/env'

/**
 * Fetches configuration for the current environment. This function uses the
 * shared `useApiFetch` instance to reuse authentication and other logic, but
 * is not reactive. It's intended to be called once when the application
 * initializes.
 *
 * @returns Configuration for the current environment
 */
export async function getEnv(): Promise<Env> {
  const response = await fetch('/environment')

  if (!response.ok) {
    throw new Error(`Failed to load configuration: ${response.statusText}`)
  }

  return response.json()
}
