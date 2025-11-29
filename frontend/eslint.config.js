import pluginVue from 'eslint-plugin-vue'
import vueTsEslintConfig from '@vue/eslint-config-typescript'
import pluginVitest from '@vitest/eslint-plugin'
import pluginPlaywright from 'eslint-plugin-playwright'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import testingLibraryPlugin from 'eslint-plugin-testing-library'
import jestDomPlugin from "eslint-plugin-jest-dom"

export default [
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },

  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**', '**/html/**', '**/frontend-e2e-test-report-html/**'],
  },

  ...pluginVue.configs['flat/essential'],
  ...vueTsEslintConfig(),

  {
    ...pluginVitest.configs.recommended,
    files: ['src/**/__tests__/*'],
  },

  {
    ...pluginPlaywright.configs['flat/recommended'],
    files: ['e2e/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    rules: {
      ...pluginPlaywright.configs["flat/recommended"].rules,
      "playwright/no-raw-locators": ["error"],
      "playwright/prefer-native-locators": ["error"]
    },
  },

  {
    files: ["src/components/**/*.spec.ts"],
    ...testingLibraryPlugin.configs["flat/vue"],
  },

  {
    files: ["src/views/**/*.vue"],
    rules: {
      "vue/multi-word-component-names": "off",
    },
  },

  {
    files: ["src/**/*.spec.ts"],
    ...jestDomPlugin.configs["flat/recommended"],
  },

  skipFormatting,
]
