import { expect, test } from '@playwright/test'

test.describe('RubrikenPage - Berufsbild', () => {
  test(
    'Berufsbild: items can be added, edited, deleted and changes persist when saved',
    { tag: ['@RISDEV-7456'] },
    async ({ page }) => {
      // given
      await page.goto('/')
      await page.getByText('Neue Dokumentationseinheit').click()
      await page.waitForURL(/documentUnit/)
      await page.getByRole('link', { name: 'Rubriken' }).click()
      await expect(page.getByText('Weitere Rubriken')).toBeVisible()

      // when
      await page.getByRole('button', { name: 'Berufsbild hinzufügen' }).click()

      // then
      const berufsbildGroup = page.getByRole('group', { name: 'Berufsbild' })
      await expect(berufsbildGroup).toBeVisible()

      // when
      // eslint-disable-next-line playwright/no-raw-locators
      const titelAspektInput = berufsbildGroup.locator('input')
      await expect(titelAspektInput).toHaveCount(1)
      await titelAspektInput.fill('Brillenschleifer')
      await titelAspektInput.press('Enter')
      // then
      await expect(page.getByText('Brillenschleifer')).toHaveCount(1)

      // when
      await page.getByRole('button', { name: 'Speichern', exact: true }).click()
      await page.reload()
      // then
      await expect(page.getByText('Brillenschleifer')).toHaveCount(1)

      // when
      const listItem = berufsbildGroup.getByRole('listitem', { name: 'Brillenschleifer' })
      await expect(listItem).toHaveCount(1)
      await listItem.dblclick()
      await listItem.getByRole('textbox').fill('Handwerker')
      await page.keyboard.press('Enter')
      await page.getByRole('button', { name: 'Speichern', exact: true }).click()
      await page.reload()
      // then
      await expect(berufsbildGroup.getByRole('listitem')).toHaveCount(1)
      await expect(berufsbildGroup.getByRole('listitem', { name: 'Handwerker' })).toHaveCount(1)

      // when
      const deleteButton = berufsbildGroup
        .getByRole('listitem', { name: 'Handwerker' })
        .getByRole('button', { name: 'Eintrag löschen' })
      await deleteButton.click()
      // then
      await expect(berufsbildGroup.getByRole('listitem')).toHaveCount(0)

      // when
      await page.getByRole('button', { name: 'Speichern', exact: true }).click()
      await page.reload()
      // then
      await expect(berufsbildGroup.getByRole('listitem')).toHaveCount(0)
    },
  )
})
