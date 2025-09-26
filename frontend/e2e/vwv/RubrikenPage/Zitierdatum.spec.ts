import { expect, test } from '@playwright/test'
import dayjs from 'dayjs'

test.describe('RubrikenPage - Zitierdatum', () => {
  test(
    'Invalid date with letters cannot be entered, valid date can be entered and persists through a reload',
    { tag: ['@RISDEV-6296'] },
    async ({ page }) => {
      // given
      await page.goto('/')
      await page.getByText('Neue Dokumentationseinheit').click()
      await page.waitForURL(/documentUnit/)
      await page.getByRole('link', { name: 'Rubriken' }).click()

      await expect(page.getByText('Zitierdatum *')).toBeVisible()

      const zitierdatenGroup = page.getByRole('group', { name: 'Zitierdatum' })
      // eslint-disable-next-line playwright/no-raw-locators
      const newZitierdatumInput = zitierdatenGroup.locator('input')
      await expect(newZitierdatumInput).toHaveCount(1)

      // when
      await newZitierdatumInput.fill('thatshouldnotwork')
      // then
      await expect(newZitierdatumInput).toHaveValue('__.__.____')

      // when
      await newZitierdatumInput.fill('15.01.2025')
      // then
      await expect(newZitierdatumInput).toHaveValue('15.01.2025')

      // when
      await page.getByRole('button', { name: 'Speichern', exact: true }).click()
      await page.reload()
      // then
      await expect(zitierdatenGroup.getByRole('listitem', { name: '15.01.2025' })).toBeVisible()
    },
  )

  test(
    'Invalid date can be entered, a validation error is shown but value does not persist',
    { tag: ['@RISDEV-6296'] },
    async ({ page }) => {
      // given
      await page.goto('/')
      await page.getByText('Neue Dokumentationseinheit').click()
      await page.waitForURL(/documentUnit/)
      await page.getByRole('link', { name: 'Rubriken' }).click()

      const zitierdatenGroup = page.getByRole('group', { name: 'Zitierdatum' })
      // eslint-disable-next-line playwright/no-raw-locators
      const newZitierdatumInput = zitierdatenGroup.locator('input')
      await expect(newZitierdatumInput).toHaveCount(1)

      // when
      await newZitierdatumInput.fill('99.99.9999')
      await newZitierdatumInput.press('Tab') // Triggers validation
      // then
      await expect(zitierdatenGroup.getByRole('listitem')).toHaveCount(1)
      await expect(zitierdatenGroup).toHaveAttribute('aria-invalid', 'true')
      await expect(page.getByText('Kein valides Datum: 99.99.9999')).toBeVisible()

      // when
      await page.getByRole('button', { name: 'Speichern', exact: true }).click()
      await page.reload()
      // then
      await expect(zitierdatenGroup.getByRole('listitem')).toHaveCount(0)
    },
  )

  test(
    'A future date can be entered, a validation error is shown but value does not persist',
    { tag: ['@RISDEV-6296'] },
    async ({ page }) => {
      // given
      await page.goto('/')
      await page.getByText('Neue Dokumentationseinheit').click()
      await page.waitForURL(/documentUnit/)
      await page.getByRole('link', { name: 'Rubriken' }).click()

      const zitierdatenGroup = page.getByRole('group', { name: 'Zitierdatum' })
      // eslint-disable-next-line playwright/no-raw-locators
      const newZitierdatumInput = zitierdatenGroup.locator('input')
      await expect(newZitierdatumInput).toHaveCount(1)
      const tomorrow = dayjs().add(1, 'day').format('DD.MM.YYYY')

      // when
      await newZitierdatumInput.fill(tomorrow)
      await newZitierdatumInput.press('Tab') // Triggers validation
      // then
      await expect(zitierdatenGroup).toHaveAttribute('aria-invalid', 'true')
      await expect(
        page.getByText(`Das Datum darf nicht in der Zukunft liegen: ${tomorrow}`),
      ).toBeVisible()

      // when
      await page.getByRole('button', { name: 'Speichern', exact: true }).click()
      await page.reload()
      // then
      await expect(zitierdatenGroup.getByRole('listitem')).toHaveCount(0)
    },
  )

  test(
    'An incomplete date wont persist and no error is shown',
    { tag: ['@RISDEV-6296'] },
    async ({ page }) => {
      // given
      await page.goto('/')
      await page.getByText('Neue Dokumentationseinheit').click()
      await page.waitForURL(/documentUnit/)
      await page.getByRole('link', { name: 'Rubriken' }).click()

      const zitierdatenGroup = page.getByRole('group', { name: 'Zitierdatum' })
      // eslint-disable-next-line playwright/no-raw-locators
      const newZitierdatumInput = zitierdatenGroup.locator('input')
      await expect(newZitierdatumInput).toHaveCount(1)

      // when
      await newZitierdatumInput.fill('12.12.20')
      await newZitierdatumInput.press('Tab')
      // then
      await expect(zitierdatenGroup).toHaveAttribute('aria-invalid', 'false')
      await expect(zitierdatenGroup.getByRole('listitem')).toHaveCount(0)

      // when
      await page.getByRole('button', { name: 'Speichern', exact: true }).click()
      await page.reload()
      // then
      await expect(zitierdatenGroup.getByRole('listitem')).toHaveCount(0)
    },
  )

  test(
    'An existing date can be edited and persists through a reload',
    { tag: ['@RISDEV-6296'] },
    async ({ page }) => {
      // given
      await page.goto('/')
      await page.getByText('Neue Dokumentationseinheit').click()
      await page.waitForURL(/documentUnit/)
      await page.getByRole('link', { name: 'Rubriken' }).click()

      // given
      const zitierdatenGroup = page.getByRole('group', { name: 'Zitierdatum' })
      // eslint-disable-next-line playwright/no-raw-locators
      const newZitierdatumInput = zitierdatenGroup.locator('input')
      await newZitierdatumInput.fill('15.01.2025')
      await page.getByRole('button', { name: 'Speichern', exact: true }).click()
      await page.reload()
      await expect(zitierdatenGroup.getByRole('listitem', { name: '15.01.2025' })).toBeVisible()
      await expect(zitierdatenGroup.getByRole('listitem')).toHaveCount(1)

      // when
      const existingZitierdatum = zitierdatenGroup.getByRole('listitem', { name: '15.01.2025' })
      await existingZitierdatum.dblclick()
      await existingZitierdatum.getByRole('textbox').fill('01.02.2025')
      await page.getByRole('button', { name: 'Speichern', exact: true }).click()
      await page.reload()

      // then
      await expect(zitierdatenGroup.getByRole('listitem')).toHaveCount(1)
      await expect(zitierdatenGroup.getByRole('listitem', { name: '01.02.2025' })).toBeVisible()
    },
  )
})
