## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Run Unit Tests with [Vitest](https://vitest.dev/) and watch it

```sh
npm run test:watch
```

### Run Unit Test and check coverage with [Vitest](https://vitest.dev/)

```sh
npm run test:coverage
```

### Run End-to-End Tests with [Playwright](https://playwright.dev)

```sh
# Install browsers for the first run
npx playwright install

# Not required locally, but when testing on CI we must build the project first
npm run build

# Runs the end-to-end tests
npm run test:e2e
# Runs the tests only on Chromium
npm run test:e2e -- --project=chromium
# Runs the tests of a specific file
npm run test:e2e -- e2e/AbgabePage.spec.ts
# Runs the tests in debug mode
npm run test:e2e -- --debug
# Runs the tests only on Chromium and for a specific file and in debug mode
npm run test:e2e -- e2e/AbgabePage.spec.ts --debug --project=chromium
# Run tests in interactive UI mode.
npm run test:e2e -- --ui
# Run tests in headed browsers
npm run test:e2e -- --headed
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

### Format with [Prettier](https://prettier.io)

```sh
npm run format
```
