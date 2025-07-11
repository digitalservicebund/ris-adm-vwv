import { test as setup, expect, Page } from '@playwright/test'

const authFile = './e2e/storageState.json'
const baseURL = 'http://localhost:5173'

async function performLogin(page: Page) {
  await page.goto(baseURL)

  const loginFormLocator = page.getByLabel('Username or email')
  const mainPageLocator = page.getByText('Neue Dokumentationseinheit')

  await expect(mainPageLocator.or(loginFormLocator)).toBeVisible()

  if (await loginFormLocator.isVisible()) {
    console.log('Login form detected. Performing UI login...')
    await page.getByRole('textbox', { name: 'Username or email' }).fill('test')
    await page.getByRole('textbox', { name: 'Password' }).fill('test')
    await page.getByRole('button', { name: 'Sign In' }).click()
  } else {
    console.log('Already logged in. Skipping UI login.')
  }

  await expect(mainPageLocator).toBeVisible()
}

setup('authenticate', async ({ page }) => {
  console.log('--- Starting Setup: Authentication ---')
  await performLogin(page)
  await page.context().storageState({ path: authFile })
  console.log('--- Authentication successful. State saved. ---')
})
