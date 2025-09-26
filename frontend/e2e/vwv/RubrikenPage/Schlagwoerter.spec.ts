import { expect, test } from '@playwright/test'

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

  test('Filling in Schlagwörter', { tag: ['@RISDEV-6047', '@RISDEV-8426'] }, async ({ page }) => {
    await page.goto('/documentUnit/KSNR054920707/fundstellen')
    await page.getByRole('link', { name: 'Rubriken' }).click()
    await expect(page.getByRole('link', { name: 'Rubriken' })).toHaveCount(1)

    await expect(page.getByRole('heading', { name: 'Schlagwörter' })).toHaveCount(1)

    // enter single schlagwort, assert that it's visible after confirming
    await page.getByRole('button', { name: 'Schlagwörter hinzufügen' }).click()
    const schlagwoerterListEditElement = page.getByTestId('Schlagwörter_ListInputEdit')
    await schlagwoerterListEditElement.click()
    await schlagwoerterListEditElement.fill('Schlagwort 1')
    const schlagwoerterUebernehmenElement = page.getByRole('button', {
      name: 'Schlagwörter übernehmen',
    })
    await schlagwoerterUebernehmenElement.click()
    await expect(page.getByText('Schlagwort 1')).toHaveCount(1)

    // double entries are filtered out
    await page.getByRole('button', { name: 'Schlagwörter bearbeiten' }).click()
    await schlagwoerterListEditElement.click()
    await schlagwoerterListEditElement.press('End')
    await schlagwoerterListEditElement.press('Enter')
    await schlagwoerterListEditElement.pressSequentially('Schlagwort 1')
    await schlagwoerterListEditElement.press('Enter')
    await schlagwoerterUebernehmenElement.click()
    const list = page.getByRole('list')
    await expect(list.getByRole('listitem')).toHaveCount(1)
    await expect(page.getByText('Schlagwort 1')).toHaveCount(1)

    // add another schlagwort with special characters, assert both are visible and sorted in the same original order
    const schlagwoerterBearbeitenElement = page.getByText('Schlagwörter bearbeiten')
    await schlagwoerterBearbeitenElement.click()

    await schlagwoerterListEditElement.click()
    await schlagwoerterListEditElement.press('End')
    await schlagwoerterListEditElement.press('Enter')
    await schlagwoerterListEditElement.pressSequentially(
      'Schlagwort with special characters 123äöüß$%&',
    )
    await schlagwoerterListEditElement.press('Enter')
    await schlagwoerterUebernehmenElement.click()
    await expect(page.getByRole('listitem').nth(0)).toHaveText('Schlagwort 1')
    await expect(page.getByRole('listitem').nth(1)).toHaveText(
      'Schlagwort with special characters 123äöüß$%&',
    )

    // add one more, but click "abbrechen" instead of confirming, assert that the new element doe not get added
    await schlagwoerterBearbeitenElement.click()
    await schlagwoerterListEditElement.click()
    await schlagwoerterListEditElement.press('End')
    await schlagwoerterListEditElement.press('Enter')
    await schlagwoerterListEditElement.pressSequentially('This should not be added')
    await schlagwoerterListEditElement.press('Enter')
    const abbrechenElement = page.getByTestId('keywords').getByRole('button', { name: 'Abbrechen' })
    await abbrechenElement.click()
    await expect(page.getByText('Schlagwort 1')).toHaveCount(1)
    await expect(page.getByText('Schlagwort with special characters 123äöüß$%&')).toHaveCount(1)
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
    await expect(page.getByText('Schlagwort with special characters 123äöüß$%&')).toHaveCount(1)
    await expect(page.getByText('A schlagwort starting with an "A"')).toHaveCount(1)
    // new element is sorted first in list
    await expect(page.getByText('A schlagwort starting with an "A"Schlagwort 1')).toHaveCount(1)

    // unchecking the alphabetical sorting dont reorder the keywords
    await schlagwoerterBearbeitenElement.click()
    await schlagwoerterListEditElement.click()
    await schlagwoerterListEditElement.press('End')
    await schlagwoerterListEditElement.press('Enter')
    await schlagwoerterListEditElement.pressSequentially('AA')
    await schlagwoerterListEditElement.press('Enter')
    await sortAlphabeticallyCheckboxElement.uncheck()
    await schlagwoerterUebernehmenElement.click()
    // new element is available
    await expect(page.getByText('A schlagwort starting with an "A"')).toHaveCount(1)
    await expect(page.getByText('Schlagwort 1')).toHaveCount(1)
    await expect(page.getByText('Schlagwort with special characters 123äöüß$%&')).toHaveCount(1)
    await expect(page.getByText('AA')).toHaveCount(1)
    // new element is not sorted
    await expect(page.getByText('Schlagwort 1AA')).toHaveCount(1)
  })
})

test.describe('RubrikenPage - Schlagwörter with persistence', () => {
  test(
    'Schlagwörter persist during reload when saved',
    { tag: ['@RISDEV-6305', '@RISDEV-8426'] },
    async ({ page }) => {
      // given
      await page.goto('/')
      await page.getByText('Neue Dokumentationseinheit').click()
      await page.getByRole('link', { name: 'Rubriken' }).click()
      const schlagwoerterHeadingElement = page.getByText('Schlagwörter')
      await expect(schlagwoerterHeadingElement).toHaveCount(2) // two headings
      await page.getByRole('button', { name: 'Schlagwörter hinzufügen' }).click()
      const schlagwoerterListEditElement = page.getByTestId('Schlagwörter_ListInputEdit')
      await schlagwoerterListEditElement.click()
      await schlagwoerterListEditElement.fill('BSG 1')
      const schlagwoerterUebernehmenElement = page.getByRole('button', {
        name: 'Schlagwörter übernehmen',
      })
      await schlagwoerterUebernehmenElement.click()
      await expect(page.getByText('BSG 1')).toHaveCount(1)

      // when
      await page.getByText('Speichern').click()
      await page.reload()

      // then
      await expect(page.getByText('BSG 1')).toHaveCount(1)

      // when editing saved keyword
      await page.getByRole('button', { name: 'Schlagwörter bearbeiten' }).click()
      await schlagwoerterListEditElement.click()
      await schlagwoerterListEditElement.fill('BSG 2')
      await schlagwoerterUebernehmenElement.click()
      await expect(page.getByText('BSG 2')).toHaveCount(1)
      await page.getByText('Speichern').click()
      await page.reload()

      // then
      const list = page.getByRole('list')
      await expect(list.getByRole('listitem')).toHaveCount(1)
      await expect(page.getByText('BSG 2')).toHaveCount(1)
    },
  )
})

test.describe('RubrikenPage - Schlagwörter - Bestandsdaten', () => {
  test(
    'Load test documentation unit and expect three keywords',
    { tag: ['@RISDEV-7639'] },
    async ({ page }) => {
      // given

      // when
      await page.goto('/documentUnit/KSNR999999999/rubriken')

      // then
      await expect(page.getByText('Schlag', { exact: true })).toHaveCount(1)
      await expect(page.getByText('Wort', { exact: true })).toHaveCount(1)
      await expect(page.getByText('Mehrere Wörter in einem Schlagwort')).toHaveCount(1)
    },
  )
})
