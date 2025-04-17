import '@testing-library/jest-dom/vitest'
import { beforeAll } from 'vitest'
import PrimeVue from 'primevue/config'
import { config } from '@vue/test-utils'

beforeAll(() => {
  config.global.plugins = [PrimeVue]
})
