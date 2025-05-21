import { expect, test } from '@playwright/test'

test.describe('RubrikenPage - Normgeber', () => {
  test(
    'Normgeber: An Organ can be entered and persists through a reload',
    { tag: ['@RISDEV-7352'] },
    async ({ page }) => {
      // given
      await page.goto('/')
      await page.getByText('Neue Dokumentationseinheit').click()
      await page.waitForURL(/documentUnit/)
      await page.getByText('Rubriken').click()

      await expect(page.getByRole('heading', { level: 2, name: 'Normgeber' })).toBeVisible()

      // when
      const normgeberElement = page.getByRole('textbox', { name: 'Normgeber' })
      await normgeberElement.fill('Erstes')
      await expect(page.getByText('Erstes Organ')).toHaveCount(1)
      await page.getByText('Erstes Organ').click()
      // then
      await expect(normgeberElement).toHaveValue('Erstes Organ')
      await expect(
        page.getByRole('button', { name: 'Normgeber übernehmen', exact: true }),
      ).toHaveAttribute('disabled')

      // when
      const regionElement = page.getByRole('textbox', { name: 'Region' })
      await regionElement.fill('AA')
      await expect(page.getByText('AA')).toHaveCount(1)
      await page.getByText('AA').click()
      // then
      await expect(regionElement).toHaveValue('AA')
      await expect(
        page.getByRole('button', { name: 'Normgeber übernehmen', exact: true }),
      ).not.toHaveAttribute('disabled')

      // when
      await page.getByRole('button', { name: 'Normgeber übernehmen', exact: true }).click()
      await page.getByText('Speichern').click()
      await page.reload()
      // then
      await expect(page.getByRole('listitem').first()).toHaveText('AA, Erstes Organ')
    },
  )

  test(
    'Normgeber: A legal entity (jur. Person) can be entered with a readonly region and persists through a reload',
    { tag: ['@RISDEV-7352'] },
    async ({ page }) => {
      // given
      await page.goto('/')
      await page.getByText('Neue Dokumentationseinheit').click()
      await page.waitForURL(/documentUnit/)
      await page.getByText('Rubriken').click()

      // when
      const normgeberElement = page.getByRole('textbox', { name: 'Normgeber' })
      const regionElement = page.getByRole('textbox', { name: 'Region' })
      await normgeberElement.fill('Dritte')
      await expect(page.getByText('Dritte Jurpn')).toHaveCount(1)
      await page.getByText('Dritte Jurpn').click()
      // then
      await expect(normgeberElement).toHaveValue('Dritte Jurpn')
      await expect(regionElement).toHaveValue('CC')
      await expect(regionElement).toHaveAttribute('readonly')
      await expect(
        page.getByRole('button', { name: 'Normgeber übernehmen', exact: true }),
      ).not.toHaveAttribute('disabled')

      // when
      await page.getByRole('button', { name: 'Normgeber übernehmen', exact: true }).click()
      await page.getByText('Speichern').click()
      await page.reload()
      // then
      await expect(page.getByRole('listitem').first()).toHaveText('CC, Dritte Jurpn')
    },
  )

  test(
    'Normgeber: Regions are shown comma separated for a legal entity (jur. Person)',
    { tag: ['@RISDEV-7352'] },
    async ({ page }) => {
      // given
      await page.goto('/')
      await page.getByText('Neue Dokumentationseinheit').click()
      await page.waitForURL(/documentUnit/)
      await page.getByText('Rubriken').click()

      // when
      const normgeberElement = page.getByRole('textbox', { name: 'Normgeber' })
      const regionElement = page.getByRole('textbox', { name: 'Region' })
      await normgeberElement.fill('Erste Jurpn')
      await expect(page.getByText('Erste Jurpn')).toHaveCount(1)
      await page.getByText('Erste Jurpn').click()
      // then
      await expect(normgeberElement).toHaveValue('Erste Jurpn')
      await expect(regionElement).toHaveValue('BB, AA')
      await expect(regionElement).toHaveAttribute('readonly')

      // when
      await page.getByRole('button', { name: 'Normgeber übernehmen', exact: true }).click()
      // then
      await expect(page.getByRole('listitem').first()).toHaveText('BB, AA, Erste Jurpn')
    },
  )

  test(
    'Normgeber: "Keine Region zugeordnet" is shown for legal entity with no region',
    { tag: ['@RISDEV-7352'] },
    async ({ page }) => {
      // given
      await page.goto('/')
      await page.getByText('Neue Dokumentationseinheit').click()
      await page.waitForURL(/documentUnit/)
      await page.getByText('Rubriken').click()

      // when
      const normgeberElement = page.getByRole('textbox', { name: 'Normgeber' })
      const regionElement = page.getByRole('textbox', { name: 'Region' })
      await normgeberElement.fill('Zweite')
      await page.getByText('Zweite Jurpn').click()
      // then
      await expect(normgeberElement).toHaveValue('Zweite Jurpn')
      await expect(regionElement).toHaveValue('Keine Region zugeordnet')
      await expect(regionElement).toHaveAttribute('readonly')

      // when
      await page.getByRole('button', { name: 'Normgeber übernehmen', exact: true }).click()
      // then
      await expect(page.getByRole('listitem').first()).toHaveText('Zweite Jurpn')
    },
  )

  test(
    'Normgeber: an existing normgeber can be edited',
    { tag: ['@RISDEV-7352'] },
    async ({ page }) => {
      // given
      await page.goto('/')
      await page.getByText('Neue Dokumentationseinheit').click()
      await page.waitForURL(/documentUnit/)
      await page.getByText('Rubriken').click()

      // when adding a new normgeber
      const normgeberElement = page.getByRole('textbox', { name: 'Normgeber' })
      const regionElement = page.getByRole('textbox', { name: 'Region' })
      const normgeberList = page.getByRole('list', { name: 'Normgeber Liste', exact: true })
      await normgeberElement.fill('Erste Jurpn')
      await page.getByText('Erste Jurpn').click()
      await page.getByRole('button', { name: 'Normgeber übernehmen', exact: true }).click()
      // then
      await expect(normgeberList).toHaveCount(1)
      await expect(normgeberList.first()).toHaveText('BB, AA, Erste Jurpn')
      await expect(
        page.getByRole('button', { name: 'Normgeber übernehmen', exact: true }),
      ).toBeHidden()
      await expect(
        page.getByRole('button', { name: 'Normgeber hinzufügen', exact: true }),
      ).toBeVisible()

      // when clicking on chevron
      await page.getByRole('button', { name: 'Normgeber Editieren', exact: true }).click()
      // then
      await expect(normgeberElement).toHaveValue('Erste Jurpn')
      await expect(regionElement).toHaveValue('BB, AA')
      await expect(
        page.getByRole('button', { name: 'Normgeber übernehmen', exact: true }),
      ).toBeVisible()

      // when editing and clicking on cancel
      await normgeberElement.fill('Zweite')
      await page.getByText('Zweite Jurpn').click()
      await page.getByRole('button', { name: 'Abbrechen', exact: true }).click()
      // then
      await expect(normgeberList.first()).toHaveText('BB, AA, Erste Jurpn')

      // when editing entry and saving
      await page.getByRole('button', { name: 'Normgeber Editieren', exact: true }).click()
      await normgeberElement.fill('Zweite')
      await page.getByText('Zweite Jurpn').click()
      await page.getByRole('button', { name: 'Normgeber übernehmen', exact: true }).click()
      // then
      await expect(normgeberList.first()).toHaveText('Zweite Jurpn')

      // when clicking on delete
      await page.getByRole('button', { name: 'Normgeber Editieren', exact: true }).click()
      await page.getByRole('button', { name: 'Eintrag löschen', exact: true }).click()
      // then
      await expect(normgeberList).toHaveCount(0)
    },
  )

  test(
    'Normgeber: an institution can be entered just once',
    { tag: ['@RISDEV-7352'] },
    async ({ page }) => {
      // given
      await page.goto('/')
      await page.getByText('Neue Dokumentationseinheit').click()
      await page.waitForURL(/documentUnit/)
      await page.getByText('Rubriken').click()

      // when adding twice the same institution
      const normgeberElement = page.getByRole('textbox', { name: 'Normgeber' })
      await normgeberElement.fill('Zweite Jurpn')
      await page.getByText('Zweite Jurpn').click()
      await page.getByRole('button', { name: 'Normgeber übernehmen', exact: true }).click()
      await page.getByRole('button', { name: 'Normgeber hinzufügen', exact: true }).click()
      await normgeberElement.click()
      await normgeberElement.fill('Zweite Jurpn')
      await page.getByText('Zweite Jurpn').nth(1).click()
      await normgeberElement.press('Tab')
      // then
      await expect(normgeberElement).toHaveAttribute('invalid', 'true')
      await expect(page.getByText('Normgeber bereits eingegeben')).toBeVisible()
    },
  )

  test(
    'Normgeber: region is required for an institutional normgeber',
    { tag: ['@RISDEV-7352'] },
    async ({ page }) => {
      // given
      await page.goto('/')
      await page.getByText('Neue Dokumentationseinheit').click()
      await page.waitForURL(/documentUnit/)
      await page.getByText('Rubriken').click()

      // when adding an institutional normgeber
      const normgeberElement = page.getByRole('textbox', { name: 'Normgeber' })
      await normgeberElement.fill('Erstes Organ')
      await page.getByText('Erstes Organ').click()
      // then
      await expect(
        page.getByRole('button', { name: 'Normgeber übernehmen', exact: true }),
      ).toHaveAttribute('disabled')
    },
  )
})

test.describe('RubrikenPage - Normgeber - Bestandsdaten', () => {
  test(
    'Load test documentation unit and two Normgeber',
    { tag: ['@RISDEV-7639'] },
    async ({ page }) => {
      // given

      // when
      await page.goto('/documentUnit/KSNR999999999/rubriken')

      // then
      await expect(page.getByText('Erste Jurpn')).toHaveCount(1)
      await expect(page.getByText('Erstes Organ')).toHaveCount(1)
      await expect(page.getByText('AA')).toHaveCount(1)
    },
  )
})
