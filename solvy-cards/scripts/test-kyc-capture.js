#!/usr/bin/env node
/**
 * Runtime test for the KYC ID-document pipeline.
 *
 * Requires:
 *   - Vite dev server running on http://localhost:3000
 *   - Google Chrome installed at /Applications/Google Chrome.app/Contents/MacOS/Google Chrome
 *
 * Run:
 *   node scripts/test-kyc-capture.js
 */

import puppeteer from 'puppeteer-core'

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const TEST_URL = 'http://localhost:3000/#/test-kyc'
const TIMEOUT = 120000

async function main() {
  console.log('Launching Chrome...')
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: CHROME_PATH,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  const page = await browser.newPage()
  page.setDefaultTimeout(TIMEOUT)

  page.on('console', msg => {
    const text = msg.text()
    if (text.includes('KYC') || text.includes('IdDocument') || text.includes('ONNX') || text.includes('OCR') || text.includes('Error')) {
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
    () => window.__KYC_TEST_RESULT__ || window.__KYC_TEST_ERROR__,
    { timeout: TIMEOUT }
  )

  const result = await page.evaluate(() => ({
    result: window.__KYC_TEST_RESULT__,
    error: window.__KYC_TEST_ERROR__
  }))

  if (result.error) {
    console.error('\n❌ Test failed:', result.error)
    process.exitCode = 1
  } else {
    console.log('\n✅ Test result:')
    console.log(JSON.stringify(result.result, null, 2))

    const front = result.result?.front
    const back = result.result?.back
    const faceMatch = result.result?.faceMatch
    const livenessProof = result.result?.livenessProof

    if (!front || !back) {
      console.error('\n❌ Missing front or back result')
      process.exitCode = 1
    } else if (!front.quality?.pass) {
      console.warn('\n⚠️ Front ID quality did not pass:', front.quality.issues)
    } else if (!back.quality?.pass) {
      console.warn('\n⚠️ Back ID quality did not pass:', back.quality.issues)
    } else if (!faceMatch?.match) {
      console.warn('\n⚠️ Face match did not pass:', faceMatch)
    } else if (!livenessProof?.blinkDetected || !livenessProof?.headMoved) {
      console.warn('\n⚠️ Liveness proof incomplete:', livenessProof)
    } else {
      console.log('\n🎉 KYC ID pipeline + face-match + liveness validated!')
    }
  }

  await browser.close()
}

main().catch(err => {
  console.error('Test script error:', err)
  process.exit(1)
})
