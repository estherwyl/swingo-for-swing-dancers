import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const baseUrl = process.env.SWINGO_QA_URL || 'http://127.0.0.1:5173/';
const outDir = process.env.SWINGO_QA_OUT_DIR || '/Users/estherwang/Documents/Swingo';

mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({
    viewport: { width: 430, height: 740 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
  });

  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(`pageerror: ${error.message}`));

  await page.goto(baseUrl, { waitUntil: 'networkidle' });

  const setupCta = page.getByRole('button', { name: /Start reflecting/i });
  if (await setupCta.isVisible()) {
    await page.getByRole('button', { name: /Female dancer/i }).click();
    await page.getByRole('button', { name: /Vintage/i }).click();
    await setupCta.click();
  }

  await page.getByRole('button', { name: /Check in today's dance/i }).click();
  await page.getByRole('button', { name: /Solo Jazz/i }).click();
  await page.getByRole('button', { name: /Shorty George/i }).click();
  await page.getByRole('button', { name: /Next/i }).click();
  await page.getByText('How did this learning feel?').waitFor();

  const before = await page.evaluate(() => {
    const screen = document.querySelector('.app-scroll');
    const save = document.querySelector('.save-cta');
    if (!screen) throw new Error('Scroll QA failed: .app-scroll container is missing.');
    if (!save) throw new Error('Scroll QA failed: .save-cta button is missing on the mood step.');
    return {
      scrollTop: screen.scrollTop,
      scrollHeight: screen.scrollHeight,
      clientHeight: screen.clientHeight,
      canScroll: screen.scrollHeight > screen.clientHeight,
      saveRect: save.getBoundingClientRect(),
    };
  });

  await page.locator('.app-scroll').evaluate((element) => {
    element.scrollTo({ top: element.scrollHeight, behavior: 'instant' });
  });
  await page.waitForTimeout(120);
  await page.screenshot({ path: `${outDir}/swingo-mood-scroll-fixed.png`, fullPage: true });

  const after = await page.evaluate(() => {
    const screen = document.querySelector('.app-scroll');
    const save = document.querySelector('.save-cta');
    if (!screen) throw new Error('Scroll QA failed: .app-scroll container is missing.');
    if (!save) throw new Error('Scroll QA failed: .save-cta button is missing on the mood step.');
    const nav = document.querySelector('.bottom-nav');
    const saveRect = save.getBoundingClientRect();
    const navRect = nav?.getBoundingClientRect();
    return {
      scrollTop: screen.scrollTop,
      scrollHeight: screen.scrollHeight,
      clientHeight: screen.clientHeight,
      saveVisible: saveRect.top >= 0 && saveRect.bottom <= window.innerHeight,
      saveAboveNav: navRect ? saveRect.bottom <= navRect.top + 1 : saveRect.bottom <= window.innerHeight,
      saveText: save.textContent.trim(),
    };
  });

  console.log(JSON.stringify({ before, after }, null, 2));

  if (!after.saveVisible || !after.saveAboveNav) {
    throw new Error('Scroll QA failed: the save button is not fully reachable after scrolling to the bottom.');
  }
  if (pageErrors.length) {
    throw new Error(`Scroll QA failed: the page reported ${pageErrors.length} error(s):\n${pageErrors.join('\n')}`);
  }
} finally {
  await browser.close();
}
