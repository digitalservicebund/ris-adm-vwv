import { test, expect } from '@playwright/test'

test.describe('AbgabePage', () => {
  test(
    'A document is publishable when its mandatory fields are non empty',
    { tag: ['@RISDEV-8436'] },
    async ({ page }) => {
      // given
      await page.goto('/documentUnit/KSNR999999999')

      // when
      await page.getByText('Abgabe').click()

      // then
      await expect(page.getByRole('heading', { name: 'Abgabe' })).toBeVisible()
      await expect(page.getByText('Plausibilitätsprüfung')).toBeVisible()
      await expect(page.getByText('Alle Pflichtfelder sind korrekt ausgefüllt.')).toBeVisible()
      await expect(
        page.getByRole('button', { name: 'Zur Veröffentlichung freigeben' }),
      ).toBeEnabled()
    },
  )

  test(
    `A document is not publishable when at least one of its mandatory fields is empty, 
    shows the required fields and a link to the rubriken page`,
    { tag: ['@RISDEV-8436'] },
    async ({ page }) => {
      // given
      await page.goto('/documentUnit/KSNR999999999/rubriken')
      await expect(page.getByText('Amtl. Langüberschrift *')).toHaveCount(1)
      await page.getByText('Amtl. Langüberschrift *').fill('')
      await expect(page.getByRole('button', { name: 'Speichern' })).toBeVisible()

      // when
      await page.getByText('Abgabe').click()

      // then
      await expect(page.getByRole('button', { name: 'Speichern' })).toBeHidden()
      await expect(page.getByRole('heading', { name: 'Abgabe' })).toBeVisible()
      await expect(page.getByText('Plausibilitätsprüfung')).toBeVisible()
      await expect(page.getByText('Folgende Pflichtfelder sind nicht befüllt')).toBeVisible()
      await expect(page.getByText('Amtl. Langüberschrift')).toBeVisible()
      await expect(page.getByRole('button', { name: 'Rubriken bearbeiten' })).toBeVisible()
      await expect(
        page.getByRole('button', { name: 'Zur Veröffentlichung freigeben' }),
      ).toBeDisabled()

      // when
      await page.getByRole('button', { name: 'Rubriken bearbeiten' }).click()

      // then
      await expect(page.getByRole('heading', { name: 'Formaldaten' })).toBeVisible()
    },
  )
})
