import { test, expect } from '@playwright/test'
import dayjs from 'dayjs'

test.describe('RubrikenPage - Verweise: Norm', () => {
  test.describe('With mocked routes', () => {
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
      'Add a norm with 2 einzelnorms, edit and save',
      { tag: ['@RISDEV-6075'] },
      async ({ page }) => {
        // given
        await page.goto('/verwaltungsvorschriften/documentUnit/KSNR054920707/fundstellen')
        await page.getByRole('link', { name: 'Rubriken' }).click()
        await expect(page.getByRole('link', { name: 'Rubriken' })).toHaveCount(1)
        await expect(page.getByTestId('normReferences').getByText('RIS-Abkürzung *')).toBeVisible()
        await expect(
          page.getByTestId('normReferences').getByRole('combobox', { name: 'RIS-Abkürzung' }),
        ).toHaveCount(1)

        // when
        await page
          .getByTestId('normReferences')
          .getByRole('combobox', { name: 'RIS-Abkürzung' })
          .click()
        await expect(page.getByText('KVLG')).toBeVisible()
        await page.getByText('KVLG').click()
        await page.getByRole('textbox', { name: 'Einzelnorm der Norm' }).fill('§ 2')
        await page.getByRole('button', { name: 'Norm speichern' }).click()
        await page.getByTestId('list-entry-0').click()
        await page.getByRole('textbox', { name: 'Fassungsdatum' }).fill('27.01.2025')
        await page.getByRole('textbox', { name: 'Jahr' }).fill('2025')
        await page.getByRole('button', { name: 'Weitere Einzelnorm' }).click()
        await page.getByRole('textbox', { name: 'Einzelnorm der Norm' }).nth(1).fill('§ 3')
        await page.getByRole('button', { name: 'Norm speichern' }).click()

        // then
        await expect(page.getByText('KVLG, § 2, 27.01.2025, 2025')).toHaveCount(1)
        await expect(page.getByText('KVLG, § 3')).toHaveCount(1)
      },
    )

    test('Add two norms, delete the first item', { tag: ['@RISDEV-6075'] }, async ({ page }) => {
      // given
      await page.goto('/verwaltungsvorschriften/documentUnit/KSNR054920707/fundstellen')
      await page.getByRole('link', { name: 'Rubriken' }).click()
      await expect(page.getByRole('link', { name: 'Rubriken' })).toHaveCount(1)
      await expect(
        page.getByTestId('normReferences').getByRole('combobox', { name: 'RIS-Abkürzung' }),
      ).toHaveCount(1)

      // when
      await page
        .getByTestId('normReferences')
        .getByRole('combobox', { name: 'RIS-Abkürzung' })
        .click()
      await expect(page.getByText('SGB 5')).toBeVisible()
      await page.getByText('SGB 5').click()
      await page.getByRole('textbox', { name: 'Einzelnorm der Norm' }).fill('1991, Seite 92')
      await page.getByRole('button', { name: 'Norm speichern' }).click()
      await page
        .getByTestId('normReferences')
        .getByRole('combobox', { name: 'RIS-Abkürzung' })
        .click()
      await expect(page.getByText('KVLG')).toBeVisible()
      await page.getByText('KVLG').click()
      await page.getByRole('textbox', { name: 'Einzelnorm der Norm' }).fill('§ 2')
      await page.getByRole('button', { name: 'Norm speichern' }).click()
      await page.getByTestId('list-entry-0').click()
      await page.getByText('Eintrag löschen').click()

      // then
      await expect(page.getByText('SGB 5, 1991, Seite 92')).toHaveCount(0)
      await expect(page.getByText('KVLG, § 2')).toHaveCount(1)
    })

    test(
      'Add two einzelnorms, deletes the first one, clicking on cancel reverts the changes',
      { tag: ['@RISDEV-7907'] },
      async ({ page }) => {
        // given
        await page.goto('/verwaltungsvorschriften/documentUnit/KSNR054920707/fundstellen')
        await page.getByRole('link', { name: 'Rubriken' }).click()
        await expect(page.getByRole('link', { name: 'Rubriken' })).toHaveCount(1)
        await expect(
          page.getByTestId('normReferences').getByRole('combobox', { name: 'RIS-Abkürzung' }),
        ).toHaveCount(1)

        // when
        await page
          .getByTestId('normReferences')
          .getByRole('combobox', { name: 'RIS-Abkürzung' })
          .click()
        await expect(page.getByText('SGB 5')).toBeVisible()
        await page.getByText('SGB 5').click()
        await page.getByRole('textbox', { name: 'Einzelnorm der Norm' }).fill('1991, Seite 92')
        await page.getByRole('button', { name: 'Norm speichern' }).click()

        // then
        await expect(page.getByText('SGB 5, 1991, Seite 92')).toHaveCount(1)

        // when
        await page.getByTestId('list-entry-0').click()
        await page.getByRole('textbox', { name: 'Einzelnorm der Norm' }).fill('2025, Seite 1')
        await page.getByRole('button', { name: 'Abbrechen' }).click()
        // then
        await expect(page.getByText('SGB 5, 1991, Seite 92')).toHaveCount(1)

        // when
        await page.getByTestId('list-entry-0').click()
        await page.getByRole('button', { name: 'Einzelnorm löschen' }).click()
        await page.getByRole('button', { name: 'Weitere Einzelnorm' }).click()
        await page.getByRole('textbox', { name: 'Einzelnorm der Norm' }).fill('2025, Seite 1')
        await page.getByRole('button', { name: 'Norm speichern' }).click()

        // then
        await expect(page.getByText('SGB 5, 2025, Seite 1')).toHaveCount(1)
      },
    )

    test(
      'Shows validation error when Fassungsdatum and Jahr are in wrong format',
      { tag: ['@RISDEV-7907'] },
      async ({ page }) => {
        // given
        await page.goto('/verwaltungsvorschriften/documentUnit/KSNR054920707/fundstellen')
        await page.getByRole('link', { name: 'Rubriken' }).click()
        await expect(page.getByRole('link', { name: 'Rubriken' })).toHaveCount(1)
        await expect(
          page.getByTestId('normReferences').getByRole('combobox', { name: 'RIS-Abkürzung' }),
        ).toHaveCount(1)

        // when
        await page
          .getByTestId('normReferences')
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
      },
    )

    test(
      'Shows validation error when RIS-Abkürzung entered twice',
      { tag: ['@RISDEV-7907'] },
      async ({ page }) => {
        // given
        await page.goto('/verwaltungsvorschriften/documentUnit/KSNR054920707/fundstellen')
        await page.getByRole('link', { name: 'Rubriken' }).click()
        await expect(page.getByRole('link', { name: 'Rubriken' })).toHaveCount(1)
        await expect(
          page.getByTestId('normReferences').getByRole('combobox', { name: 'RIS-Abkürzung' }),
        ).toHaveCount(1)

        // when
        await page
          .getByTestId('normReferences')
          .getByRole('combobox', { name: 'RIS-Abkürzung' })
          .click()
        await expect(page.getByText('SGB 5')).toBeVisible()
        await page.getByText('SGB 5').click()
        await page.getByRole('button', { name: 'Norm speichern' }).click()
        await page
          .getByTestId('normReferences')
          .getByRole('combobox', { name: 'RIS-Abkürzung' })
          .click()
        await page.getByRole('option', { name: 'SGB 5' }).click()
        // then
        await expect(page.getByText('RIS-Abkürzung bereits eingegeben')).toBeVisible()
      },
    )
  })

  test(
    'Norm can be added and survives a reload after saving',
    { tag: ['@RISDEV-6307'] },
    async ({ page }) => {
      // given
      await page.goto('/')
      await page.getByText('Neue Dokumentationseinheit').click()
      await page.getByRole('link', { name: 'Rubriken' }).click()
      await expect(
        page.getByTestId('normReferences').getByRole('combobox', { name: 'RIS-Abkürzung' }),
      ).toHaveCount(1)

      // when
      await page
        .getByTestId('normReferences')
        .getByRole('combobox', { name: 'RIS-Abkürzung' })
        .click()
      await expect(page.getByText('KVLG')).toBeVisible()
      await page.getByText('KVLG').click()
      await page.getByRole('textbox', { name: 'Einzelnorm der Norm' }).fill('§ 2')
      await page.getByRole('button', { name: 'Norm speichern' }).click()
      await page.getByTestId('list-entry-0').click()
      await page.getByRole('textbox', { name: 'Fassungsdatum' }).fill('27.01.2025')
      await page.getByRole('button', { name: 'Norm speichern' }).click()
      // then
      await expect(page.getByText('KVLG, § 2, 27.01.2025')).toHaveCount(1)

      // when
      await page.getByText('Speichern').click()
      await page.reload()
      // then
      await expect(page.getByText('KVLG, § 2, 27.01.2025')).toHaveCount(1)
    },
  )
})

test.describe('RubrikenPage - Verweise: Norm - Bestandsdaten', () => {
  test(
    'Load test documentation unit and expect two norm Verweise',
    { tag: ['@RISDEV-7639'] },
    async ({ page }) => {
      // given

      // when
      await page.goto('/verwaltungsvorschriften/documentUnit/KSNR999999999/rubriken')

      // then
      await expect(page.getByText('PhanGB, § 1a Abs 1, 02.02.2022, 2011')).toHaveCount(1)
      await expect(page.getByText('PhanGB 5, § 2 Abs 6, 02.02.2022, 2011')).toHaveCount(1)
    },
  )
})
