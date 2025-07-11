import type { UseFetchReturn } from '@vueuse/core'
import { createFetch } from '@vueuse/core'
import { useAuthentication } from '@/services/auth.ts'

/**
 * The same as UseFetchReturn, but without the methods to get more specific useFetch instances.
 */
export type SimpleUseFetchReturn<T> = Omit<
  UseFetchReturn<T>,
  | 'get'
  | 'post'
  | 'put'
  | 'delete'
  | 'patch'
  | 'head'
  | 'options'
  | 'json'
  | 'text'
  | 'blob'
  | 'arrayBuffer'
  | 'formData'
>

/* -------------------------------------------------- *
 * Reactive API fetch                                 *
 * -------------------------------------------------- */

/** Fetch data from the backend api using useFetch. */
export const useApiFetch = createFetch({
  baseUrl: '/api',

  options: {
    async beforeFetch({ options, url, cancel }) {
      // useFetch requires the URL to always be there, but in some cases we
      // can't construct a meaningful URL (e.g. because a required param is
      // missing). For those cases we introduce INVALID_URL as a convention
      // to tell useFetch to cancel the request.
      if (url.endsWith(INVALID_URL)) {
        cancel()
        return
      }

      // Only set the Content-Type if the body is not FormData
      if (!(options.body instanceof FormData)) {
        options.headers = {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...options.headers,
        }
      } else {
        // Let the browser handle the Content-Type for FormData
        options.headers = {
          Accept: 'application/json',
          ...options.headers,
        }
      }

      // Authorize requests
      const { addAuthorizationHeader, tryRefresh } = useAuthentication()

      const hasValidSession = await tryRefresh()
      if (!hasValidSession) cancel()

      options.headers = addAuthorizationHeader(options.headers)

      return { options }
    },
  },
})

/**
 * Special string that can be used in places where you want to express that
 * a URL should not be fetched or used in any way, but you are still required
 * to provide a string value (e.g. when providing a computed URL to useFetch).
 * Example:
 *
 * ```ts
 * const url = computed(() => someCondition ? 'example.com' : INVALID_URL)
 * useFetch(url, {
 *   beforeFetch(ctx) {
 *     if (url === INVALID_URL) ctx.abort()
 *   }
 * })
 */
export const INVALID_URL = '__invalid_url__'
