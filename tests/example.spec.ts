import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');
  
  // Add your test assertions here
  // For example:
  await expect(page).toHaveTitle(/DuckDB/);
});

test('can interact with the application', async ({ page }) => {
  await page.goto('/');
  
  // Example test - you can modify these according to your actual application needs
  // For example, testing if the input section exists:
  await expect(page.getByRole('textbox')).toBeVisible();
});
