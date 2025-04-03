import { expect, test } from '@playwright/test'

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

    test('Filling in Formaldaten', { tag: ['@RISDEV-6043'] }, async ({ page }) => {
      await page.goto('/documentUnit/KSNR054920707/fundstellen')
      await page.getByText('Rubriken').click()
      await expect(page.getByText('Rubriken')).toHaveCount(1)

      await expect(page.getByText('Amtl. Langüberschrift')).toHaveCount(1)
      await page.getByText('Amtl. Langüberschrift').fill('my long title')
      await expect(page.getByText('Amtl. Langüberschrift')).toHaveValue('my long title')

      await expect(page.getByText('Aktenzeichen *')).toHaveCount(2)
      await page.getByText('Aktenzeichen *').first().fill('Az1')
      await page.getByText('Aktenzeichen *').first().press('Enter')
      await page.getByText('Aktenzeichen *').first().fill('Az2')
      await page.getByText('Aktenzeichen *').first().press('Enter')
      // Created elements are list elements (<li>) so we need to select them explicitly
      await expect(page.getByText('Az1')).toHaveCount(1)
      await expect(page.getByText('Az2')).toHaveCount(1)

      await expect(page.getByText('Kein Aktenzeichen')).toHaveCount(1)
      await page.getByText('Kein Aktenzeichen').check()
      await expect(page.getByText('Kein Aktenzeichen')).toBeChecked()
    })
  })

  test(
    'Dokumenttyp Zusatz: Can be entered and persists through a reload',
    { tag: ['@RISDEV-6300'] },
    async ({ page }) => {
      // given
      await page.goto('/')
      await page.getByText('Neue Dokumentationseinheit').click()
      await page.waitForURL(/documentUnit/)
      await page.getByText('Rubriken').click()

      await expect(page.getByText('Dokumenttyp Zusatz')).toHaveCount(1)

      // when
      await page.getByText('Dokumenttyp Zusatz').fill('Bekanntmachung')
      // then
      await expect(page.getByText('Dokumenttyp Zusatz')).toHaveValue('Bekanntmachung')

      // when
      await page.getByRole('button', { name: 'Speichern', exact: true }).click()
      await page.reload()
      // then
      await expect(page.getByText('Dokumenttyp Zusatz')).toHaveValue('Bekanntmachung')
    },
  )

  test(
    'Dokumenttyp: Can be filtered, entered and persists through a reload',
    { tag: ['@RISDEV-6299'] },
    async ({ page }) => {
      // given
      await page.goto('/')
      await page.getByText('Neue Dokumentationseinheit').click()
      await page.waitForURL(/documentUnit/)
      await page.getByText('Rubriken').click()

      const dokumenttypElement = page.getByText('Dokumenttyp *')
      await expect(dokumenttypElement).toHaveCount(1)

      // when
      await dokumenttypElement.fill('V')
      // then
      await expect(page.getByText('VR')).toHaveCount(1)

      // when
      await page.getByText('VR').click()
      // then
      await expect(dokumenttypElement).toHaveValue('Verwaltungsregelung')

      // when
      await page.getByRole('button', { name: 'Speichern', exact: true }).click()
      await page.reload()
      // then
      await expect(dokumenttypElement).toHaveValue('Verwaltungsregelung')
    },
  )

  test(
    'Normgeber: Can be entered and persists through a reload',
    { tag: ['@RISDEV-6297'] },
    async ({ page }) => {
      // given
      await page.goto('/')
      await page.getByText('Neue Dokumentationseinheit').click()
      await page.waitForURL(/documentUnit/)
      await page.getByText('Rubriken').click()

      const normgeberElement = page.getByText('Normgeber')
      await expect(normgeberElement).toHaveCount(1)

      // when
      await normgeberElement.fill('AG')
      await expect(page.getByText('AG Aachen')).toHaveCount(1)
      await page.getByText('AG Aachen').click()
      // then
      await expect(normgeberElement).toHaveValue('AG Aachen')

      // when
      await page.getByRole('button', { name: 'Speichern', exact: true }).click()
      await page.reload()
      // then
      await expect(normgeberElement).toHaveValue('AG Aachen')
    },
  )

  test(
    'Aktenzeichen: Can be entered, checkbox checked and both persist through a reload',
    { tag: ['@RISDEV-6303'] },
    async ({ page }) => {
      // given
      await page.goto('/')
      await page.getByText('Neue Dokumentationseinheit').click()
      await page.waitForURL(/documentUnit/)
      await page.getByText('Rubriken').click()

      const aktenzeichenElement = page.getByText('Aktenzeichen *')
      await expect(aktenzeichenElement).toHaveCount(2)

      // when
      await aktenzeichenElement.first().fill('Az1')
      await aktenzeichenElement.first().press('Enter')
      await aktenzeichenElement.first().fill('Az2')
      await aktenzeichenElement.first().press('Enter')
      // then
      // Created elements are list elements (<li>) so we need to select them explicitly
      await expect(page.getByText('Az1')).toHaveCount(1)
      await expect(page.getByText('Az2')).toHaveCount(1)

      await expect(page.getByText('Kein Aktenzeichen')).toHaveCount(1)
      // when
      await page.getByText('Kein Aktenzeichen').check()
      // then
      await expect(page.getByText('Kein Aktenzeichen')).toBeChecked()

      // when
      await page.getByRole('button', { name: 'Speichern', exact: true }).click()
      await page.reload()
      // then
      await expect(page.getByText('Az1')).toHaveCount(1)
      await expect(page.getByText('Az2')).toHaveCount(1)
      await expect(page.getByText('Kein Aktenzeichen')).toBeChecked()
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
      await page.getByText('Rubriken').click()

      const ausserkrafttretedatumElement = page.getByText('Datum des Ausserkrafttretens')
      await expect(ausserkrafttretedatumElement).toHaveCount(1)

      // when
      await ausserkrafttretedatumElement.fill('thatshouldnotwork')
      // then
      await expect(ausserkrafttretedatumElement).toHaveValue('')

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
      await page.getByText('Rubriken').click()

      const inkrafttretedatumElement = page.getByText('Datum des Inkrafttretens')
      await expect(inkrafttretedatumElement).toHaveCount(1)

      // when
      await inkrafttretedatumElement.fill('thatshouldnotwork')
      // then
      await expect(inkrafttretedatumElement).toHaveValue('')

      // when
      await inkrafttretedatumElement.fill('02.02.1970')
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
    'Zitierdatum: invalid date cannot be entered, valid date can be entered and persists through a reload',
    { tag: ['@RISDEV-6296'] },
    async ({ page }) => {
      // given
      await page.goto('/')
      await page.getByText('Neue Dokumentationseinheit').click()
      await page.waitForURL(/documentUnit/)
      await page.getByText('Rubriken').click()

      const zitierdatumElement = page.getByText('Zitierdatum')
      await expect(zitierdatumElement).toHaveCount(1)

      // when
      await zitierdatumElement.fill('thatshouldnotwork')
      // then
      await expect(zitierdatumElement).toHaveValue('')

      // when
      await zitierdatumElement.fill('15.01.2025')
      // then
      await expect(zitierdatumElement).toHaveValue('15.01.2025')

      // when
      await page.getByRole('button', { name: 'Speichern', exact: true }).click()
      await page.reload()
      // then
      await expect(zitierdatumElement).toHaveValue('15.01.2025')
    },
  )

  test(
    'Zitierdatum: incomplete date can be entered and persists through a reload',
    { tag: ['@RISDEV-6296'] },
    async ({ page }) => {
      // given
      await page.goto('/')
      await page.getByText('Neue Dokumentationseinheit').click()
      await page.waitForURL(/documentUnit/)
      await page.getByText('Rubriken').click()

      const zitierdatumElement = page.getByText('Zitierdatum')
      await expect(zitierdatumElement).toHaveCount(1)

      // when
      await zitierdatumElement.fill('20')
      // then
      await expect(zitierdatumElement).toHaveValue('20')

      // when
      await page.getByRole('button', { name: 'Speichern', exact: true }).click()
      await page.reload()
      // then
      await expect(zitierdatumElement).toHaveValue('20')
    },
  )
})
