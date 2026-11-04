import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";

const axeSource = readFileSync("node_modules/axe-core/axe.min.js", "utf8");

async function noThirdParty(page: Page) {
  const external: string[] = [];
  page.on("request", (r) => {
    const u = new URL(r.url());
    if (u.hostname !== "127.0.0.1" && u.protocol.startsWith("http")) external.push(r.url());
  });
  return external;
}

async function axe(page: Page) {
  await page.addScriptTag({ content: axeSource });
  return page.evaluate(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = await (window as any).axe.run(document, { resultTypes: ["violations"] });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return r.violations.filter((v: any) => v.impact === "serious" || v.impact === "critical").map((v: any) => `${v.id}: ${v.nodes.length} ${v.nodes[0]?.html?.slice(0, 120)}`);
  });
}

test("2D mode: all 12 chapters render, banner and tags are present, no third-party requests, no console errors", async ({ page }) => {
  const external = await noThirdParty(page);
  const errors: string[] = [];
  page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") errors.push(m.text()); });
  await page.goto("/?mode=2d");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText("Simulation of the Saral prototype").first()).toBeVisible();
  for (let i = 1; i < 12; i++) {
    await page.keyboard.press("ArrowRight");
    await expect(page.locator(".app")).toHaveAttribute("data-chapter", String(i));
    await page.waitForTimeout(150);
  }
  expect(external).toEqual([]);
  expect(errors).toEqual([]);
});

test("learner screen: read, quiz, gentle feedback, done", async ({ page }) => {
  await page.goto("/?mode=2d&chapter=8");
  const l = page.locator(".learner-frame");
  await l.getByRole("button", { name: "Start" }).click();
  await expect(l.locator(".lrn-sentence")).toBeVisible({ timeout: 6000 });
  for (let i = 0; i < 5; i++) await l.getByRole("button", { name: /^Next/ }).click();
  await l.getByRole("button", { name: /^Questions/ }).click();
  // Q1 is yes/no with answer Yes: answer No first to see the gentle message
  await l.getByRole("button", { name: "No" }).click();
  await expect(l.getByText("Let's look again")).toBeVisible();
  await expect(l.getByText(/wrong|fail|incorrect/i)).toHaveCount(0);
  await l.getByRole("button", { name: "Try again" }).click();
  await l.getByRole("button", { name: "Yes" }).click();
  await expect(l.getByText("Well done!")).toBeVisible();
});

test("chapter 6 shows the scripted retry for the water cycle", async ({ page }) => {
  await page.goto("/?mode=2d&chapter=6");
  await expect(page.getByText("longest sentence over 12 words")).toBeVisible();
  await expect(page.getByText("All checks pass")).toBeVisible();
});

test("own passage preview is labelled", async ({ page }) => {
  await page.goto("/?mode=2d&chapter=3");
  await page.getByLabel("Try your own passage").check();
  const text = readFileSync("src/data/passages.ts", "utf8").match(/const P3_TEXT =\s*"([^"]+)"/)![1];
  await page.locator("#passage-text").fill(text);
  await expect(page.getByText("Basic-mode preview, not the AI model")).toBeVisible();
});

for (const ch of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]) {
  test(`axe: chapter ${ch} has no serious or critical violations (2D)`, async ({ page }) => {
    await page.goto(`/?mode=2d&chapter=${ch}`);
    await page.waitForTimeout(1500);
    expect(await axe(page)).toEqual([]);
  });
}

test("3D mode renders a canvas and the embedded learner", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/?mode=3d&chapter=8");
  await expect(page.locator("canvas")).toBeVisible({ timeout: 20000 });
  await expect(page.locator(".embedded-learner").getByRole("button", { name: "Start" })).toBeVisible({ timeout: 20000 });
  expect(errors).toEqual([]);
});

test("reduced motion: run completes instantly", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("/?mode=2d&chapter=5");
  await page.getByRole("button", { name: "Run", exact: true }).click();
  await expect(page.getByText("Lesson ready on the display.")).toBeVisible();
  await ctx.close();
});
