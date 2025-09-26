import { test, expect } from '@playwright/test'

test.describe('StartPage ULI', () => {
  test(
    'shows the title "Unselbstständige Literatur", the user data, a logout and a "create document" buttons',
    { tag: ['@RISDEV-9370'] },
    async ({ page }) => {
      // Action
      await page.goto('/literatur-unselbstaendig')

      // Assert
      await expect(page.getByText('Rechtsinformationen')).toBeVisible()
      await expect(page.getByText('des Bundes')).toBeVisible()
      // user icon
      await expect(page.getByTestId('iconPermIdentity')).toHaveCount(1)
      await expect(page.getByText('bag nachname')).toBeVisible()
      await expect(page.getByText('adm_lit_bag_user')).toHaveCount(1)
      await expect(page.getByText('Übersicht Unselbstständige Literatur')).toHaveCount(1)
      await expect(page.getByRole('button', { name: 'Neue Dokumentationseinheit' })).toHaveCount(1)
      await expect(page.getByRole('button', { name: 'Log out' })).toHaveCount(1)
    },
  )
})
