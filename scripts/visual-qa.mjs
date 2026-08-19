import { checkinFlow, openApp, outputDir } from './qa-harness.mjs';

const outDir = await outputDir();
const { browser, page, consoleMessages } = await openApp({ collectConsole: true });

const screenshots = [];
async function capture(name) {
  await page.screenshot({ path: `${outDir}/${name}`, fullPage: true });
  screenshots.push(name);
}

await capture('swingo-mobile-journal.png');

await checkinFlow.start(page);
await capture('swingo-mobile-checkin.png');

await checkinFlow.chooseFamily(page);
await checkinFlow.searchMove(page, 'Shorty');
await capture('swingo-mobile-move-search.png');

await checkinFlow.chooseMove(page);
await checkinFlow.continueToMood(page);
await capture('swingo-mobile-mood.png');

await checkinFlow.save(page);
await capture('swingo-mobile-success.png');

await page.getByRole('button', { name: /Back to journal/i }).click();
await page.getByRole('button', { name: /^Moves$/i }).click();
await page.getByRole('heading', { name: 'Move Bank' }).waitFor();
await capture('swingo-mobile-bank.png');

await page.setViewportSize({ width: 1280, height: 900 });
await capture('swingo-desktop.png');

const bodyText = await page.locator('body').innerText();
await browser.close();

console.log(
  JSON.stringify(
    {
      consoleMessages,
      hasSavedMove: bodyText.includes('Shorty George'),
      screenshots,
    },
    null,
    2,
  ),
);
