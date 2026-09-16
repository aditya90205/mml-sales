import { chromium } from "playwright-core";
import { mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const dir = path.dirname(fileURLToPath(import.meta.url));
await mkdir(dir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  channel: "msedge",
});

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:5173/login", { waitUntil: "domcontentloaded" });
await page.evaluate(() => localStorage.setItem("mml_auth", "true"));
await page.goto("http://localhost:5173/dashboard", { waitUntil: "networkidle" });
await page.waitForTimeout(800);

const card = page
  .locator("text=My Performance Score")
  .locator('xpath=ancestor::div[contains(@class,"rounded-2xl")][1]');
await card.screenshot({ path: path.join(dir, "performance-score.png") });
await browser.close();
console.log("saved");
