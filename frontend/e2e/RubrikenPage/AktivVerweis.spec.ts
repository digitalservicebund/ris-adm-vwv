import { test, expect } from '@playwright/test'
import dayjs from 'dayjs'

test.describe('RubrikenPage - Verweise with mocked routes', () => {
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
    'Clicking on the radio buttons switches the input panel and data persists',
    { tag: ['@RISDEV-7908'] },
    async ({ page }) => {
      // given
      await page.goto('/documentUnit/KSNR054920707/rubriken')
      await expect(page.getByRole('radio', { name: 'Norm auswählen' })).toBeVisible()
      await expect(
        page.getByRole('radio', { name: 'Verwaltungsvorschrift auswählen' }),
      ).toBeVisible()

      // when
      await page.getByRole('radio', { name: 'Norm auswählen' }).click()
      // then
      await expect(page.getByTestId('activeReferences').getByText('RIS-Abkürzung *')).toBeVisible()
      const activeReferenceElement = page
        .getByTestId('activeReferences')
        .getByRole('combobox', { name: 'RIS-Abkürzung' })
      await expect(activeReferenceElement).toHaveCount(1)
      // save and cancel buttons are hidden
      await expect(page.getByRole('button', { name: 'Verweis speichern' })).toBeHidden()
      await expect(page.getByRole('button', { name: 'Abbrechen' })).toBeHidden()

      // when
      await activeReferenceElement.click()
      await expect(page.getByText('SGB 5')).toBeVisible()
      await page.getByText('SGB 5').click()
      // then
      await expect(activeReferenceElement).toHaveValue('SGB 5')
      // save and cancelö buttons are visible
      await expect(page.getByRole('button', { name: 'Verweis speichern' })).toBeVisible()
      await expect(page.getByRole('button', { name: 'Abbrechen' })).toBeVisible()

      // when swichting to vwv
      await page.getByRole('radio', { name: 'Verwaltungsvorschrift auswählen' }).click()
      // then
      await expect(
        page.getByTestId('activeReferences').getByRole('combobox', { name: 'RIS-Abkürzung' }),
      ).toHaveCount(1)

      // when switching back to norm
      await page.getByRole('radio', { name: 'Norm auswählen' }).click()
      // then data has persisted
      await expect(activeReferenceElement).toHaveValue('SGB 5')
    },
  )
})

