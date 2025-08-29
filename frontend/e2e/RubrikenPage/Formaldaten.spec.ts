import { expect, test } from '@playwright/test'
import dayjs from 'dayjs'

test.describe('RubrikenPage - Formatdaten', () => {
  test.describe('With mocked responses', () => {
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

    test('Filling in Amtl. Langüberschrift', { tag: ['@RISDEV-6043'] }, async ({ page }) => {
      await page.goto('/documentUnit/KSNR054920707/fundstellen')
      await page.getByRole('link', { name: 'Rubriken' }).click()
      await expect(page.getByRole('link', { name: 'Rubriken' })).toHaveCount(1)

      await expect(page.getByText('Amtl. Langüberschrift')).toHaveCount(1)
      // when
      await page.getByText('Amtl. Langüberschrift').fill('my long title')
      // then
      await expect(page.getByText('Amtl. Langüberschrift')).toHaveValue('my long title')
    })

    test.describe('Aktenzeichen', () => {
      test(
        'Filling in Aktenzeichen (incl. special characters)',
        { tag: ['@RISDEV-7680'] },
        async ({ page }) => {
          await page.goto('/documentUnit/KSNR054920707/fundstellen')
          await page.getByRole('link', { name: 'Rubriken' }).click()
          await expect(page.getByRole('link', { name: 'Rubriken' })).toHaveCount(1)

          const aktenzeichenGroup = page.getByRole('group', { name: 'Aktenzeichen' })
          // eslint-disable-next-line playwright/no-raw-locators
          const newAktenzeichenInput = aktenzeichenGroup.locator('input')
          const aktenzeichenWithSpecialCharacters = '123äöüß$%&'

          await expect(newAktenzeichenInput).toHaveCount(1)
          await expect(aktenzeichenGroup.getByRole('listitem')).toHaveCount(0)
          // when
          await newAktenzeichenInput.fill('Az1')
          await newAktenzeichenInput.press('Enter')
          await newAktenzeichenInput.fill(aktenzeichenWithSpecialCharacters)
          await newAktenzeichenInput.press('Enter')
          // then
          // Created elements are list elements (<li>) so we need to select them explicitly
          await expect(aktenzeichenGroup.getByRole('listitem')).toHaveCount(2)
          await expect(page.getByText('Az1')).toHaveCount(1)
          await expect(page.getByText(aktenzeichenWithSpecialCharacters)).toHaveCount(1)
        },
      )

      test(
        '"Eintrag löschen" results in deleting the Aktenzeichen',
        { tag: ['@RISDEV-7680'] },
        async ({ page }) => {
          await page.goto('/documentUnit/KSNR054920707/rubriken')
          const aktenzeichenGroup = page.getByRole('group', { name: 'Aktenzeichen' })
          // eslint-disable-next-line playwright/no-raw-locators
          const newAktenzeichenInput = aktenzeichenGroup.locator('input')
          await newAktenzeichenInput.fill('Az1')
          await newAktenzeichenInput.press('Enter')
          await expect(page.getByText('Az1')).toHaveCount(1)
          // when
          await page.getByRole('button', { name: 'Eintrag löschen' }).click()
          // then
          await expect(page.getByText('Az1')).toHaveCount(0)
        },
      )
    })
  })

  test(
    'Aktenzeichen: Can be entered, persist through a reload, can be edited',
    { tag: ['@RISDEV-6303, @RISDEV-7680'] },
    async ({ page }) => {
      // given
      await page.goto('/')
      await page.getByText('Neue Dokumentationseinheit').click()
      await page.waitForURL(/documentUnit/)
      await page.getByRole('link', { name: 'Rubriken' }).click()

      const aktenzeichenGroup = page.getByRole('group', { name: 'Aktenzeichen' })
      // eslint-disable-next-line playwright/no-raw-locators
      const newAktenzeichenInput = aktenzeichenGroup.locator('input')

      // when
      await expect(newAktenzeichenInput).toHaveCount(1)
      await newAktenzeichenInput.fill('Az1')
      await newAktenzeichenInput.press('Enter')
      await newAktenzeichenInput.fill('Az2')
      await newAktenzeichenInput.press('Enter')
      // then
      // Created elements are list elements (<li>) so we need to select them explicitly
      await expect(page.getByText('Az1')).toHaveCount(1)
      await expect(page.getByText('Az2')).toHaveCount(1)

      // when
      await page.getByRole('button', { name: 'Speichern', exact: true }).click()
      await page.reload()
      // then
      await expect(page.getByText('Az1')).toHaveCount(1)
      await expect(page.getByText('Az2')).toHaveCount(1)

      // when
      const listItem = aktenzeichenGroup.getByRole('listitem', { name: 'Az1' })
      await expect(listItem).toHaveCount(1)
      await listItem.dblclick()
      await listItem.getByRole('textbox').fill('Az3')
      await page.keyboard.press('Enter')
      await page.getByRole('button', { name: 'Speichern', exact: true }).click()
      await page.reload()
      // then
      await expect(aktenzeichenGroup.getByRole('listitem')).toHaveCount(2)
      await expect(aktenzeichenGroup.getByRole('listitem', { name: 'Az3' })).toHaveCount(1)
    },
  )

  test(
    'Ausserkrafttretedatum: Invalid date cannot be entered, valid date can be entered and persists through a reload',
    { tag: ['@RISDEV-6302'] },
    async ({ page }) => {
      // given
      await page.goto('/')
      await page.getByText('Neue Dokumentationseinheit').click()
      await page.waitForURL(/documentUnit/)
      await page.getByRole('link', { name: 'Rubriken' }).click()

      const ausserkrafttretedatumElement = page.getByText('Datum des Ausserkrafttretens')
      await expect(ausserkrafttretedatumElement).toHaveCount(1)

      // when
      await ausserkrafttretedatumElement.fill('thatshouldnotwork')
      // then
      await expect(ausserkrafttretedatumElement).toHaveValue('__.__.____')

      // when
      await ausserkrafttretedatumElement.fill('03.03.1970')
      await expect(ausserkrafttretedatumElement).toHaveValue('03.03.1970')

      // when
      await page.getByRole('button', { name: 'Speichern', exact: true }).click()
      await page.reload()
      // then
      await expect(ausserkrafttretedatumElement).toHaveValue('03.03.1970')
    },
  )

  test(
    'Inkrafttretedatum: Invalid date cannot be entered, valid date can be entered and persists through a reload. Also: does not influence the ausserkrafttreten',
    { tag: ['@RISDEV-6301'] },
    async ({ page }) => {
      // given
      await page.goto('/')
      await page.getByText('Neue Dokumentationseinheit').click()
      await page.waitForURL(/documentUnit/)
      await page.getByRole('link', { name: 'Rubriken' }).click()

      const inkrafttretedatumElement = page.getByText('Datum des Inkrafttretens *')
      await expect(inkrafttretedatumElement).toHaveCount(1)

      // when
      await inkrafttretedatumElement.fill('thatshouldnotwork')
      // then
      await expect(inkrafttretedatumElement).toHaveValue('__.__.____')

      // when
      await inkrafttretedatumElement.fill('02.02.1970')
      // then
      await expect(inkrafttretedatumElement).toHaveValue('02.02.1970')
      await expect(page.getByText('Datum des Ausserkrafttretens')).toHaveValue('')

      // when
      await page.getByRole('button', { name: 'Speichern', exact: true }).click()
      await page.reload()
      // then
      await expect(inkrafttretedatumElement).toHaveValue('02.02.1970')
    },
  )

  test(
    'Inkrafttretedatum: an existing date can be edited with a date in the future',
    { tag: ['@RISDEV-6301'] },
    async ({ page }) => {
      // given
      await page.goto('/')
      await page.getByText('Neue Dokumentationseinheit').click()
      await page.waitForURL(/documentUnit/)
      await page.getByRole('link', { name: 'Rubriken' }).click()
      const inkrafttretedatumElement = page.getByText('Datum des Inkrafttretens *')
      await inkrafttretedatumElement.fill('02.02.1970')
      await page.getByRole('button', { name: 'Speichern', exact: true }).click()
      await page.reload()
      await expect(inkrafttretedatumElement).toHaveValue('02.02.1970')

      // when
      const tomorrow = dayjs().add(1, 'day').format('DD.MM.YYYY')
      await inkrafttretedatumElement.fill(tomorrow)
      await page.getByRole('button', { name: 'Speichern', exact: true }).click()
      await page.reload()
      // then
      await expect(inkrafttretedatumElement).toHaveValue(tomorrow)
    },
  )

  test(
    'Inkrafttretedatum: if invalid, validation errors are shown',
    { tag: ['@RISDEV-6301'] },
    async ({ page }) => {
      // given
      await page.goto('/')
      await page.getByText('Neue Dokumentationseinheit').click()
      await page.waitForURL(/documentUnit/)
      await page.getByRole('link', { name: 'Rubriken' }).click()
      const inkrafttretedatumElement = page.getByText('Datum des Inkrafttretens *')

      // when
      await inkrafttretedatumElement.fill('99.99.9999')
      await inkrafttretedatumElement.press('Tab')
      // then
      await expect(page.getByText('Kein valides Datum')).toBeVisible()

      // when
      await inkrafttretedatumElement.fill('12.12.20')
      await inkrafttretedatumElement.press('Tab')
      // then
      await expect(page.getByText('Unvollständiges Datum')).toBeVisible()
    },
  )

  test(
    'Ausserkrafttretensdatum: a future date can be entered and no validation error is shown',
    { tag: ['@RISDEV-6302'] },
    async ({ page }) => {
      // given
      await page.goto('/')
      await page.getByText('Neue Dokumentationseinheit').click()
      await page.waitForURL(/documentUnit/)
      await page.getByRole('link', { name: 'Rubriken' }).click()

      const ausserkrafttretedatumElement = page.getByText('Datum des Ausserkrafttretens')
      await expect(ausserkrafttretedatumElement).toHaveCount(1)
      const tomorrow = dayjs().add(1, 'day').format('DD.MM.YYYY')

      // when
      await ausserkrafttretedatumElement.fill(tomorrow)
      await ausserkrafttretedatumElement.press('Tab') // Triggers validation
      // then
      await expect(ausserkrafttretedatumElement).toHaveValue(tomorrow)
      await expect(ausserkrafttretedatumElement).not.toHaveAttribute('aria-invalid', 'true')
      await expect(page.getByText('Das Datum darf nicht in der Zukunft liegen')).toBeHidden()
    },
  )

  test(
    'Ausserkrafttretensdatum: an existing date can be edited',
    { tag: ['@RISDEV-6302'] },
    async ({ page }) => {
      // given
      await page.goto('/')
      await page.getByText('Neue Dokumentationseinheit').click()
      await page.waitForURL(/documentUnit/)
      await page.getByRole('link', { name: 'Rubriken' }).click()
      const ausserkrafttretedatumElement = page.getByText('Datum des Ausserkrafttretens')
      await ausserkrafttretedatumElement.fill('02.02.1970')
      await page.getByRole('button', { name: 'Speichern', exact: true }).click()
      await page.reload()
      await expect(ausserkrafttretedatumElement).toHaveValue('02.02.1970')

      // when
      await ausserkrafttretedatumElement.fill('01.01.2000')
      await page.getByRole('button', { name: 'Speichern', exact: true }).click()
      await page.reload()
      // then
      await expect(ausserkrafttretedatumElement).toHaveValue('01.01.2000')
    },
  )

  test(
    'Ausserkrafttretensdatum: validation errors are shown',
    { tag: ['@RISDEV-6302'] },
    async ({ page }) => {
      // given
      await page.goto('/')
      await page.getByText('Neue Dokumentationseinheit').click()
      await page.waitForURL(/documentUnit/)
      await page.getByRole('link', { name: 'Rubriken' }).click()
      const ausserkrafttretedatumElement = page.getByText('Datum des Ausserkrafttretens')

      // when
      await ausserkrafttretedatumElement.fill('99.99.9999')
      await ausserkrafttretedatumElement.press('Tab')
      // then
      await expect(page.getByText('Kein valides Datum')).toBeVisible()

      // when
      await ausserkrafttretedatumElement.fill('12.12.20')
      await ausserkrafttretedatumElement.press('Tab')
      // then
      await expect(page.getByText('Unvollständiges Datum')).toBeVisible()
    },
  )

  test(
    'Titelaspekt: items can be added, edited, deleted and changes persist when saved',
    { tag: ['@RISDEV-8618'] },
    async ({ page }) => {
      // given
      await page.goto('/')
      await page.getByText('Neue Dokumentationseinheit').click()
      await page.waitForURL(/documentUnit/)
      await page.getByRole('link', { name: 'Rubriken' }).click()

      // when
      await page.getByRole('button', { name: 'Titelaspekt hinzufügen' }).click()

      // then
      const titelAspektGroup = page.getByRole('group', { name: 'Titelaspekt' })
      await expect(titelAspektGroup).toBeVisible()

      // when
      // eslint-disable-next-line playwright/no-raw-locators
      const titelAspektInput = titelAspektGroup.locator('input')
      await expect(titelAspektInput).toHaveCount(1)
      await titelAspektInput.fill('Gemeinsamer Bundesausschuss')
      await titelAspektInput.press('Enter')
      // then
      await expect(page.getByText('Gemeinsamer Bundesausschuss')).toHaveCount(1)

      // when
      await page.getByRole('button', { name: 'Speichern', exact: true }).click()
      await page.reload()
      // then
      await expect(page.getByText('Gemeinsamer Bundesausschuss')).toHaveCount(1)

      // when
      const listItem = titelAspektGroup.getByRole('listitem', {
        name: 'Gemeinsamer Bundesausschuss',
      })
      await expect(listItem).toHaveCount(1)
      await listItem.dblclick()
      await listItem.getByRole('textbox').fill('Leistungserbringer')
      await page.keyboard.press('Enter')
      await page.getByRole('button', { name: 'Speichern', exact: true }).click()
      await page.reload()
      // then
      await expect(titelAspektGroup.getByRole('listitem')).toHaveCount(1)
      await expect(
        titelAspektGroup.getByRole('listitem', { name: 'Leistungserbringer' }),
      ).toHaveCount(1)

      // when
      const deleteButton = titelAspektGroup
        .getByRole('listitem', { name: 'Leistungserbringer' })
        .getByRole('button', { name: 'Eintrag löschen' })
      await deleteButton.click()
      // then
      await expect(titelAspektGroup.getByRole('listitem')).toHaveCount(0)

      // when
      await page.getByRole('button', { name: 'Speichern', exact: true }).click()
      await page.reload()
      // then
      await expect(titelAspektGroup.getByRole('listitem')).toHaveCount(0)
    },
  )
})
