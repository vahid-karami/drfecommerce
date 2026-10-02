import { test, expect } from '@playwright/test';

test.describe('home page', () => {
  test('renders the hero without horizontal scroll', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.home2-hero h1')).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(overflow).toBe(false);
  });

  test('keeps the body-part buttons tappable', async ({ page }) => {
    await page.goto('/');
    const pills = page.locator('.home2-pill');
    await pills.first().waitFor({ timeout: 5000 }).catch(() => {});
    test.skip((await pills.count()) === 0, 'needs the backend running with demo data');
    const box = await pills.first().boundingBox();
    expect(box.height).toBeGreaterThanOrEqual(44);
  });
});
