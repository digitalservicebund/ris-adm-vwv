import { test, expect } from '@playwright/test'

test.describe('RubrikenPage - ExtraContentSidePanel', () => {
  test(
    'Note persist during reload when saved, can be edited with special characters',
    { tag: ['@RISDEV-6446', '@RISDEV-8427'] },
    async ({ page }) => {
      // given
      await page.goto('/')
      await page.getByText('Neue Dokumentationseinheit').click()
      await page.getByRole('link', { name: 'Rubriken' }).click()
      await expect(page.getByRole('link', { name: 'Rubriken' })).toHaveCount(1)
      await page.getByRole('button', { name: 'Seitenpanel öffnen' }).click()
      await expect(page.getByRole('textbox', { name: 'Notiz Eingabefeld' })).toHaveCount(1)

      // when
      const noteElement = page.getByRole('textbox', { name: 'Notiz Eingabefeld' })
      await noteElement.fill('Ein relativ langer Text am Rande')
      await page.getByText('Speichern').click()
      await page.reload()

      // then
      await expect(noteElement).toHaveValue('Ein relativ langer Text am Rande')

      // when edited with special characters
      const editedNote = 'Note with special characters 123äöüß$%&'
      await noteElement.fill(editedNote)
      await page.getByText('Speichern').click()
      await page.reload()

      // then
      await expect(noteElement).toHaveValue(editedNote)

      // when scrolling to bottom
      await page.evaluate('window.scrollTo(0, document.body.scrollHeight)')

      // then
      await expect(page.getByRole('button', { name: 'Seitenpanel öffnen' })).toBeHidden()
      await expect(page.getByRole('button', { name: 'Seitenpanel schließen' })).toBeVisible()
      await expect(noteElement).toHaveValue(editedNote)

      // when navigating to Gliederung
      await page.getByRole('link', { name: 'Gliederung' }).click()

      // then
      await expect(page.getByRole('button', { name: 'Seitenpanel öffnen' })).toBeHidden()
      await expect(page.getByRole('button', { name: 'Seitenpanel schließen' })).toBeVisible()
      await expect(noteElement).toHaveValue(editedNote)

      // when navigating to Fundstellen
      await page.getByRole('link', { name: 'Fundstellen' }).click()

      // then
      await expect(page.getByRole('button', { name: 'Seitenpanel öffnen' })).toBeHidden()
      await expect(page.getByRole('button', { name: 'Seitenpanel schließen' })).toBeVisible()
      await expect(noteElement).toHaveValue(editedNote)

      // when navigating to Abgabe page
      await page.getByRole('link', { name: 'Abgabe' }).click()

      // then
      await expect(page.getByRole('button', { name: 'Seitenpanel öffnen' })).toBeHidden()
      await expect(page.getByRole('button', { name: 'Seitenpanel schließen' })).toBeHidden()
    },
  )

  test(
    'Fill in long note and expect resizing of text area',
    { tag: ['@RISDEV-6446'] },
    async ({ page }) => {
      // given
      await page.goto('/')
      await page.getByText('Neue Dokumentationseinheit').click()
      await page.getByRole('link', { name: 'Rubriken' }).click()
      await expect(page.getByRole('link', { name: 'Rubriken' })).toHaveCount(1)
      await page.getByRole('button', { name: 'Seitenpanel öffnen' }).click()
      await expect(page.getByRole('textbox', { name: 'Notiz Eingabefeld' })).toHaveCount(1)
      const longNote = `Dies ist ein sehr langer Text.

    Er enthält auch noch Zeilenumbrüche.

    Umbrüche sind ein ständiger Begleiter im Leben.

    Zeilen konkurrieren mit Spalten.

    Felsspalten sind gefährlich und sollten gemieden werden.`

      // when
      await page.getByRole('textbox', { name: 'Notiz Eingabefeld' }).fill(longNote)

      // then
      await expect(page.getByRole('textbox', { name: 'Notiz Eingabefeld' }))
        // Height should be set to a three-digit number
        .toHaveCSS('height', /[1-9]{3}px/)
    },
  )
})
