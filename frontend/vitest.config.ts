import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/**'],
      globals: true,
      setupFiles: ['./vitest-setup.ts'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      pool: 'threads',
      reporters: ['json', 'verbose', 'html'],
      outputFile: {
        json: './frontend-unit-test-report.json',
      },
      coverage: {
        provider: 'istanbul',
        reporter: ['lcov', 'text', 'html'],
        // Changes to this also need to be reflected in the sonar-project.properties
        exclude: [
          // Configuration and generated outputs
          '**/[.]**',
          'coverage/**/*',
          'dist/**/*',
          '**/.*rc.{?(c|m)js,yml}',
          '*.config.{js,ts}',

          // Types
          '**/*.d.ts',
          'src/components/input/types.ts',

         // This file only contains styles and can't meaninfully be tested
         "src/lib/theme.ts",

          // Assets
          'html/assets/*',

          // Tests
          '**/*.spec.ts',
          'e2e/**/*',

          // App content we're not interested in covering with unit tests. If you
          // add something here, please also add a comment explaining why the
          // exclusion is necessary.

          // Views are too complex too set up and mock in unit tests, we're covering
          // those with E2E test instead. (App is also a view)
          'src/**/*.view.vue',
          'src/App.vue',

          // If necessary to use e.g. guards, we'll have a router-guards file that
          // then should be tested
          'src/router.ts',

          // Just the init file, nothing much to test here.
          'src/main.ts',

          // Stories are just for internal development use and don't need to be
          // tested
          'src/**/*.story.vue',
        ],
      },
    },
  }),
)
