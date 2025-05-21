import { test, expect } from '@playwright/test'

test.describe('RubrikenPage - Verweise (on Verwaltungsvorschrift) with mocked routes', () => {
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

  test('Add an active reference, edit and save', { tag: ['@RISDEV-6074'] }, async ({ page }) => {
    // given
    await page.goto('/documentUnit/KSNR054920707/fundstellen')
    await page.getByText('Rubriken').click()
    await expect(page.getByText('Rubriken')).toHaveCount(1)
    const referenceTypeElement = page
      .getByTestId('activeReferences')
      .getByRole('textbox', { name: 'Art der Verweisung' })
    await expect(referenceTypeElement).toHaveCount(1)
    const activeReferenceElement = page
      .getByTestId('activeReferences')
      .getByRole('textbox', { name: 'RIS-Abkürzung' })
    await expect(activeReferenceElement).toHaveCount(1)

    await expect(page.getByRole('radio', { name: 'Norm auswählen' })).toHaveCount(1)
    await expect(page.getByRole('radio', { name: 'Verwaltungsvorschrift auswählen' })).toHaveCount(
      1,
    )

    // when
    await referenceTypeElement.click()
    await expect(page.getByText('Neuregelung')).toBeVisible()
    await page.getByText('Neuregelung').click()
    await activeReferenceElement.click()
    await expect(page.getByText('KVLG')).toBeVisible()
    await page.getByText('KVLG').click()
    await page.getByRole('textbox', { name: 'Einzelnorm der Norm' }).fill('§ 2')
    await page.getByRole('button', { name: 'Verweis speichern' }).click()
    await expect(page.getByText('Neuregelung | KVLG, § 2')).toHaveCount(1)

    await page.getByTestId('list-entry-0').click()

    // the radio buttons shall be gone as one cannot switch after creating
    await expect(page.getByRole('radio', { name: 'Norm auswählen' })).toHaveCount(0)
    await expect(page.getByRole('radio', { name: 'Verwaltungsvorschrift auswählen' })).toHaveCount(
      0,
    )

    await page.getByRole('textbox', { name: 'Fassungsdatum' }).fill('27.01.2025')
    await page.getByRole('button', { name: 'Verweis speichern' }).click()

    // then
    await expect(page.getByText('Neuregelung | KVLG, § 2, 27.01.2025')).toHaveCount(1)
  })

  test(
    'Add two active references, delete the first item',
    { tag: ['@RISDEV-6074'] },
    async ({ page }) => {
      // given
      await page.goto('/documentUnit/KSNR054920707/fundstellen')
      await page.getByText('Rubriken').click()
      await expect(page.getByText('Rubriken')).toHaveCount(1)
      const referenceTypeElement = page
        .getByTestId('activeReferences')
        .getByRole('textbox', { name: 'Art der Verweisung' })
      await expect(referenceTypeElement).toHaveCount(1)
      const activeReferenceElement = page
        .getByTestId('activeReferences')
        .getByRole('textbox', { name: 'RIS-Abkürzung' })
      await expect(activeReferenceElement).toHaveCount(1)

      // when
      await referenceTypeElement.click()
      await expect(page.getByText('Anwendung')).toBeVisible()
      await page.getByText('Anwendung').click()

      await activeReferenceElement.click()
      await expect(page.getByText('SGB 5')).toBeVisible()
      await page.getByText('SGB 5').click()
      await page.getByRole('textbox', { name: 'Einzelnorm der Norm' }).fill('1991, Seite 92')
      await page.getByRole('button', { name: 'Verweis speichern' }).click()

      await referenceTypeElement.click()
      await expect(page.getByText('Rechtsgrundlage')).toBeVisible()
      await page.getByText('Rechtsgrundlage').click()

      await activeReferenceElement.click()
      await expect(page.getByText('KVLG')).toBeVisible()
      await page.getByText('KVLG').click()
      await page.getByRole('textbox', { name: 'Einzelnorm der Norm' }).fill('§ 2')
      await page.getByRole('button', { name: 'Verweis speichern' }).click()
      await page.getByTestId('list-entry-0').click()
      await page.getByText('Eintrag löschen').click()

      // then
      await expect(page.getByText('SGB 5, 1991, Seite 92')).toHaveCount(0)
      await expect(page.getByText('Rechtsgrundlage | KVLG, § 2')).toHaveCount(1)
    },
  )

  test(
    'type of active reference is not editable after save',
    { tag: ['@RISDEV-6074'] },
    async ({ page }) => {
      // given
      await page.goto('/documentUnit/KSNR054920707/fundstellen')
      await page.getByRole('link', { name: 'Rubriken' }).click()
      await page.getByRole('radio', { name: 'Verwaltungsvorschrift auswä' }).click()
      await page.getByRole('textbox', { name: 'Art der Verweisung' }).click()
      await page
        .getByRole('button', { name: 'dropdown-option' })
        .filter({ hasText: 'Anwendung' })
        .click()
      await page.getByRole('textbox', { name: 'Suche nach Verwaltungsvorschrift' }).click()
      await page
        .getByRole('button', { name: 'dropdown-option' })
        .filter({ hasText: 'SGB 5Sozialgesetzbuch (SGB) F' })
        .click()
      await page.getByRole('textbox', { name: 'Fassungsdatum der Norm' }).click()
      await page.getByRole('textbox', { name: 'Fassungsdatum der Norm' }).fill('12.12.2024')
      await page.getByRole('button', { name: 'Verweis speichern' }).click()

      // when
      await page.getByTestId('list-entry-0').click()

      // then
      await expect(page.getByRole('radio', { name: 'Verwaltungsvorschrift auswä' })).toHaveCount(0)
    },
  )
})

