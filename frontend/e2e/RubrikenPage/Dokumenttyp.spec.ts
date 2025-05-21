import { test, expect } from '@playwright/test'

test.describe('RubrikenPage - Dokumenttyp', () => {
  test(
    'Dokumenttyp: Can be filtered, entered and persists through a reload',
    { tag: ['@RISDEV-6299', '@RISDEV-6314'] },
    async ({ page }) => {
      // given
      await page.goto('/')
      await page.getByText('Neue Dokumentationseinheit').click()
      await page.waitForURL(/documentUnit/)
      await page.getByText('Rubriken').click()

      // when
      const dokumenttypElement = page.getByText('Dokumenttyp *')
      await dokumenttypElement.click()
      await dokumenttypElement.fill('VV')
      await page.getByText('VV').click()
      await page.getByRole('button', { name: 'Speichern', exact: true }).click()
      await page.reload()

      // then
      await expect(dokumenttypElement).toHaveValue('Verwaltungsvorschrift')
    },
  )

  test(
    'Dokumenttyp: Can be filtered by VV, entered and persists, removed and persists',
    { tag: ['@RISDEV-6314'] },
    async ({ page }) => {
      // given
      await page.goto('/')
      await page.getByText('Neue Dokumentationseinheit').click()
      await page.waitForURL(/documentUnit/)
      await page.getByText('Rubriken').click()

      // when
      const dokumenttypElement = page.getByText('Dokumenttyp *')
      await dokumenttypElement.click()
      await dokumenttypElement.fill('VV')
      await page.getByText('VV').click()
      await page.getByRole('button', { name: 'Speichern', exact: true }).click()
      await page.reload()
      await page.getByRole('button', { name: 'Auswahl zurücksetzen', exact: true }).click()
      await page.getByRole('button', { name: 'Speichern', exact: true }).click()
      await page.reload()

      // then
      const dokumentTypTextbox = page.getByRole('textbox', { name: 'Dokumenttyp', exact: true })
      await expect(dokumentTypTextbox.getByText('Verwaltungsvorschrift')).toHaveCount(0)
    },
  )
})

test.describe('RubrikenPage - Dokumenttyp - Bestandsdaten', () => {
  test(
    'Load test documentation unit and expect one Dokumenttyp and Dokumenttyp Zusatz',
    { tag: ['@RISDEV-7639'] },
    async ({ page }) => {
      // given

      // when
      await page.goto('/documentUnit/KSNR999999999/rubriken')

      // then
      await expect(page.getByText('Dokumenttyp *')).toHaveValue('Verwaltungsregelung')
      await expect(page.getByText('Dokumenttyp Zusatz *')).toHaveValue('Bekanntmachung')
    },
  )
})
