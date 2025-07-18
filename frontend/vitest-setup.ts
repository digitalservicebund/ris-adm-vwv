import '@testing-library/jest-dom/vitest'
import { beforeAll, vi } from 'vitest'
import PrimeVue from 'primevue/config'
import { config } from '@vue/test-utils'

vi.mock("@/services/auth", () => {
  return {
    useAuthentication: () => ({
      addAuthorizationHeader: (init: HeadersInit) => ({ ...init }),
      tryRefresh: vi.fn().mockReturnValue(true),
      getUsername: () => 'test test',
    }),
  }
})

beforeAll(() => {
  config.global.plugins = [PrimeVue]
})
