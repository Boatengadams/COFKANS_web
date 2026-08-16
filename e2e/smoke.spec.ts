import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('homepage loads and exposes primary shopping navigation', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('button', { name: /cofkans/i })).toBeVisible();
  await expect(page.getByText(/Electrical/i).first()).toBeVisible();

  const accessibilityScanResults = await new AxeBuilder({ page })
    .disableRules(['color-contrast'])
    .analyze();
  expect(accessibilityScanResults.violations).toEqual([]);
});

test('authentication entry point opens without requiring test credentials', async ({ page }) => {
  await page.goto('/');

  const authEntry = page
    .getByRole('button', { name: /sign in|account|login/i })
    .or(page.getByText(/sign in|account|login/i))
    .first();
  await authEntry.click();

  await expect(page.getByText(/sign in|email|password|google|phone/i).first()).toBeVisible();
});

test('customer can reach product browsing flow', async ({ page }) => {
  await page.goto('/');

  const productSignal = page
    .getByRole('button', { name: /shop|products|catalog|explore/i })
    .or(page.getByText(/shop|products|catalog|explore/i))
    .first();
  await expect(productSignal).toBeVisible();
});

test('layout remains usable on a mobile viewport', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'mobile viewport check only');

  await page.goto('/');
  await expect(page.getByRole('button', { name: /cofkans/i })).toBeVisible();

  const menuButton = page.getByRole('button', { name: /menu|open navigation/i }).first();
  if (await menuButton.isVisible()) {
    await menuButton.click();
    await expect(page.getByRole('navigation').or(page.getByText(/shop|products|support/i)).first()).toBeVisible();
  }
});
