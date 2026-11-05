import { chromium } from "@playwright/test";
import { pathToFileURL } from "node:url";
const b = await chromium.launch({ channel: "chrome" });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto(pathToFileURL(process.cwd() + "/deck.html").href);
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(800);
await p.pdf({ path: "Saral_Supporting_Document.pdf", width: "1920px", height: "1080px", printBackground: true, preferCSSPageSize: true });
for (let i = 0; i < 11; i++) {
  const el = (await p.locator("section.s").all())[i];
  await el.screenshot({ path: `/tmp/slide${i + 1}.png` });
}
await b.close();
