import { test as setup, expect, Page } from '@playwright/test'

const vwvAuthFile = './frontend/e2e/.auth/vwv.json'
const uliAuthFile = './frontend/e2e/.auth/uli.json'
const baseURL = 'http://localhost:5173'

async function performLogin(page: Page, username: string, password: string) {
  await page.goto(baseURL)

  const loginFormLocator = page.getByLabel('Username or email')
  const mainPageLocator = page.getByText('Neue Dokumentationseinheit')

  await expect(mainPageLocator.or(loginFormLocator)).toBeVisible()

  if (await loginFormLocator.isVisible()) {
    console.log('Login form detected. Performing UI login...')
    await page.getByRole('textbox', { name: 'Username or email' }).fill(username)
    await page.getByRole('textbox', { name: 'Password' }).fill(password)
    await page.getByRole('button', { name: 'Sign In' }).click()
  } else {
    console.log('Already logged in. Skipping UI login.')
  }

  await expect(mainPageLocator).toBeVisible()
}

// Setup for vwv user
setup('authenticate as vwv user', async ({ page }) => {
  console.log('--- Starting Setup: Authentication vwv user ---')
  await performLogin(page, 'test', 'test')
  await page.context().storageState({ path: vwvAuthFile })
  console.log('--- Authentication successful. State saved. ---')
})

// Setup for uli user
setup('authenticate as uli user', async ({ page }) => {
  console.log('--- Starting Setup: Authentication uli user ---')
  await performLogin(page, 'testbag', 'test')
  await page.context().storageState({ path: uliAuthFile })
  console.log('--- Authentication successful. State saved. ---')
})
