import { expect, test } from '@playwright/test'

test.describe('Rubriken page: Langüberschrift', () => {
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