test.describe('RubrikenPage - Verweise (on Norm) with mocked routes', () => {
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
    'Add a norm verweis, edit it with a new Einzelnorm, delete it',
    { tag: ['@RISDEV-7908'] },
    async ({ page }) => {
      // given
      await page.goto('/documentUnit/KSNR054920707/rubriken')
      const referenceTypeElement = page
        .getByTestId('activeReferences')
        .getByRole('combobox', { name: 'Art der Verweisung' })
      await expect(referenceTypeElement).toHaveCount(1)
      await expect(page.getByText('Art der Verweisung *')).toBeVisible()
      await expect(page.getByTestId('activeReferences').getByText('RIS-Abkürzung *')).toBeVisible()
      const activeReferenceElement = page
        .getByTestId('activeReferences')
        .getByRole('combobox', { name: 'RIS-Abkürzung' })
      await expect(activeReferenceElement).toHaveCount(1)
      await expect(page.getByTestId('activeReferences').getByText('RIS-Abkürzung *')).toBeVisible()

      // when
      await referenceTypeElement.click()
      await expect(page.getByText('Neuregelung')).toBeVisible()
      await page.getByText('Neuregelung').click()
      await activeReferenceElement.click()
      await expect(page.getByText('KVLG')).toBeVisible()
      await page.getByText('KVLG').click()
      await page.getByRole('textbox', { name: 'Einzelnorm der Norm' }).fill('§ 2')
      await page.getByRole('textbox', { name: 'Fassungsdatum' }).fill('27.01.2025')
      await page.getByRole('textbox', { name: 'Jahr der Norm' }).fill('2025')
      await page.getByRole('button', { name: 'Verweis speichern' }).click()

      // then
      await expect(page.getByTestId('list-entry-0')).toBeVisible()
      await expect(page.getByText('Neuregelung | KVLG, § 2, 27.01.2025, 2025')).toHaveCount(1)

      // when
      await page.getByTestId('list-entry-0').click()
      await page.getByRole('textbox', { name: 'Einzelnorm der Norm' }).fill('§ 3')
      await page.getByRole('textbox', { name: 'Fassungsdatum' }).fill('28.01.2025')
      await page.getByRole('textbox', { name: 'Jahr der Norm' }).fill('2025')
      await page.getByRole('button', { name: 'Abbrechen' }).click()
      // then
      await expect(page.getByText('Neuregelung | KVLG, § 2, 27.01.2025, 2025')).toHaveCount(1)

      // when
      await page.getByTestId('list-entry-0').click()
      await page.getByRole('textbox', { name: 'Einzelnorm der Norm' }).fill('§ 3')
      await page.getByRole('textbox', { name: 'Fassungsdatum' }).fill('28.01.2025')
      await page.getByRole('textbox', { name: 'Jahr der Norm' }).fill('2025')
      await page.getByRole('button', { name: 'Verweis speichern' }).click()
      // then
      await expect(page.getByText('Neuregelung | KVLG, § 3, 28.01.2025, 2025')).toHaveCount(1)

      // when
      await page.getByTestId('list-entry-0').click()
      await page.getByRole('button', { name: 'Weitere Einzelnorm' }).click()
      await page.getByRole('textbox', { name: 'Einzelnorm der Norm' }).nth(1).fill('Seite 90')
      await page.getByRole('textbox', { name: 'Fassungsdatum' }).nth(1).fill('27.01.2000')
      await page.getByRole('textbox', { name: 'Jahr der Norm' }).nth(1).fill('2000')
      await page.getByRole('button', { name: 'Verweis speichern' }).click()
      // then
      await expect(
        page.getByText('KVLG, § 3, 28.01.2025, 2025 KVLG, Seite 90, 27.01.2000'),
      ).toHaveCount(1)

      // when
      await page.getByTestId('list-entry-0').click()
      await page.getByRole('button', { name: 'Eintrag löschen' }).click()
      // then
      await expect(
        page.getByText('KVLG, § 3, 28.01.2025, 2025 KVLG, Seite 90, 27.01.2000'),
      ).toHaveCount(0)
    },
  )

  test(
    'Shows validation error when Fassungsdatum and Jahr are in wrong format, cant be saved when invalid',
    { tag: ['@RISDEV-7908'] },
    async ({ page }) => {
      // given
      await page.goto('/documentUnit/KSNR054920707/rubriken')

      // when
      await page
        .getByTestId('activeReferences')
        .getByRole('combobox', { name: 'RIS-Abkürzung' })
        .click()
      await expect(page.getByText('SGB 5')).toBeVisible()
      await page.getByText('SGB 5').click()
      await page.getByRole('textbox', { name: 'Fassungsdatum' }).fill('99.99.9999{Tab}')

      // then
      await expect(page.getByText('Kein valides Datum')).toBeVisible()

      // when
      await page.getByRole('textbox', { name: 'Fassungsdatum' }).fill('20.12.20')
      await page.keyboard.press('Tab')
      // then
      await expect(page.getByText('Unvollständiges Datum')).toBeVisible()

      // when
      const tomorrow = dayjs().add(1, 'day').format('DD.MM.YYYY')
      await page.getByRole('textbox', { name: 'Fassungsdatum' }).fill(`${tomorrow}{Tab}`)
      // then
      await expect(page.getByText('Das Datum darf nicht in der Zukunft liegen')).toBeVisible()

      // when
      await page.getByRole('textbox', { name: 'Jahr' }).fill('0000{Tab}')
      // then
      await expect(page.getByText('Kein valides Jahr')).toBeVisible()

      // when
      await page.getByRole('button', { name: 'Verweis speichern' }).click()
      // then
      await expect(page.getByTestId('list-entry-0')).toBeHidden()
    },
  )

  test(
    'Add two einzelnorms, delete the first item',
    { tag: ['@RISDEV-7908'] },
    async ({ page }) => {
      // given
      await page.goto('/documentUnit/KSNR054920707/rubriken')
      const referenceTypeElement = page
        .getByTestId('activeReferences')
        .getByRole('combobox', { name: 'Art der Verweisung' })
      await expect(referenceTypeElement).toHaveCount(1)
      const activeReferenceElement = page
        .getByTestId('activeReferences')
        .getByRole('combobox', { name: 'RIS-Abkürzung' })
      await expect(activeReferenceElement).toHaveCount(1)

      // when
      await referenceTypeElement.click()
      await expect(page.getByText('Anwendung')).toBeVisible()
      await page.getByText('Anwendung').click()

      await activeReferenceElement.click()
      await expect(page.getByText('SGB 5')).toBeVisible()
      await page.getByText('SGB 5').click()
      await page.getByRole('textbox', { name: 'Einzelnorm der Norm' }).fill('1991, Seite 92')
      await page.getByRole('textbox', { name: 'Fassungsdatum' }).fill('27.01.1991')
      await page.getByRole('textbox', { name: 'Jahr der Norm' }).fill('1991')
      await page.getByRole('button', { name: 'Weitere Einzelnorm' }).click()
      await page.getByRole('textbox', { name: 'Einzelnorm der Norm' }).nth(1).fill('2000, Seite 90')
      await page.getByRole('textbox', { name: 'Fassungsdatum' }).nth(1).fill('27.01.2000')
      await page.getByRole('textbox', { name: 'Jahr der Norm' }).nth(1).fill('2000')
      await page.getByRole('button', { name: 'Einzelnorm löschen' }).nth(0).click()
      await page.getByRole('button', { name: 'Verweis speichern' }).click()

      // then
      await expect(page.getByText('SGB 5, 1991, Seite 92, 27.01.1991, 1991')).toHaveCount(0)
      await expect(page.getByText('SGB 5, 2000, Seite 90, 27.01.2000, 2000')).toHaveCount(1)
    },
  )

  test(
    'Shows validation error when RIS-Abkürzung entered twice',
    { tag: ['@RISDEV-7908'] },
    async ({ page }) => {
      // given
      await page.goto('/documentUnit/KSNR054920707/rubriken')

      // when
      const referenceTypeElement = page
        .getByTestId('activeReferences')
        .getByRole('combobox', { name: 'Art der Verweisung' })
      await referenceTypeElement.click()
      await page.getByText('Anwendung').click()
      await page
        .getByTestId('activeReferences')
        .getByRole('combobox', { name: 'RIS-Abkürzung' })
        .click()
      await expect(page.getByText('SGB 5')).toBeVisible()
      await page.getByText('SGB 5').click()
      await page.getByRole('button', { name: 'Verweis speichern' }).click()
      await page
        .getByTestId('activeReferences')
        .getByRole('combobox', { name: 'RIS-Abkürzung' })
        .click()
      await expect(page.getByRole('option', { name: 'SGB 5' })).toBeVisible()
      await page.getByRole('option', { name: 'SGB 5' }).click()

      // then
      await expect(page.getByText('RIS-Abkürzung bereits eingegeben')).toBeVisible()
    },
  )
})

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

  test(
    'Add an vwv active reference, edit and save',
    { tag: ['@RISDEV-6074'] },
    async ({ page }) => {
      // given
      await page.goto('/documentUnit/KSNR054920707/rubriken')
      await page.getByRole('radio', { name: 'Verwaltungsvorschrift auswählen' }).click()
      const referenceTypeElement = page
        .getByTestId('activeReferences')
        .getByRole('combobox', { name: 'Art der Verweisung' })
      await expect(referenceTypeElement).toHaveCount(1)
      const activeReferenceElement = page
        .getByTestId('activeReferences')
        .getByRole('combobox', { name: 'RIS-Abkürzung' })
      await expect(activeReferenceElement).toHaveCount(1)

      // when
      await referenceTypeElement.click()
      await expect(page.getByText('Neuregelung')).toBeVisible()
      await page.getByText('Neuregelung').click()
      await activeReferenceElement.click()
      await expect(page.getByText('KVLG')).toBeVisible()
      await page.getByText('KVLG').click()
      await page.getByRole('textbox', { name: 'Fassungsdatum der Norm' }).fill('20.12.2000')
      await page.getByRole('button', { name: 'Verweis speichern' }).click()
      // then
      await expect(page.getByText('Neuregelung | KVLG, 20.12.2000')).toHaveCount(1)

      // when
      await page.getByTestId('list-entry-0').click()
      // the radio buttons shall be gone as one cannot switch after creating
      await expect(page.getByRole('radio', { name: 'Norm auswählen' })).toHaveCount(0)
      await expect(
        page.getByRole('radio', { name: 'Verwaltungsvorschrift auswählen' }),
      ).toHaveCount(0)
      await page.getByRole('textbox', { name: 'Fassungsdatum der Norm' }).fill('27.01.2025')
      await page.getByRole('button', { name: 'Abbrechen' }).click()
      // then
      await expect(page.getByText('Neuregelung | KVLG, 20.12.2000')).toHaveCount(1)

      // when
      await page.getByTestId('list-entry-0').click()
      await page.getByRole('textbox', { name: 'Fassungsdatum der Norm' }).fill('27.01.2025')
      await page.getByRole('button', { name: 'Verweis speichern' }).click()
      // then
      await expect(page.getByText('Neuregelung | KVLG, 27.01.2025')).toHaveCount(1)
    },
  )

  test(
    'Add two active references, delete the first item',
    { tag: ['@RISDEV-6074'] },
    async ({ page }) => {
      // given
      await page.goto('/documentUnit/KSNR054920707/fundstellen')
      await page.getByRole('link', { name: 'Rubriken' }).click()
      await expect(page.getByRole('link', { name: 'Rubriken' })).toHaveCount(1)
      const referenceTypeElement = page
        .getByTestId('activeReferences')
        .getByRole('combobox', { name: 'Art der Verweisung' })
      await expect(referenceTypeElement).toHaveCount(1)
      const activeReferenceElement = page
        .getByTestId('activeReferences')
        .getByRole('combobox', { name: 'RIS-Abkürzung' })
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
      await page.getByRole('radio', { name: 'Verwaltungsvorschrift auswählen' }).click()
      await page.getByRole('combobox', { name: 'Art der Verweisung' }).click()
      await page.getByRole('option', { name: 'Anwendung' }).click()
      await page
        .getByTestId('activeReferences')
        .getByRole('combobox', { name: 'RIS-Abkürzung' })
        .click()
      await page.getByRole('option', { name: 'SGB 5' }).click()
      await page.getByRole('textbox', { name: 'Fassungsdatum der Norm' }).click()
      await page.getByRole('textbox', { name: 'Fassungsdatum der Norm' }).fill('12.12.2024')
      await page.getByRole('button', { name: 'Verweis speichern' }).click()

      // when
      await page.getByTestId('list-entry-0').click()

      // then
      await expect(
        page.getByRole('radio', { name: 'Verwaltungsvorschrift auswählen' }),
      ).toHaveCount(0)
    },
  )

  test(
    'Shows validation error when Fassungsdatum is in wrong format, cant be saved when invalid',
    { tag: ['@RISDEV-7908'] },
    async ({ page }) => {
      // given
      await page.goto('/documentUnit/KSNR054920707/rubriken')

      // when
      await page.getByRole('radio', { name: 'Verwaltungsvorschrift auswä' }).click()
      await page.getByRole('combobox', { name: 'Art der Verweisung' }).click()
      await page.getByRole('option', { name: 'Anwendung' }).click()
      await page
        .getByTestId('activeReferences')
        .getByRole('combobox', { name: 'RIS-Abkürzung' })
        .click()
      await page.getByRole('option', { name: 'SGB 5' }).click()
      await page.getByRole('textbox', { name: 'Fassungsdatum' }).fill('99.99.9999{Tab}')

      // then
      await expect(page.getByText('Kein valides Datum')).toBeVisible()

      // when
      await page.getByRole('textbox', { name: 'Fassungsdatum' }).fill('20.12.20')
      await page.keyboard.press('Tab')
      // then
      await expect(page.getByText('Unvollständiges Datum')).toBeVisible()

      // when
      const tomorrow = dayjs().add(1, 'day').format('DD.MM.YYYY')
      await page.getByRole('textbox', { name: 'Fassungsdatum' }).fill(`${tomorrow}{Tab}`)
      // then
      await expect(page.getByText('Das Datum darf nicht in der Zukunft liegen')).toBeVisible()

      // when
      await page.getByRole('button', { name: 'Verweis speichern' }).click()
      // then
      await expect(page.getByTestId('list-entry-0')).toBeHidden()
    },
  )
})

test.describe('RubrikenPage - Verweise (on Verwaltungsvorschrift)', () => {
  test('Verweise persist during reload when saved', { tag: ['@RISDEV-6308'] }, async ({ page }) => {
    // given
    await page.goto('/')
    await page.getByText('Neue Dokumentationseinheit').click()
    await page.getByRole('link', { name: 'Rubriken' }).click()
    await expect(page.getByRole('link', { name: 'Rubriken' })).toHaveCount(1)
    const referenceTypeElement = page
      .getByTestId('activeReferences')
      .getByRole('combobox', { name: 'Art der Verweisung' })
    await expect(referenceTypeElement).toHaveCount(1)
    const activeReferenceElement = page
      .getByTestId('activeReferences')
      .getByRole('combobox', { name: 'RIS-Abkürzung' })
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
