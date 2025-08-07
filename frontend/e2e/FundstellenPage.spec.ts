import { expect, test } from '@playwright/test'
import { type DocumentUnit } from '../src/domain/documentUnit.js'

// See here how to get started:
// https://playwright.dev/docs/intro
test.describe('FundstellenPage', () => {
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
    'Visiting the app root url and clicking "Neue Dokumentationseinheit", the view shows the title "Fundstellen", two input fields, a sidebar navigation panel and a save button',
    { tag: ['@RISDEV-6042'] },
    async ({ page }) => {
      // Arrange
      // Action
      await page.goto('/documentUnit/KSNR054920707/fundstellen')

      // Assert
      await expect(page.getByText('Fundstellen')).toHaveCount(2)
      await expect(page.getByText('KSNR054920707')).toHaveCount(1)
      await expect(page.getByText('Unveröffentlicht')).toHaveCount(1)
      await expect(page.getByText('Fundstellen')).toHaveCount(2)
      await expect(page.getByTestId('save-button')).toHaveCount(1)
      await expect(page.getByText('Periodikum')).toHaveCount(1)
      await expect(page.getByText('Zitatstelle')).toHaveCount(1)
      await expect(page.getByRole('textbox')).toHaveCount(1)
    },
  )

  test(
    'Visiting the "Fundstellen" page and add a fundstelle',
    { tag: ['@RISDEV-6042'] },
    async ({ page }) => {
      // Arrange
      await page.goto('/documentUnit/KSNR054920707/fundstellen')

      // Action
      await page.getByRole('combobox', { name: 'Periodikum' }).fill('Die')
      await page.getByText('ABc | Die Beispieler').click()
      await page.getByRole('textbox', { name: 'Zitatstelle' }).fill('2024, Seite 24')
      await page.getByText('Übernehmen').click()

      // Assert
      await expect(page.getByText('ABc 2024, Seite 24')).toHaveCount(1)
    },
  )

  test(
    'Visiting the "Fundstellen" page, add a fundstelle, edit and close',
    { tag: ['@RISDEV-6042'] },
    async ({ page }) => {
      // Arrange
      await page.goto('/documentUnit/KSNR054920707/fundstellen')

      // Action
      await page.getByRole('combobox', { name: 'Periodikum' }).fill('Die')
      await page.getByText('ABc | Die Beispieler').click()
      await page.getByRole('textbox', { name: 'Zitatstelle' }).fill('1991, Seite 92')
      await page.getByText('Übernehmen').click()
      await page.getByRole('button', { name: 'Fundstelle Editieren' }).click()
      await page.getByText('Abbrechen').click()

      // Asser
      await expect(page.getByText('ABc 1991, Seite 92')).toHaveCount(1)
    },
  )

  test(
    'Visiting the "Fundstellen" page, select a Fundstelle - now the citation style shall be shown',
    { tag: ['@RISDEV-6312'] },
    async ({ page }) => {
      // Arrange
      await page.goto('/documentUnit/KSNR054920707/fundstellen')

      // Action
      await page.getByRole('combobox', { name: 'Periodikum' }).fill('Die')
      await page.getByText('BKK | Die Betriebskrankenkasse').click()

      // Assert
      await expect(page.getByText('Zitierbeispiel: 1969, 138-140')).toHaveCount(1)
    },
  )

  test(
    'Visiting the "Fundstellen" page, add two item of fundstelle, delete the first item',
    { tag: ['@RISDEV-6042'] },
    async ({ page }) => {
      // Arrange
      await page.goto('/documentUnit/KSNR054920707/fundstellen')

      // Action
      await page.getByRole('combobox', { name: 'Periodikum' }).fill('Die')
      await page.getByText('ABc | Die Beispieler').click()
      await page.getByRole('textbox', { name: 'Zitatstelle' }).fill('1991, Seite 92')
      await page.getByText('Übernehmen').click()
      await page.getByRole('button', { name: 'Fundstelle hinzufügen' }).click()

      await page.getByRole('combobox', { name: 'Periodikum' }).fill('Die')
      await page.getByText('BKK | Die Betriebskrankenkasse').click()
      await page.getByRole('textbox', { name: 'Zitatstelle' }).fill('2001, Seite 21')
      await page.getByText('Übernehmen').click()

      await page
        .getByRole('listitem')
        .filter({ hasText: 'ABc 1991, Seite' })
        .getByLabel('Fundstelle Editieren')
        .click()
      await page.getByText('Eintrag löschen').click()

      // Assert
      await expect.soft(page.getByText('ABc 1991, Seite 92')).toHaveCount(0)
      await expect(page.getByText('BKK 2001, Seite 21')).toHaveCount(1)
    },
  )

  test.skip(
    'Periodikum and Zitatstelle are mandatory fields',
    { tag: ['@RISDEV-7978'] },
    async ({ page }) => {
      // Arrange
      await page.goto('/documentUnit/KSNR054920707/fundstellen')

      // When
      await page.getByRole('combobox', { name: 'Periodikum' }).fill('Die')
      await page.getByText('ABc | Die Beispieler').click()
      await page.getByRole('button', { name: 'Fundstelle speichern' }).click()

      // Then
      await expect(page.getByRole('textbox', { name: 'Zitatstelle' })).toHaveAttribute(
        'aria-invalid',
        'true',
      )
      await expect(page.getByText('Pflichtfeld nicht befüllt')).toBeVisible()

      // When
      await page.getByRole('textbox', { name: 'Zitatstelle' }).fill('2001, Seite 21')
      await page.getByRole('button', { name: 'Auswahl zurücksetzen' }).click()
      await page.keyboard.press('Tab')
      await page.getByRole('button', { name: 'Fundstelle speichern' }).click()

      // Then
      await expect(page.getByRole('textbox', { name: 'Periodikum' })).toHaveAttribute(
        'invalid',
        'true',
      )
      await expect(page.getByText('Pflichtfeld nicht befüllt')).toBeVisible()
    },
  )
})

