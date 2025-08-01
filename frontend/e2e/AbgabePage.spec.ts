import { test, expect } from '@playwright/test'

test.skip(
  'Visiting the Abgabe step of creating a documentUnit which displays a Button to end the process and leads to the StartPage',
  { tag: ['@RISDEV-6048'] },
  async ({ page }) => {
    await page.route('/api/documentation-units/KSNR054920707', async (route) => {
      const json = {
        documentNumber: 'KSNR054920707',
        id: '8de5e4a0-6b67-4d65-98db-efe877a260c4',
        json: null,
      }
      await route.fulfill({ json })
    })
    await page.goto('/documentUnit/KSNR054920707/abgabe')
    await expect(page.getByText('Abgabe')).toHaveCount(2)
    await expect(page.getByText('Zur Veröffentlichung freigeben')).toHaveCount(1)
    await page.getByText('Zur Veröffentlichung freigeben').click()
    await expect(page).toHaveURL('') // Check if the user is redirected to the StartPage
  },
)
