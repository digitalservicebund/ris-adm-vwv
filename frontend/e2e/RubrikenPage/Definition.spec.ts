import { expect, test } from '@playwright/test'

test.describe('RubrikenPage - Definition', () => {
  test(
    'Definition: items can be added, edited, deleted and changes persist when saved',
    { tag: ['@RISDEV-8617'] },
    async ({ page }) => {
      // given
      await page.goto('/')
      await page.getByText('Neue Dokumentationseinheit').click()
      await page.waitForURL(/documentUnit/)
      await page.getByRole('link', { name: 'Rubriken' }).click()
      await expect(page.getByText('Weitere Rubriken')).toBeVisible()

      // when
      await page.getByRole('button', { name: 'Definition hinzufügen' }).click()

      // then
      const definitionsGroup = page.getByRole('group', { name: 'Definition' })
      await expect(definitionsGroup).toBeVisible()

      // when
      // eslint-disable-next-line playwright/no-raw-locators
      const definitionInput = definitionsGroup.locator('input')
      await expect(definitionInput).toHaveCount(1)
      await definitionInput.fill('Sachgesamtheit')
      await definitionInput.press('Enter')
      // then
      await expect(page.getByText('Sachgesamtheit')).toHaveCount(1)

      // when
      await page.getByRole('button', { name: 'Speichern', exact: true }).click()
      await page.reload()
      // then
      await expect(page.getByText('Sachgesamtheit')).toHaveCount(1)

      // when
      const listItem = definitionsGroup.getByRole('listitem', { name: 'Sachgesamtheit' })
      await expect(listItem).toHaveCount(1)
      await listItem.dblclick()
      await listItem.getByRole('textbox').fill('Erwerbstätigkeit')
      await page.keyboard.press('Enter')
      await page.getByRole('button', { name: 'Speichern', exact: true }).click()
      await page.reload()
      // then
      await expect(definitionsGroup.getByRole('listitem')).toHaveCount(1)
      await expect(
        definitionsGroup.getByRole('listitem', { name: 'Erwerbstätigkeit' }),
      ).toHaveCount(1)

      // when
      const deleteButton = definitionsGroup
        .getByRole('listitem', { name: 'Erwerbstätigkeit' })
        .getByRole('button', { name: 'Eintrag löschen' })
      await deleteButton.click()
      // then
      await expect(definitionsGroup.getByRole('listitem')).toHaveCount(0)

      // when
      await page.getByRole('button', { name: 'Speichern', exact: true }).click()
      await page.reload()
      // then
      await expect(definitionsGroup.getByRole('listitem')).toHaveCount(0)
    },
  )
})
