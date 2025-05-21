import { expect, test } from '@playwright/test'

test.describe('Rubriken page - Langüberschrift', () => {
  test(
    'Data of Langüberschrift persists during reload when saved',
    { tag: ['@RISDEV-6213'] },
    async ({ page }) => {
      // given
      const myLangueberschrift = 'my persisting Langüberschrift'
      await page.goto('/')
      await page.getByText('Neue Dokumentationseinheit').click()
      await page.waitForURL(/documentUnit/)
      await page.getByText('Rubriken').click()
      await expect(page.getByText('Amtl. Langüberschrift')).toHaveCount(1)
      await page.getByText('Amtl. Langüberschrift').fill(myLangueberschrift)
      await expect(page.getByText('Amtl. Langüberschrift')).toHaveValue(myLangueberschrift)
      // when
      await page.getByText('Speichern').click()
      await page.reload()
      // then
      await expect(page.getByText('Amtl. Langüberschrift')).toHaveValue(myLangueberschrift)
    },
  )
})

test.describe('RubrikenPage - Langüberschrift - Bestandsdaten', () => {
  test(
    'Load test documentation unit and expect Langüberschrift content',
    { tag: ['@RISDEV-7639'] },
    async ({ page }) => {
      // given

      // when
      await page.goto('/documentUnit/KSNR999999999/rubriken')

      // then
      await expect(page.getByRole('textbox', { name: 'Amtl. Langüberschrift *' })).toHaveValue(
        '1. Bekanntmachung zum XML-Testen in NeuRIS VwV',
      )
    },
  )
})
