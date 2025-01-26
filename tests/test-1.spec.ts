import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByText('Upload CSV(Choose file or').click();
  await page.locator('body').setInputFiles('bar_chart_sample.csv');
  await page.getByRole('button', { name: 'Confirm table name, column' }).click();
  await page.locator('.view-lines').click();
  await page.getByRole('textbox', { name: 'Editor content' }).fill('select * from bar_chart_sample;');
  await page.getByRole('combobox').filter({ hasText: 'Bar Chart' }).click();
  await page.getByRole('option', { name: 'Area Chart' }).click();
});