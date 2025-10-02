import { test, expect } from '@playwright/test'

test.describe('Login flow', () => {
  test(
    'redirects to the original sub-URL after logging in',
    { tag: ['@RISDEV-8587'] },
    async ({ page }) => {
      const protectedUrl =
        'http://localhost:5173/verwaltungsvorschriften/documentUnit/KSNR999999999/fundstellen'

      await page.goto(protectedUrl)
      const loginFormLocator = page.getByLabel('Username or email')
      await expect(loginFormLocator).toBeVisible()

      const usernameInput = page.getByRole('textbox', { name: 'Username or email' })
      await expect(usernameInput).toBeVisible()

      await usernameInput.fill('test')
      await page.getByRole('textbox', { name: 'Password' }).fill('test')
      await page.getByRole('button', { name: 'Sign In' }).click()

      await expect(page).toHaveURL(new RegExp(protectedUrl))

      await expect(page.getByRole('heading', { name: 'Fundstellen' })).toBeVisible()
    },
  )

  test(
    'redirects to the 403 page when not allowed to access /literatur-unselbstaendig',
    { tag: ['@RISDEV-9370'] },
    async ({ page }) => {
      // when
      await page.goto('/literatur-unselbstaendig')
      const loginFormLocator = page.getByLabel('Username or email')
      await expect(loginFormLocator).toBeVisible()

      const usernameInput = page.getByRole('textbox', { name: 'Username or email' })
      await expect(usernameInput).toBeVisible()

      await usernameInput.fill('test')
      await page.getByRole('textbox', { name: 'Password' }).fill('test')
      await page.getByRole('button', { name: 'Sign In' }).click()

      // then
      await expect(page).toHaveURL('/forbidden')
      await expect(
        page.getByRole('heading', {
          name: 'Diese Dokumentationseinheit existiert nicht oder Sie haben keine Berechtigung',
        }),
      ).toBeVisible()
    },
  )

  test(
    'redirects to the 403 page when not allowed to access /verwaltungsvorschriften',
    { tag: ['@RISDEV-9370'] },
    async ({ page }) => {
      // when
      await page.goto('/verwaltungsvorschriften')
      const loginFormLocator = page.getByLabel('Username or email')
      await expect(loginFormLocator).toBeVisible()

      const usernameInput = page.getByRole('textbox', { name: 'Username or email' })
      await expect(usernameInput).toBeVisible()

      await usernameInput.fill('testbag')
      await page.getByRole('textbox', { name: 'Password' }).fill('test')
      await page.getByRole('button', { name: 'Sign In' }).click()

      // then
      await expect(page).toHaveURL('/forbidden')
      await expect(
        page.getByRole('heading', {
          name: 'Diese Dokumentationseinheit existiert nicht oder Sie haben keine Berechtigung',
        }),
      ).toBeVisible()
    },
  )

  test(
    'redirects to the login page when logging out',
    { tag: ['@RISDEV-9370'] },
    async ({ page }) => {
      // when
      await page.goto('/')
      const loginFormLocator = page.getByLabel('Username or email')
      await expect(loginFormLocator).toBeVisible()

      const usernameInput = page.getByRole('textbox', { name: 'Username or email' })
      await expect(usernameInput).toBeVisible()

      await usernameInput.fill('test')
      await page.getByRole('textbox', { name: 'Password' }).fill('test')
      await page.getByRole('button', { name: 'Sign In' }).click()

      await page.getByRole('button', { name: 'Log out' }).click()

      // then
      await expect(loginFormLocator).toBeVisible()
    },
  )
})
