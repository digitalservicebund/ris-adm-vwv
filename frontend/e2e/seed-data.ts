import { test } from '@playwright/test'
import fs from 'fs'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

test('create test-data.json from DB seed data', () => {
  console.log('--- Creating test-data.json file based on SQL seed data ---')

  const testData = {
    docNumber1: 'KSNR000000001',
    docNumber2: 'KSNR000000002',
    doc1Title: 'Alpha Global Setup Document',
    doc2Title: 'Beta Global Setup Document',
    doc1References: [
      { legalPeriodicalRawValue: 'BGB', citation: '123' },
      { legalPeriodicalRawValue: 'VWV', citation: 'xyz' },
    ],
    doc2References: [{ legalPeriodicalRawValue: 'BGB', citation: '456' }],
    doc1Zitierdaten: ['2024-06-17', '1950-01-01'],
    doc2Zitierdaten: ['2024-06-18'],
  }

  const outputPath = path.join(__dirname, 'test-data.json')
  fs.writeFileSync(outputPath, JSON.stringify(testData, null, 2))

  console.log(`--- test-data.json created at ${outputPath} ---`)
})
