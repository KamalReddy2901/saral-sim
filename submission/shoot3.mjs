import { chromium } from "@playwright/test";
const b = await chromium.launch({ channel: "chrome", args: ["--use-angle=swiftshader","--enable-unsafe-swiftshader"] });
const page = await (await b.newContext({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1.5 })).newPage();
await page.goto("http://127.0.0.1:4173/?chapter=1");
await page.locator(".veil").waitFor({ state: "detached", timeout: 60000 }).catch(() => {});
await page.waitForTimeout(3000);
await page.screenshot({ path: "submission/shots/ch01.png" });
await b.close();
