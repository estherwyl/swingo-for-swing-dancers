import { checkinFlow, openApp, outputDir } from './qa-harness.mjs';

const outDir = await outputDir();
const { browser, page } = await openApp({ viewport: { width: 430, height: 740 }, mobile: true });

await checkinFlow.start(page);
await checkinFlow.chooseFamily(page);
await checkinFlow.chooseMove(page);
await checkinFlow.continueToMood(page);

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
  path: `${outDir}/swingo-mood-scroll-fixed.png`,
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
