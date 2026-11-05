import { chromium } from "@playwright/test";
import { pathToFileURL } from "node:url";
const b = await chromium.launch({ channel: "chrome" });
const p = await b.newPage({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: 1.5 });
await p.goto(pathToFileURL(process.cwd() + "/brief.html").href);
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(600);
await p.pdf({ path: "Saral_Brief_2pages.pdf", format: "A4", printBackground: true, preferCSSPageSize: true });
const secs = await p.locator("section.p").all();
for (let i = 0; i < secs.length; i++) {
  await secs[i].screenshot({ path: `/tmp/brief${i + 1}.png` });
  const over = await secs[i].evaluate((e) => { let m = 0; for (const c of e.children) m = Math.max(m, c.getBoundingClientRect().bottom - e.getBoundingClientRect().top); return [m, e.scrollHeight, e.clientHeight]; });
  console.log("page", i + 1, over);
}
await b.close();
