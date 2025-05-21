import { test, expect } from '@playwright/test'

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
    await page.getByText('Rubriken').click()
    const artDerZitierungInput = page.getByRole('textbox', { name: 'Art der Zitierung' })
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
    await page.getByRole('textbox', { name: 'Gericht Aktivzitierung' }).click()
    await page
      .getByRole('button', { name: 'dropdown-option' })
      .filter({ hasText: 'AG Aachen' })
      .click()
    await page.getByRole('button', { name: 'Aktivzitierung speichern' }).click()
    await expect(page.getByText('Ablehnung, AG Aachen')).toBeVisible()
    await expect(page.getByText('Fehlende Daten')).toBeVisible()

    await page.getByTestId('list-entry-0').click()
    await expect(page.getByText('Pflichtfeld nicht befüllt')).toHaveCount(2)
    await page.getByRole('textbox', { name: 'Entscheidungsdatum' }).fill('15.01.2025')
    await page.getByRole('button', { name: 'Aktivzitierung speichern' }).click()
    await expect(page.getByText('Ablehnung, AG Aachen, 15.01.2025')).toBeVisible()
    await expect(page.getByText('Fehlende Daten')).toBeVisible()

    await page.getByTestId('list-entry-0').click()
    await expect(page.getByText('Pflichtfeld nicht befüllt')).toHaveCount(1)
    await page.getByRole('textbox', { name: 'Aktenzeichen Aktivzitierung' }).fill('Az1')
    await page.getByRole('button', { name: 'Aktivzitierung speichern' }).click()
    await expect(page.getByText('Ablehnung, AG Aachen, 15.01.2025, Az1')).toBeVisible()
    await expect(page.getByText('Fehlende Daten')).toHaveCount(0)
  })

  test(
    'Add two active citations, delete the first item',
    { tag: ['@RISDEV-6077'] },
    async ({ page }) => {
      await page.goto('/documentUnit/KSNR054920707/fundstellen')
      await page.getByText('Rubriken').click()

      await page.getByRole('textbox', { name: 'Art der Zitierung' }).click()
      await page
        .getByRole('button', { name: 'dropdown-option' })
        .filter({ hasText: 'Ablehnung' })
        .click()
      await page.getByRole('textbox', { name: 'Gericht Aktivzitierung' }).click()
      await page
        .getByRole('button', { name: 'dropdown-option' })
        .filter({ hasText: 'AG Aachen' })
        .click()
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
      await page.getByRole('textbox', { name: 'Gericht Aktivzitierung' }).click()
      await page
        .getByRole('button', { name: 'dropdown-option' })
        .filter({ hasText: 'Berufsgericht für Architekten Bremen' })
        .click()
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
      await page.getByText('Rubriken').click()

      await page.getByRole('textbox', { name: 'Art der Zitierung' }).click()
      await page
        .getByRole('button', { name: 'dropdown-option' })
        .filter({ hasText: 'Übernahme' })
        .click()
      await page.getByRole('button', { name: 'Nach Entscheidung suchen' }).click()
      await expect(
        page.getByText('label1, 01.02.2022, test fileNumber1, Verwaltungsvorschrift'),
      ).toBeVisible()
      await page.getByRole('button', { name: 'Treffer übernehmen' }).click()
      await expect(
        page.getByText('Übernahme, label1, 01.02.2022, test fileNumber1, Verwaltungsvorschrift'),
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
        page.getByText('Übernahme, label1, 01.02.2022, test fileNumber1, Verwaltungsregelung'),
      ).toBeVisible()

      await page.getByTestId('list-entry-0').click()
      await page.getByRole('button', { name: 'Nach Entscheidung suchen' }).click()
      await expect(page.getByText('Bereits hinzugefügt')).toBeVisible()

      await page.getByTestId('activeCitations').getByRole('button', { name: 'Abbrechen' }).click()
      await expect(page.getByRole('textbox', { name: 'Art der Zitierung' })).toHaveCount(0)
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
      await page.getByText('Rubriken').click()
      const artDerZitierungInput = page.getByRole('textbox', { name: 'Art der Zitierung' })
      await expect(artDerZitierungInput).toHaveCount(1)

      await artDerZitierungInput.click()
      await page
        .getByRole('button', { name: 'dropdown-option' })
        .filter({ hasText: 'Ablehnung' })
        .click()
      await page.getByRole('textbox', { name: 'Gericht Aktivzitierung' }).click()
      await page
        .getByRole('button', { name: 'dropdown-option' })
        .filter({ hasText: 'AG Aachen' })
        .click()
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

      // then
      await expect(page.getByText('PhanGH, 20.10.2021, C-01/02 | WBRE000001234')).toHaveCount(1)
    },
  )
})
