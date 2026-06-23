#!/usr/bin/env node
/**
 * Runtime test for the receipt-scanning pipeline.
 *
 * Requires:
 *   - Vite dev server running on http://localhost:3000
 *   - Google Chrome installed at /Applications/Google Chrome.app/Contents/MacOS/Google Chrome
 *
 * Run:
 *   node scripts/test-receipt-scan.js
 */

import puppeteer from 'puppeteer-core'
import fs from 'fs'
import path from 'path'

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const TEST_URL = 'http://localhost:3000/#/test-receipt'
const TIMEOUT = 120000 // 2 minutes; model load + OCR can be slow first time

async function main() {
  console.log('Launching Chrome...')
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: CHROME_PATH,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  const page = await browser.newPage()
  page.setDefaultTimeout(TIMEOUT)

  // Capture console logs
  page.on('console', msg => {
    const text = msg.text()
    if (text.includes('Receipt') || text.includes('ONNX') || text.includes('OCR') || text.includes('Error')) {
      console.log(`[Browser] ${text}`)
    }
  })

  page.on('pageerror', err => {
    console.error('[Browser Error]', err.message)
  })

  console.log(`Navigating to ${TEST_URL}...`)
  await page.goto(TEST_URL)

  console.log('Waiting for test to complete...')
  await page.waitForFunction(
    () => window.__RECEIPT_TEST_RESULT__ || window.__RECEIPT_TEST_ERROR__,
    { timeout: TIMEOUT }
  )

  const result = await page.evaluate(() => ({
    result: window.__RECEIPT_TEST_RESULT__,
    error: window.__RECEIPT_TEST_ERROR__
  }))

  if (result.error) {
    console.error('\n❌ Test failed:', result.error)
    process.exitCode = 1
  } else {
    console.log('\n✅ Test result:')
    console.log(JSON.stringify(result.result, null, 2))

    // Save debug crop image if available
    if (result.result?.cropDataUrl) {
      const base64 = result.result.cropDataUrl.replace(/^data:image\/png;base64,/, '')
      const outPath = path.resolve('scripts/test-receipt-crop.png')
      fs.writeFileSync(outPath, Buffer.from(base64, 'base64'))
      console.log('\n🖼️  Debug crop saved to:', outPath)
    }
  }

  await browser.close()
}

main().catch(err => {
  console.error('Test script error:', err)
  process.exit(1)
})