test.describe('RubrikenPage - Verweise (on Verwaltungsvorschrift)', () => {
  test('Verweise persist during reload when saved', { tag: ['@RISDEV-6308'] }, async ({ page }) => {
    // given
    await page.goto('/')
    await page.getByText('Neue Dokumentationseinheit').click()
    await page.getByText('Rubriken').click()
    await expect(page.getByText('Rubriken')).toHaveCount(1)
    const referenceTypeElement = page
      .getByTestId('activeReferences')
      .getByRole('textbox', { name: 'Art der Verweisung' })
    await expect(referenceTypeElement).toHaveCount(1)
    const activeReferenceElement = page
      .getByTestId('activeReferences')
      .getByRole('textbox', { name: 'RIS-Abkürzung' })
    await expect(activeReferenceElement).toHaveCount(1)

    await expect(page.getByRole('radio', { name: 'Norm auswählen' })).toHaveCount(1)
    await expect(page.getByRole('radio', { name: 'Verwaltungsvorschrift auswählen' })).toHaveCount(
      1,
    )

    // when
    await referenceTypeElement.click()
    await expect(page.getByText('Neuregelung')).toBeVisible()
    await page.getByText('Neuregelung').click()
    await activeReferenceElement.click()
    await expect(page.getByText('KVLG')).toBeVisible()
    await page.getByText('KVLG').click()
    await page.getByRole('textbox', { name: 'Einzelnorm der Norm' }).fill('§ 2')
    await page.getByRole('button', { name: 'Verweis speichern' }).click()
    await expect(page.getByText('Neuregelung | KVLG, § 2')).toHaveCount(1)

    // when
    await page.getByText('Speichern').click()
    await page.reload()

    // then
    await expect(page.getByText('Neuregelung | KVLG, § 2')).toHaveCount(1)
  })
})

test.describe('RubrikenPage - Verweise - Bestandsdaten', () => {
  test(
    'Load test documentation unit and expect two Verweise',
    { tag: ['@RISDEV-7639'] },
    async ({ page }) => {
      // given

      // when
      await page.goto('/documentUnit/KSNR999999999/rubriken')

      // then
      await expect(page.getByText('Rechtsgrundlage | PhanGB, § 1a Abs 1')).toHaveCount(1)
      await expect(page.getByText('Rechtsgrundlage | PhanGB, § 2 Abs 6')).toHaveCount(1)
    },
  )
})