test.describe('FundstellenPageSaveAndLoad', () => {
  test(
    'Create document, enter data, save, back to start page, reload the URL, expect the data from before',
    { tag: ['@RISDEV-6493'] },
    async ({ page }) => {
      // Arrange
      // Mock the POST request (create)
      await page.route('/api/documentation-units', async (route) => {
        await route.fulfill({
          json: {
            id: '8de5e4a0-6b67-4d65-98db-efe877a260c4',
            documentNumber: 'KSNR054920707',
          },
        })
      })
      // Mock the GET request
      await page.route('/api/documentation-units/KSNR054920707', async (route) => {
        const documentUnit: DocumentUnit = {
          id: '8de5e4a0-6b67-4d65-98db-efe877a260c4',
          documentNumber: 'KSNR054920707',
          references: [],
          fieldsOfLaw: [],
          note: '',
        }
        const json = {
          documentNumber: 'KSNR054920707',
          id: '8de5e4a0-6b67-4d65-98db-efe877a260c4',
          json: documentUnit,
        }
        await route.fulfill({ json })
      })

      // Action
      await page.goto('/')
      await page.getByText('Neue Dokumentationseinheit').click()
      await page.getByRole('combobox', { name: 'Periodikum' }).fill('Die')
      await page.getByText('ABc | Die Beispieler').click()
      await page.getByRole('textbox', { name: 'Zitatstelle' }).fill('1991, Seite 92')
      await page.getByText('Übernehmen').click()
      // Mock the PUT and GET requests again
      await page.unrouteAll()
      await page.route('/api/documentation-units/KSNR054920707', async (route) => {
        const documentUnit: DocumentUnit = {
          id: '8de5e4a0-6b67-4d65-98db-efe877a260c4',
          documentNumber: 'KSNR054920707',
          fundstellen: [
            {
              id: 'fundstelleTestId',
              zitatstelle: '1991, Seite 92',
              periodikum: {
                id: 'periodikumTestId',
                abbreviation: 'ABc',
                title: 'Die Beispieler',
              },
            },
          ],
          fieldsOfLaw: [],
          note: '',
        }
        const json = {
          documentNumber: 'KSNR054920707',
          id: '8de5e4a0-6b67-4d65-98db-efe877a260c4',
          json: documentUnit,
        }
        await route.fulfill({ json })
      })
      await page.getByRole('button', { name: 'Speichern', exact: true }).click()
      await page.goto('/')
      await expect(page.getByText('Neue Dokumentationseinheit')).toBeVisible()
      await page.goto('/documentUnit/KSNR054920707/fundstellen')

      // Assert
      await expect(page.getByText('ABc 1991, Seite 92')).toHaveCount(1)
    },
  )
})

test.describe('FundstellenPage - Bestandsdaten', () => {
  test.skip(
    'Load test documentation unit and expect fundstellen',
    { tag: ['@RISDEV-7639'] },
    async ({ page }) => {
      // given
      await page.goto('/documentUnit/KSNR999999999/fundstellen')

      // then
      await expect(page.getByText('Das Periodikum 2021, Seite 15')).toHaveCount(1)
    },
  )

  test(
    'Load test documentation unit root and get redirected to fundstellen page',
    { tag: ['@RISDEV-7089'] },
    async ({ page }) => {
      // given

      // when
      await page.goto('/documentUnit/KSNR999999999')

      // then
      await expect(page).toHaveURL(/\/documentUnit\/KSNR999999999\/fundstellen/)
    },
  )
})
