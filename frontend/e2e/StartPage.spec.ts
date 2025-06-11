import { test, expect } from '@playwright/test'

// See here how to get started:
// https://playwright.dev/docs/intro
test.describe('StartPage', () => {
  test(
    'Visiting the app root url, it shows the title "Rechtsinformationen [...]", an icon and user data',
    { tag: ['@RISDEV-6041'] },
    async ({ page }) => {
      // Arrange
      await page.route('/api/documentation-units', async (route) => {
        await route.fulfill({
          json: {
            id: '8de5e4a0-6b67-4d65-98db-efe877a260c4',
            documentNumber: 'KSNR054920707',
          },
        })
      })

      // Action
      await page.goto('/')

      // Assert
      await expect(page.getByText('Rechtsinformationen')).toBeVisible()
      await expect(page.getByText('des Bundes')).toBeVisible()
      // user icon
      await expect(page.getByTestId('iconPermIdentity')).toHaveCount(1)
      await expect(page.getByText('Vorname Nachname')).toBeVisible()
      await expect(page.getByText('BSG')).toHaveCount(1)
      await expect(page.getByText('Übersicht Verwaltungsvorschriften')).toHaveCount(1)
      await expect(page.getByText('Neue Dokumentationseinheit')).toHaveCount(1)
    },
  )

  test(
    'clicking "Neue Dokumentationseinheit", routes to a new documentation unit',
    { tag: ['@RISDEV-6041'] },
    async ({ page }) => {
      // Arrange
      await page.route('/api/documentation-units', async (route) => {
        await route.fulfill({
          json: {
            id: '8de5e4a0-6b67-4d65-98db-efe877a260c4',
            documentNumber: 'KSNR054920707',
          },
        })
      })

      // Action
      await page.goto('/')
      await page.getByText('Neue Dokumentationseinheit').click()

      // Assert
      // this needs to change when KSNR are generated dynamically
      await expect(page).toHaveURL('/documentUnit/KSNR054920707/fundstellen')
    },
  )

  test(
    'Creates 2 documentation units and expects at least 2 on start page',
    { tag: ['@RISDEV-7787'] },
    async ({ page }) => {
      // given

      // when
      await page.goto('/')
      await page.getByText('Neue Dokumentationseinheit').click()
      await page.getByRole('button', { name: 'Speichern', exact: true }).click()
      const documentNumber1 = page
        .url()
        .split('/')
        .filter((urlPart) => urlPart.startsWith('KSNR'))[0]
      await page.goto('/')
      await page.getByText('Neue Dokumentationseinheit').click()
      await page.getByRole('button', { name: 'Speichern', exact: true }).click()
      const documentNumber2 = page
        .url()
        .split('/')
        .filter((urlPart) => urlPart.startsWith('KSNR'))[0]
      await page.goto('/')

      // then
      await expect(page.getByText(documentNumber1)).toHaveCount(1)
      await expect(page.getByText(documentNumber2)).toHaveCount(1)
    },
  )

  test(
    'Counts 100 entries in the list of documentation units.',
    { tag: ['@RISDEV-7601'] },
    async ({ page }) => {
      // given
      await page.goto('/')
      // when
      // then
      await expect(page.getByText('KSNR')).toHaveCount(100)
    },
  )

  test(
    'Switches over to the second page of search entries, finds at least one other entry and switches back.',
    { tag: ['@RISDEV-7601'] },
    async ({ page }) => {
      // given
      await page.goto('/')

      // when
      await page.getByRole('button', { name: 'Weiter', exact: true }).click()

      // then
      expect(await page.getByText('KSNR').count()).toBeGreaterThanOrEqual(1)

      // when
      await page.getByRole('button', { name: 'Zurück', exact: true }).click()

      // then
      await expect(page.getByRole('button', { name: 'Zurück', exact: true })).toHaveCount(0)
    },
  )

  test(
    'Start editing documentation unit from the search results',
    { tag: ['@RISDEV-7601'] },
    async ({ page }) => {
      // given
      await page.goto('/')

      // when
      await page
        .getByRole('button', {
          name: /Dokument KSNR\d+ editieren/i,
        })
        .first()
        .click()

      // then
      await expect(page.getByRole('button', { name: 'Speichern', exact: true })).toHaveCount(1)
    },
  )

  test(
    'Add a document, check if is indexed, change it, check if re-indexed.',
    { tag: ['@RISDEV-7601'] },
    async ({ page }) => {
      // given
      await page.goto('/')

      // when
      await page.getByText('Neue Dokumentationseinheit').click()
      await page.waitForURL(/documentUnit/)
      await page.getByRole('button', { name: 'Speichern', exact: true }).click()
      const documentNumber = page
        .url()
        .split('/')
        .filter((urlPart) => urlPart.startsWith('KSNR'))[0]
      await page.getByText('Rubriken').click()
      const langue = page.getByRole('textbox', { name: 'Amtl. Langüberschrift' })
      const text1 = 'reindextest' + Date.now().toString()
      await langue.fill(text1)
      await page.getByRole('button', { name: 'Speichern', exact: true }).click()
      await page.goto('/')

      // then
      await expect(page.getByText(text1)).toHaveCount(1)

      // when
      await page
        .getByRole('button', {
          name: 'Dokument ' + documentNumber + ' editieren',
        })
        .click()
      await page.getByText('Rubriken').click()
      const text2 = 'reindextest' + Date.now().toString()
      await langue.fill(text2)
      await page.getByRole('button', { name: 'Speichern', exact: true }).click()
      await page.goto('/')

      // then
      await expect(page.getByText(text2)).toHaveCount(1)
    },
  )
})
