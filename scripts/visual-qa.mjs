import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const baseUrl = process.env.SWINGO_QA_URL || 'http://127.0.0.1:5173/';
const outDir = process.env.SWINGO_QA_OUT_DIR || '/Users/estherwang/Documents/Swingo';

mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const consoleMessages = [];
const pageErrors = [];

try {
  const page = await browser.newPage({ viewport: { width: 430, height: 900 }, deviceScaleFactor: 1 });

  page.on('console', (message) => {
    consoleMessages.push(`${message.type()}: ${message.text()}`);
    if (message.type() === 'error') pageErrors.push(`console error: ${message.text()}`);
  });

  page.on('pageerror', (error) => {
    consoleMessages.push(`pageerror: ${error.message}`);
    pageErrors.push(`pageerror: ${error.message}`);
  });

  await page.goto(baseUrl, { waitUntil: 'networkidle' });

  const setupCta = page.getByRole('button', { name: /Start reflecting/i });
  if (await setupCta.isVisible()) {
    await page.getByRole('button', { name: /Female dancer/i }).click();
    await page.getByRole('button', { name: /Vintage/i }).click();
    await setupCta.click();
  }
  await page.getByRole('button', { name: /Check in today's dance/i }).waitFor();
  await page.screenshot({ path: `${outDir}/swingo-mobile-journal.png`, fullPage: true });

  await page.getByRole('button', { name: /Check in today's dance/i }).click();
  await page.screenshot({ path: `${outDir}/swingo-mobile-checkin.png`, fullPage: true });

  await page.getByRole('button', { name: /Solo Jazz/i }).click();
  await page.getByPlaceholder('Search a move…').fill('Shorty');
  await page.screenshot({ path: `${outDir}/swingo-mobile-move-search.png`, fullPage: true });

  await page.getByRole('button', { name: /Shorty George/i }).click();
  await page.getByRole('button', { name: /Next/i }).click();
  await page.getByText('How did this learning feel?').waitFor();
  await page.screenshot({ path: `${outDir}/swingo-mobile-mood.png`, fullPage: true });
  await page.getByRole('button', { name: /Save to my dance story/i }).click();
  await page.screenshot({ path: `${outDir}/swingo-mobile-success.png`, fullPage: true });

  await page.getByRole('button', { name: /Back to journal/i }).click();
  await page.getByRole('button', { name: /^Moves$/ }).click();
  await page.getByRole('heading', { name: 'Move Bank' }).waitFor();
  await page.screenshot({ path: `${outDir}/swingo-mobile-bank.png`, fullPage: true });

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.screenshot({ path: `${outDir}/swingo-desktop.png`, fullPage: true });

  const bodyText = await page.locator('body').innerText();

  console.log(
    JSON.stringify(
      {
        consoleMessages,
        hasSavedMove: bodyText.includes('Shorty George'),
        screenshots: [
          'swingo-mobile-journal.png',
          'swingo-mobile-checkin.png',
          'swingo-mobile-move-search.png',
          'swingo-mobile-mood.png',
          'swingo-mobile-success.png',
          'swingo-mobile-bank.png',
          'swingo-desktop.png',
        ],
      },
      null,
      2,
    ),
  );

  if (!bodyText.includes('Shorty George')) {
    throw new Error('Visual QA failed: the saved move never showed up in the Move Bank.');
  }
  if (pageErrors.length) {
    throw new Error(`Visual QA failed: the page reported ${pageErrors.length} error(s):\n${pageErrors.join('\n')}`);
  }
} finally {
  await browser.close();
}
