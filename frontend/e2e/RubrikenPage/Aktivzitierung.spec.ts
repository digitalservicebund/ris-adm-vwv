import { test, expect } from '@playwright/test'
import dayjs from 'dayjs'

test.describe('RubrikenPage - Aktivzitierung - Mocked routes', () => {
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

  test('Add an active citation, edit and save', { tag: ['@RISDEV-6077'] }, async ({ page }) => {
    await page.goto('/documentUnit/KSNR054920707/fundstellen')
    await page.getByRole('link', { name: 'Rubriken' }).click()
    const artDerZitierungInput = page.getByText('Art der Zitierung *')
    await expect(artDerZitierungInput).toHaveCount(1)

    await artDerZitierungInput.click()
    await page
      .getByRole('button', { name: 'dropdown-option' })
      .filter({ hasText: 'Ablehnung' })
      .click()
    await page.getByRole('button', { name: 'Aktivzitierung speichern' }).click()
    await expect(page.getByText('Fehlende Daten')).toBeVisible()

    await page.getByTestId('list-entry-0').click()
    await expect(page.getByText('Pflichtfeld nicht befüllt')).toHaveCount(3)
    // await page.getByText('Gericht *').click()
    await page.getByRole('combobox', { name: 'Gericht Aktivzitierung' }).click()
    await page.getByText('AG Aachen').click()
    await page.getByRole('button', { name: 'Aktivzitierung speichern' }).click()
    await expect(page.getByText('Ablehnung, AG Aachen')).toBeVisible()
    await expect(page.getByText('Fehlende Daten')).toBeVisible()

    await page.getByTestId('list-entry-0').click()
    await expect(page.getByText('Pflichtfeld nicht befüllt')).toHaveCount(2)
    await page.getByText('Entscheidungsdatum *').fill('15.01.2025')
    await page.getByRole('button', { name: 'Aktivzitierung speichern' }).click()
    await expect(page.getByText('Ablehnung, AG Aachen, 15.01.2025')).toBeVisible()
    await expect(page.getByText('Fehlende Daten')).toBeVisible()

    await page.getByTestId('list-entry-0').click()
    await expect(page.getByText('Pflichtfeld nicht befüllt')).toHaveCount(1)
    await page.getByText('Aktenzeichen *').fill('Az1')
    await page.getByRole('button', { name: 'Aktivzitierung speichern' }).click()
    await expect(page.getByText('Ablehnung, AG Aachen, 15.01.2025, Az1')).toBeVisible()
    await expect(page.getByText('Fehlende Daten')).toHaveCount(0)
  })

  test(
    'Entscheidungsdatum: Invalid, incomplete or future date cannot be entered',
    { tag: ['@RISDEV-8908'] },
    async ({ page }) => {
      // given
      await page.goto('/')
      await page.getByText('Neue Dokumentationseinheit').click()
      await page.waitForURL(/documentUnit/)
      await page.getByRole('link', { name: 'Rubriken' }).click()

      const datumElement = page.getByText('Entscheidungsdatum *')
      await expect(datumElement).toHaveCount(1)

      // when
      await datumElement.fill('thatshouldnotwork')
      // then
      await expect(datumElement).toHaveValue('__.__.____')

      // when
      await datumElement.fill('99.99.9999{Tab}')
      // then
      await expect(page.getByText('Kein valides Datum')).toBeVisible()

      // when
      await datumElement.fill('20.12.20')
      await page.keyboard.press('Tab')
      // then
      await expect(page.getByText('Unvollständiges Datum')).toBeVisible()

      // when
      const tomorrow = dayjs().add(1, 'day').format('DD.MM.YYYY')
      await datumElement.fill(`${tomorrow}{Tab}`)
      // then
      await expect(page.getByText('Das Datum darf nicht in der Zukunft liegen')).toBeVisible()
    },
  )

  test(
    'Add two active citations, delete the first item',
    { tag: ['@RISDEV-6077'] },
    async ({ page }) => {
      await page.goto('/documentUnit/KSNR054920707/fundstellen')
      await page.getByRole('link', { name: 'Rubriken' }).click()

      await page.getByRole('textbox', { name: 'Art der Zitierung' }).click()
      await page
        .getByRole('button', { name: 'dropdown-option' })
        .filter({ hasText: 'Ablehnung' })
        .click()
      await page.getByRole('combobox', { name: 'Gericht Aktivzitierung' }).click()
      await page.getByText('AG Aachen').click()
      await page.getByRole('textbox', { name: 'Entscheidungsdatum' }).fill('15.01.2025')
      await page.getByRole('textbox', { name: 'Aktenzeichen Aktivzitierung' }).fill('Az1')
      await page.getByRole('button', { name: 'Aktivzitierung speichern' }).click()
      await expect(page.getByText('Ablehnung, AG Aachen, 15.01.2025, Az1')).toBeVisible()
      await expect(page.getByText('Fehlende Daten')).toHaveCount(0)

      await page.getByRole('textbox', { name: 'Art der Zitierung' }).click()
      await page
        .getByRole('button', { name: 'dropdown-option' })
        .filter({ hasText: 'Übernahme' })
        .click()
      await page.getByRole('combobox', { name: 'Gericht Aktivzitierung' }).click()
      await page.getByText('Berufsgericht für Architekten Bremen').click()
      await page.getByRole('textbox', { name: 'Entscheidungsdatum' }).fill('31.12.2024')
      await page.getByRole('textbox', { name: 'Aktenzeichen Aktivzitierung' }).fill('Az2')
      await page.getByRole('button', { name: 'Aktivzitierung speichern' }).click()
      await expect(
        page.getByText('Übernahme, Berufsgericht für Architekten Bremen, 31.12.2024, Az2'),
      ).toBeVisible()
      await expect(page.getByText('Fehlende Daten')).toHaveCount(0)

      await page.getByTestId('list-entry-1').click()
      await page.getByRole('button', { name: 'Eintrag löschen' }).click()
      await expect(page.getByText('Ablehnung, AG Aachen, 15.01.2025, Az1')).toBeVisible()
      await expect(
        page.getByText('Übernahme, Berufsgericht für Architekten Bremen, 31.12.2024, Az2'),
      ).toHaveCount(0)
    },
  )

  test(
    'Search active citation, take it, change type, save, search again and cancel because already added',
    { tag: ['@RISDEV-6077'] },
    async ({ page }) => {
      await page.goto('/documentUnit/KSNR054920707/fundstellen')
      await page.getByRole('link', { name: 'Rubriken' }).click()

      await page.getByRole('textbox', { name: 'Art der Zitierung' }).click()
      await page
        .getByRole('button', { name: 'dropdown-option' })
        .filter({ hasText: 'Übernahme' })
        .click()
      await page.getByRole('button', { name: 'Nach Entscheidung suchen' }).click()
      await expect(
        page.getByText('type1 location1, 01.02.2022, test fileNumber1, Verwaltungsvorschrift'),
      ).toBeVisible()
      await page.getByRole('button', { name: 'Treffer übernehmen' }).click()
      await expect(
        page.getByText(
          'Übernahme, type1 location1, 01.02.2022, test fileNumber1, Verwaltungsvorschrift',
        ),
      ).toBeVisible()

      // re-open the same record
      await page.getByTestId('list-entry-0').click()

      // by clicking into the input, there shall be no drop down suggestions
      await page.getByRole('textbox', { name: 'Dokumenttyp Aktivzitierung' }).click()
      await expect(
        page.getByRole('button', { name: 'dropdown-option' }).filter({ hasText: 'VR' }),
      ).toHaveCount(0)

      // but when deleting input content then option VR shall appear
      await page.keyboard.press('Backspace')
      await expect(
        page.getByRole('button', { name: 'dropdown-option' }).filter({ hasText: 'VR' }),
      ).toBeVisible()

      // click this option and save it
      await page.getByRole('button', { name: 'dropdown-option' }).filter({ hasText: 'VR' }).click()
      await page.getByRole('button', { name: 'Aktivzitierung speichern' }).click()

      // then
      await expect(
        page.getByText(
          'Übernahme, type1 location1, 01.02.2022, test fileNumber1, Verwaltungsregelung',
        ),
      ).toBeVisible()

      await page.getByTestId('list-entry-0').click()
      await page.getByRole('button', { name: 'Nach Entscheidung suchen' }).click()
      await expect(page.getByText('Bereits hinzugefügt')).toBeVisible()

      await page.getByTestId('activeCitations').getByRole('button', { name: 'Abbrechen' }).click()
      await expect(page.getByRole('textbox', { name: 'Art der Zitierung' })).toHaveCount(0)
    },
  )

  test(
    'An active citation can be copied in the clipboard',
    { tag: ['@RISDEV-8908'] },
    async ({ page }) => {
      // mock clipboard before any page code runs
      await page.addInitScript(() => {
        let _text = ''

        Object.defineProperty(navigator, 'clipboard', {
          value: {
            writeText: async (text: string) => {
              _text = text
            },
            readText: async () => _text,
          },
        })
      })

      // given
      await page.goto('/documentUnit/KSNR054920707/fundstellen')
      await page.getByRole('link', { name: 'Rubriken' }).click()
      const artDerZitierungInput = page.getByText('Art der Zitierung *')
      await artDerZitierungInput.click()
      await page
        .getByRole('button', { name: 'dropdown-option' })
        .filter({ hasText: 'Ablehnung' })
        .click()
      await page.getByRole('combobox', { name: 'Gericht Aktivzitierung' }).click()
      await page.getByText('AG Aachen').click()
      await page.getByRole('button', { name: 'Aktivzitierung speichern' }).click()
      await expect(page.getByText('Ablehnung, AG Aachen')).toBeVisible()

      // when
      await page
        .getByRole('button', { name: 'Aktivzitierung in die Zwischenablage kopieren' })
        .click()
      // then
      const clipboardValue = await page.evaluate(() => navigator.clipboard.readText())
      expect(clipboardValue).toBe('Ablehnung, AG Aachen')
    },
  )
})

