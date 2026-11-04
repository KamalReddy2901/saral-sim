import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";

const axeSource = readFileSync("node_modules/axe-core/axe.min.js", "utf8");

async function axe(page: Page) {
  await page.addScriptTag({ content: axeSource });
  return page.evaluate(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = await (window as any).axe.run(document, { resultTypes: ["violations"] });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return r.violations.filter((v: any) => v.impact === "serious" || v.impact === "critical").map((v: any) => `${v.id}: ${v.nodes.length} ${v.nodes[0]?.html?.slice(0, 120)}`);
  });
}

test("all 12 chapters render with the honesty banner, no third-party requests, no console errors", async ({ page }) => {
  const external: string[] = [];
  page.on("request", (r) => {
    const u = new URL(r.url());
    if (u.hostname !== "127.0.0.1" && u.protocol.startsWith("http")) external.push(r.url());
  });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText(/Example outputs were prepared by the team/)).toBeVisible();
  await expect(page.getByText("Take the tour")).toBeVisible();
  for (let i = 1; i < 12; i++) {
    await page.keyboard.press("ArrowRight");
    await expect(page.locator(".app")).toHaveAttribute("data-chapter", String(i));
    await page.waitForTimeout(250);
  }
  await expect(page.getByText("12 of 12 seen")).toBeVisible();
  expect(external).toEqual([]);
  expect(errors).toEqual([]);
});

test("learner screen: read, quiz, gentle feedback, done", async ({ page }) => {
  await page.goto("/?chapter=8");
  await page.getByRole("button", { name: "Full-screen view" }).click();
  const l = page.locator(".fs");
  await l.getByRole("button", { name: "Start" }).click();
  await expect(l.locator(".lrn-sentence")).toBeVisible({ timeout: 6000 });
  for (let i = 0; i < 5; i++) await l.getByRole("button", { name: /^Next/ }).click();
  await l.getByRole("button", { name: /^Questions/ }).click();
  await l.getByRole("button", { name: "No" }).click();
  await expect(l.getByText("Let's look again")).toBeVisible();
  await expect(l.getByText(/wrong|fail|incorrect/i)).toHaveCount(0);
  await l.getByRole("button", { name: "Try again" }).click();
  await l.getByRole("button", { name: "Yes" }).click();
  await expect(l.getByText("Well done!")).toBeVisible();
});

test("checks walkthrough shows the scripted retry for the water cycle", async ({ page }) => {
  await page.goto("/?chapter=6");
  await page.getByRole("button", { name: "Pause" }).click({ timeout: 8000 }).catch(() => undefined);
  await page.getByRole("button", { name: /Check A/ }).first().click();
  await expect(page.getByText(/19 words/).first()).toBeVisible();
  await page.getByRole("button", { name: /Check A/ }).last().click();
  await expect(page.getByText("Check A passes")).toBeVisible();
});

test("barrier divider compares the two sentences", async ({ page }) => {
  await page.goto("/?chapter=1");
  const range = page.getByLabel("Compare the original sentence with the easy-read version");
  await expect(range).toBeVisible();
  await range.fill("80");
  await expect(page.getByText("Up high, it is cold, and clouds form.")).toBeVisible();
});

test("own passage preview is labelled", async ({ page }) => {
  await page.goto("/?chapter=3");
  await page.getByLabel("Try your own passage").check();
  const text = readFileSync("src/data/passages.ts", "utf8").match(/const P3_TEXT =\s*"([^"]+)"/)![1];
  await page.locator("#passage-text").fill(text);
  await expect(page.getByText("Basic-mode preview, not the AI model")).toBeVisible();
});

for (const ch of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]) {
  test(`axe: chapter ${ch} has no serious or critical violations`, async ({ page }) => {
    await page.goto(`/?chapter=${ch}`);
    await page.waitForTimeout(1800);
    expect(await axe(page)).toEqual([]);
  });
}

test("3D canvas renders and the 3D tools are present", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/?chapter=2");
  await expect(page.locator("canvas")).toBeVisible({ timeout: 20000 });
  await expect(page.getByRole("button", { name: "Reset view" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Unplug cable" })).toBeVisible();
  expect(errors).toEqual([]);
});

test("reduced motion: run completes instantly", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("/?chapter=5");
  await page.getByRole("button", { name: "Run", exact: true }).click();
  await expect(page.getByText("Lesson ready on the display.")).toBeVisible();
  await ctx.close();
});
