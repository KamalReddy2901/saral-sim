import { chromium } from "@playwright/test";
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1.5, reducedMotion: "no-preference" });
const page = await ctx.newPage();
for (let i = 0; i < 12; i++) {
  await page.goto(`http://127.0.0.1:4173/?chapter=${i}`);
  await page.waitForTimeout(i === 0 || [1,2,3,4,5,7].includes(i) ? 14000 : 4000);
  await page.screenshot({ path: `submission/shots/ch${String(i).padStart(2,"0")}.png` });
  console.log("shot", i);
}
await b.close();
