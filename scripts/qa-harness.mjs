import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from 'playwright';

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export const BASE_URL = process.env.SWINGO_QA_BASE_URL || 'http://127.0.0.1:5173/';

/** Screenshots land in the repo by default; override with SWINGO_QA_OUT_DIR. */
export async function outputDir() {
  const dir = process.env.SWINGO_QA_OUT_DIR || resolve(PROJECT_ROOT, 'qa-output');
  await mkdir(dir, { recursive: true });
  return dir;
}

export async function openApp({ viewport = { width: 430, height: 900 }, mobile = false, collectConsole = false } = {}) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport,
    deviceScaleFactor: 1,
    ...(mobile ? { isMobile: true, hasTouch: true } : {}),
  });

  const consoleMessages = [];
  if (collectConsole) {
    page.on('console', (message) => consoleMessages.push(`${message.type()}: ${message.text()}`));
    page.on('pageerror', (error) => consoleMessages.push(`pageerror: ${error.message}`));
  }

  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await completeSetup(page);
  return { browser, page, consoleMessages };
}

/** First-run companion picker stands between a fresh profile and the journal. */
export async function completeSetup(page, { gender = /Female dancer/i, style = /Vintage/i } = {}) {
  const cta = page.getByRole('button', { name: /Start reflecting/i });
  if (!(await cta.isVisible())) return;
  await page.getByRole('button', { name: gender }).click();
  await page.getByRole('button', { name: style }).click();
  await cta.click();
  await page.getByRole('button', { name: /Check in today's dance/i }).waitFor();
}

export const checkinFlow = {
  start: (page) => page.getByRole('button', { name: /Check in today's dance/i }).click(),
  chooseFamily: (page, family = /Solo Jazz/i) => page.getByRole('button', { name: family }).click(),
  searchMove: (page, needle) => page.getByPlaceholder('Search a move…').fill(needle),
  chooseMove: (page, move = /Shorty George/i) => page.getByRole('button', { name: move }).click(),
  async continueToMood(page) {
    await page.getByRole('button', { name: /Next/i }).click();
    await page.getByText('How did this learning feel?').waitFor();
  },
  save: (page) => page.getByRole('button', { name: /Save to my dance story/i }).click(),
};
