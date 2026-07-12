import { chromium } from 'playwright';

const baseUrl = 'http://127.0.0.1:5173/';
const outDir = '/Users/estherwang/Documents/Swingo';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 430, height: 900 }, deviceScaleFactor: 1 });
const consoleMessages = [];

page.on('console', (message) => {
  consoleMessages.push(`${message.type()}: ${message.text()}`);
});

page.on('pageerror', (error) => {
  consoleMessages.push(`pageerror: ${error.message}`);
});

await page.goto(baseUrl, { waitUntil: 'networkidle' });
await page.screenshot({ path: `${outDir}/swingo-mobile-journal.png`, fullPage: true });

await page.getByRole('button', { name: /Check in today's dance/i }).click();
await page.screenshot({ path: `${outDir}/swingo-mobile-checkin.png`, fullPage: true });

await page.getByRole('button', { name: /Solo Jazz/i }).click();
await page.getByPlaceholder('Search a move...').fill('Shorty');
await page.screenshot({ path: `${outDir}/swingo-mobile-move-search.png`, fullPage: true });

await page.getByRole('button', { name: /Shorty George/i }).click();
await page.getByRole('button', { name: /Next/i }).click();
await page.getByRole('button', { name: /Save to my dance story/i }).click();
await page.screenshot({ path: `${outDir}/swingo-mobile-success.png`, fullPage: true });

await page.getByRole('button', { name: /Go to Move Bank/i }).click();
await page.getByRole('heading', { name: 'Move Bank' }).waitFor();
await page.screenshot({ path: `${outDir}/swingo-mobile-bank.png`, fullPage: true });

await page.setViewportSize({ width: 1280, height: 900 });
await page.screenshot({ path: `${outDir}/swingo-desktop.png`, fullPage: true });

const bodyText = await page.locator('body').innerText();
await browser.close();

console.log(
  JSON.stringify(
    {
      consoleMessages,
      hasSavedMove: bodyText.includes('Shorty George'),
      screenshots: [
        'swingo-mobile-journal.png',
        'swingo-mobile-checkin.png',
        'swingo-mobile-move-search.png',
        'swingo-mobile-success.png',
        'swingo-mobile-bank.png',
        'swingo-desktop.png',
      ],
    },
    null,
    2,
  ),
);
