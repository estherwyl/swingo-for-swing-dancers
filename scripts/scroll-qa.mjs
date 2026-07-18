import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 430, height: 740 },
  deviceScaleFactor: 1,
  isMobile: true,
  hasTouch: true,
});

await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
await page.getByRole('button', { name: /Check in today's dance/i }).click();
await page.getByRole('button', { name: /Solo Jazz/i }).click();
await page.getByRole('button', { name: /Shorty George/i }).click();
await page.getByRole('button', { name: /Next/i }).click();
await page.getByText('How did this learning feel?').waitFor();

const before = await page.evaluate(() => {
  const screen = document.querySelector('.app-scroll');
  const save = document.querySelector('.save-cta');
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
await page.screenshot({
  path: '/Users/estherwang/Documents/Swingo/swingo-mood-scroll-fixed.png',
  fullPage: true,
});

const after = await page.evaluate(() => {
  const screen = document.querySelector('.app-scroll');
  const save = document.querySelector('.save-cta');
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

await browser.close();
console.log(JSON.stringify({ before, after }, null, 2));
