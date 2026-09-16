import { chromium } from "playwright-core";

const browser = await chromium.launch({ headless: true, channel: "msedge" });
const page = await browser.newPage({ viewport: { width: 1600, height: 1400 } });
await page.goto("http://localhost:5173/login", { waitUntil: "domcontentloaded" });
await page.evaluate(() => localStorage.setItem("mml_auth", "true"));
await page.goto("http://localhost:5173/dashboard", { waitUntil: "networkidle" });
await page.waitForTimeout(1000);
const card = page
  .locator("text=Avg. Time to Convert Lead")
  .locator('xpath=ancestor::div[contains(@class,"rounded-2xl")][1]');
await card.scrollIntoViewIfNeeded();
await page.waitForTimeout(300);
await card.screenshot({ path: "scripts/sales-funnel-dynamic.png" });
await browser.close();
console.log("ok");
