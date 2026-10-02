import { test, expect } from '@playwright/test';

test.describe('login page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('has no horizontal scroll', async ({ page }) => {
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(overflow).toBe(false);
  });

  test('switches between password and one-time code', async ({ page }) => {
    await expect(page.locator('#password')).toBeVisible();
    await page.getByRole('tab').nth(1).click();
    await expect(page.locator('#otp-phone')).toBeVisible();
    await expect(page.locator('#password')).toHaveCount(0);
  });

  test('shows an inline error when fields are empty', async ({ page }) => {
    await page.locator('.auth-submit').click();
    await expect(page.getByRole('alert')).toBeVisible();
  });
});
