import { test, expect } from '@playwright/test'

test.describe('Verweise: Verwaltungsvorschrift und Norm', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('/api/documentation-units/KSNR054920707', async (route) => {
      const json = {
        documentNumber: 'KSNR054920707',
        id: '8de5e4a0-6b67-4d65-98db-efe877a260c4',
        json: null,
      }
      await route.fulfill({ json })
    })
  })

  test('Do not show the button "Weitere Einzelnorm", do not show the "x" for removal if "Verwaltungsvorschrift" is selected', async ({
    page,
  }) => {
    // given
    await page.goto('/documentUnit/KSNR054920707/rubriken')
    await page.getByRole('radio', { name: 'Verwaltungsvorschrift auswä' }).click()
    await page
      .getByTestId('activeReferences')
      .getByRole('combobox', { name: 'Art der Verweisung' })
      .click()
    await page.getByRole('option', { name: 'Anwendung' }).click()
    await page
      .getByTestId('activeReferences')
      .getByRole('combobox', { name: 'RIS-Abkürzung' })
      .click()
    await page.getByRole('option', { name: 'SGB 5' }).click()
    await page.getByRole('textbox', { name: 'Fassungsdatum der Norm' }).click()
    await page.getByRole('textbox', { name: 'Fassungsdatum der Norm' }).fill('12.12.2024')
    // then
    await expect(page.getByRole('button', { name: 'Weitere Einzelnorm' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Einzelnorm löschen' })).toHaveCount(0)
  })

  test('Do show the button "Weitere Einzelnorm" and the "x" for deletion if "Norm" is selected', async ({
    page,
  }) => {
    // given
    await page.goto('/documentUnit/KSNR054920707/rubriken')
    await page
      .getByTestId('activeReferences')
      .getByRole('combobox', { name: 'Art der Verweisung' })
      .click()
    await page.getByRole('option', { name: 'Anwendung' }).click()
    await page
      .getByTestId('activeReferences')
      .getByRole('combobox', { name: 'RIS-Abkürzung' })
      .click()
    await page.getByRole('option', { name: 'SGB 5' }).click()
    await page.getByRole('textbox', { name: 'Fassungsdatum der Norm' }).click()
    await page.getByRole('textbox', { name: 'Fassungsdatum der Norm' }).fill('12.12.2024')
    // then
    await expect(page.getByRole('button', { name: 'Weitere Einzelnorm' })).toHaveCount(1)
    await expect(page.getByRole('button', { name: 'Einzelnorm löschen' })).toHaveCount(1)
  })
})