test.describe('RubrikenPage - Aktivzitierung', () => {
  test(
    'Data of Aktivzitierung persists during reload when saved',
    { tag: ['@RISDEV-6309'] },
    async ({ page }) => {
      // given
      await page.goto('/')
      await page.getByRole('button', { name: 'Neue Dokumentationseinheit' }).click()
      await page.getByRole('link', { name: 'Rubriken' }).click()
      const artDerZitierungInput = page.getByRole('textbox', { name: 'Art der Zitierung' })
      await expect(artDerZitierungInput).toHaveCount(1)

      await artDerZitierungInput.click()
      await page
        .getByRole('button', { name: 'dropdown-option' })
        .filter({ hasText: 'Ablehnung' })
        .click()
      await page.getByRole('combobox', { name: 'Gericht Aktivzitierung' }).click()
      await page.getByText('AG Aachen').click()
      await page.getByRole('textbox', { name: 'Entscheidungsdatum' }).fill('15.01.2025')
      await page.getByRole('textbox', { name: 'Aktenzeichen Aktivzitierung' }).fill('Az1')
      await page.getByRole('button', { name: 'Aktivzitierung speichern' }).click()
      await expect(page.getByText('Ablehnung, AG Aachen, 15.01.2025, Az1')).toBeVisible()

      // when
      await page.getByText('Speichern').click()
      await page.reload()

      // then
      await expect(page.getByText('Ablehnung, AG Aachen, 15.01.2025, Az1')).toBeVisible()
    },
  )
})

test.describe('RubrikenPage - Aktivzitierung - Bestandsdaten', () => {
  test(
    'Load test documentation unit and expect one Aktivzitierung',
    { tag: ['@RISDEV-7639'] },
    async ({ page }) => {
      // given

      // when
      await page.goto('/documentUnit/KSNR999999999/rubriken')
      await page.waitForURL(/documentUnit/)

      // then
      await expect(page.getByText('AG Aachen, 20.10.2021, C-01/02 | WBRE000001234')).toHaveCount(1)
    },
  )
})
