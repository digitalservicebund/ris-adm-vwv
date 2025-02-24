import { test, expect } from '@playwright/test'

test.describe('RubrikenPage - Schlagwörter', () => {
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

  test(
    'Filling in Schlagwörter',
    { tag: ['@RISDEV-6047'] },
    async ({ page }) => {
      await page.route('/api/documentation-units/KSNR054920707', async (route) => {
        const json = {
          documentNumber: 'KSNR054920707',
          id: '8de5e4a0-6b67-4d65-98db-efe877a260c4',
          json: null,
        }
        await route.fulfill({ json })
      })
      await page.goto('/documentUnit/KSNR054920707/fundstellen')
      await page.getByText('Rubriken').click()
      await expect(page.getByText('Rubriken')).toHaveCount(1)

      const schlagwoerterHeadingElement = page.getByText('Schlagwörter')
      await expect(schlagwoerterHeadingElement).toHaveCount(2) // two headings

      // enter single schlagwort, assert that it's visible after confirming
      const schlagwoerterListEditElement = page.getByTestId('Schlagwörter_ListInputEdit')
      await schlagwoerterListEditElement.click()
      await schlagwoerterListEditElement.fill('Schlagwort 1')
      const schlagwoerterUebernehmenElement = page.getByText('Übernehmen').first()
      await schlagwoerterUebernehmenElement.click()
      await expect(page.getByText('Schlagwort 1')).toHaveCount(1)

      // add another schlagwort, assert both are visible
      const schlagwoerterBearbeitenElement = page.getByText('Schlagwörter bearbeiten')
      await schlagwoerterBearbeitenElement.click()

      await schlagwoerterListEditElement.click()
      await schlagwoerterListEditElement.press('End')
      await schlagwoerterListEditElement.press('Enter')
      await schlagwoerterListEditElement.pressSequentially('Schlagwort 2')
      await schlagwoerterListEditElement.press('Enter')
      await schlagwoerterUebernehmenElement.click()
      await expect(page.getByText('Schlagwort 1')).toHaveCount(1)
      await expect(page.getByText('Schlagwort 2')).toHaveCount(1)

      // add one more, but click "abbrechen" instead of confirming, assert that the new element doe not get added
      await schlagwoerterBearbeitenElement.click()
      await schlagwoerterListEditElement.click()
      await schlagwoerterListEditElement.press('End')
      await schlagwoerterListEditElement.press('Enter')
      await schlagwoerterListEditElement.pressSequentially('This should not be added')
      await schlagwoerterListEditElement.press('Enter')
      const abbrechenElement = page
        .getByTestId('keywords')
        .getByRole('button', { name: 'Abbrechen' })
      await abbrechenElement.click()
      await expect(page.getByText('Schlagwort 1')).toHaveCount(1)
      await expect(page.getByText('Schlagwort 2')).toHaveCount(1)
      await expect(page.getByText('This should not be added')).toHaveCount(0)

      // add another one, have the list sorted
      await schlagwoerterBearbeitenElement.click()
      await schlagwoerterListEditElement.click()
      await schlagwoerterListEditElement.press('End')
      await schlagwoerterListEditElement.press('Enter')
      await schlagwoerterListEditElement.pressSequentially('A schlagwort starting with an "A"')
      await schlagwoerterListEditElement.press('Enter')
      const sortAlphabeticallyCheckboxElement = page.getByRole('checkbox', {
        name: 'Alphabetisch sortieren',
      })
      await sortAlphabeticallyCheckboxElement.check()
      await schlagwoerterUebernehmenElement.click()
      // new element is available
      await expect(page.getByText('Schlagwort 1')).toHaveCount(1)
      await expect(page.getByText('Schlagwort 2')).toHaveCount(1)
      await expect(page.getByText('A schlagwort starting with an "A"')).toHaveCount(1)
      // new element is sorted first in list
      await expect(page.getByText('A schlagwort starting with an "A"Schlagwort 1')).toHaveCount(1)
    },
  )
})
