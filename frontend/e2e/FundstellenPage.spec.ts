import { expect, test } from '@playwright/test'
import { type DocumentUnit } from '../src/domain/documentUnit.js'
import Reference from '../src/domain/reference.js'
import LegalPeriodical from '../src/domain/legalPeriodical.js'

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
      await expect(page.getByRole('textbox')).toHaveCount(2)
    },
  )

  test(
    'Visiting the "Fundstellen" page and add a fundstelle',
    { tag: ['@RISDEV-6042'] },
    async ({ page }) => {
      // Arrange
      await page.goto('/documentUnit/KSNR054920707/fundstellen')

      // Action
      await page.getByRole('button', { name: 'Dropdown öffnen' }).click()
      await page.getByText('BAnz | Bundesanzeiger').click()
      await page.getByRole('textbox', { name: 'Zitatstelle' }).fill('2024, Seite 24')
      await page.getByText('Übernehmen').click()

      // Assert
      await expect(page.getByText('BAnz 2024, Seite 24')).toHaveCount(1)
    },
  )

  test(
    'Visiting the "Fundstellen" page, add a fundstelle, edit and close',
    { tag: ['@RISDEV-6042'] },
    async ({ page }) => {
      // Arrange
      await page.goto('/documentUnit/KSNR054920707/fundstellen')

      // Action
      await page.getByRole('button', { name: 'Dropdown öffnen' }).click()
      await page.getByText('AA | Arbeitsrecht aktiv').click()
      await page.getByRole('textbox', { name: 'Zitatstelle' }).fill('1991, Seite 92')
      await page.getByText('Übernehmen').click()
      await page.getByTestId('list-entry-0').click()
      await page.getByText('Abbrechen').click()

      // Assert
      await expect(page.getByText('AA 1991, Seite 92')).toHaveCount(1)
    },
  )

  test(
    'Visiting the "Fundstellen" page, add two item of fundstelle, delete the first item',
    { tag: ['@RISDEV-6042'] },
    async ({ page }) => {
      // Arrange
      await page.goto('/documentUnit/KSNR054920707/fundstellen')

      // Action
      await page.getByRole('textbox', { name: 'Periodikum' }).click()
      await page.getByText('AA | Arbeitsrecht aktiv').click()
      await page.getByRole('textbox', { name: 'Zitatstelle' }).fill('1991, Seite 92')
      await page.getByText('Übernehmen').click()

      await page.getByRole('textbox', { name: 'Periodikum' }).click()
      await page.getByText('BAnz | Bundesanzeiger').click()
      await page.getByRole('textbox', { name: 'Zitatstelle' }).fill('2001, Seite 21')
      await page.getByText('Übernehmen').click()

      await page.getByTestId('list-entry-0').click()
      await page.getByText('Eintrag löschen').click()

      // Assert
      await expect.soft(page.getByText('AA 1991, Seite 92')).toHaveCount(0)
      await expect(page.getByText('BAnz 2001, Seite 21')).toHaveCount(1)
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
      await page.getByRole('button', { name: 'Dropdown öffnen' }).click()
      await page.getByText('AA | Arbeitsrecht aktiv').click()
      await page.getByRole('textbox', { name: 'Zitatstelle' }).fill('1991, Seite 92')
      await page.getByText('Übernehmen').click()
      // Mock the PUT and GET requests again
      await page.unrouteAll()
      await page.route('/api/documentation-units/KSNR054920707', async (route) => {
        const legalPeriodical = new LegalPeriodical({
          title: 'Arbeitsrecht aktiv',
          abbreviation: 'AA',
          citationStyle: '2011',
        })
        const reference = new Reference({
          citation: '1991, Seite 92',
          legalPeriodicalRawValue: 'AA',
          legalPeriodical: legalPeriodical,
        })
        const documentUnit: DocumentUnit = {
          id: '8de5e4a0-6b67-4d65-98db-efe877a260c4',
          documentNumber: 'KSNR054920707',
          references: [reference],
          fieldsOfLaw: [],
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
      await page.reload()
      await page.goto('/documentUnit/KSNR054920707/fundstellen')

      // Assert
      await expect(page.getByText('AA 1991, Seite 92')).toHaveCount(1)
    },
  )
})
