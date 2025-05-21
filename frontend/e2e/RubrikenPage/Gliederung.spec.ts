import { test, expect } from '@playwright/test'

test.describe('RubrikenPage - Gliederung', () => {
  test(
    'Gliederung can be entered and persists a reload',
    { tag: ['@RISDEV-6047', '@RISDEV-6304'] },
    async ({ page }) => {
      // given
      await page.goto('/')
      await page.getByText('Neue Dokumentationseinheit').click()
      await page.getByText('Rubriken').click()

      const gliederungEditor = page.getByTestId('Gliederung Editor')
      await expect(gliederungEditor).toHaveCount(1)

      // when
      await gliederungEditor.click()
      await page.keyboard.insertText('Test 123')
      // then
      await expect(page.getByText('Test 123')).toHaveCount(1)

      // when
      await page.getByRole('button', { name: 'Speichern', exact: true }).click()
      await page.reload()
      // then
      await expect(page.getByText('Test 123')).toHaveCount(1)
    },
  )

  test(
    'Text changes can be undone and redone using the UI elements',
    { tag: ['@RISDEV-7843'] },
    async ({ page }) => {
      // given
      await page.goto('/')
      await page.getByText('Neue Dokumentationseinheit').click()
      await page.getByText('Rubriken').click()

      const gliederungEditorElement = page.getByTestId('Gliederung Editor')
      await gliederungEditorElement.click()
      await page.keyboard.insertText('Gliederung: Neuer Text')

      // when
      const undoButton = page
        .getByLabel('Gliederung Button Leiste')
        .getByRole('button', { name: 'Rückgängig machen' })
      undoButton.click()
      // then
      await expect(page.getByText('Gliederung: Neuer Text')).toHaveCount(0)

      // when
      const redoButton = page
        .getByLabel('Gliederung Button Leiste')
        .getByRole('button', { name: 'Wiederherstellen' })
      redoButton.click()
      // then
      await expect(page.getByText('Gliederung: Neuer Text')).toHaveCount(1)
    },
  )

  test(
    'Text box can be expanded, shows line 1 again after expansion',
    { tag: ['@RISDEV-7841]'] },
    async ({ page }) => {
      // given
      await page.goto('/')
      await page.getByText('Neue Dokumentationseinheit').click()
      await page.getByText('Rubriken').click()

      const gliederungEditorElement = page.getByTestId('Gliederung Editor')
      await gliederungEditorElement.click()
      await page.keyboard.type('Gliederung: Neuer Text 1\n Line 2\n Line 3\n Line 4\n Line 5')

      const text1 = page.getByText('Text 1')
      await expect(text1).not.toBeInViewport()

      // when
      const expansionButton = page
        .getByLabel('Gliederung Button Leiste')
        .getByRole('button', { name: 'Erweitern' })
      expansionButton.click()

      // then
      await expect(text1).toBeInViewport()
    },
  )

  test(
    'Hide unprintable characters after clicking "Nicht-druckbare Zeichen"',
    { tag: ['@RISDEV-7842]'] },
    async ({ page }) => {
      // given
      await page.goto('/')
      await page.getByText('Neue Dokumentationseinheit').click()
      await page.getByText('Rubriken').click()

      const gliederungEditorElement = page.getByTestId('Gliederung Editor')
      await gliederungEditorElement.click()
      await page.keyboard.type('Gliederung: Neuer Text 1')

      // eslint-disable-next-line playwright/no-raw-locators
      const linebreakIndicator = gliederungEditorElement.locator('br')
      await expect(linebreakIndicator).toHaveCount(1)

      // when
      const expansionButton = page
        .getByLabel('Gliederung Button Leiste')
        .getByRole('button', { name: 'Nicht-druckbare Zeichen' })
      expansionButton.click()

      // then
      await expect(linebreakIndicator).toHaveCount(0)
    },
  )
})

test.describe('RubrikenPage - Gliederung - Bestandsdaten', () => {
  test(
    'Load test documentation unit and expect Gliederung content',
    { tag: ['@RISDEV-7639'] },
    async ({ page }) => {
      // given

      // when
      await page.goto('/documentUnit/KSNR999999999/rubriken')

      // then
      await expect(page.getByText('TOC entry 1')).toHaveCount(1)
      await expect(page.getByText('TOC entry 2')).toHaveCount(1)
    },
  )
})
