import path from 'path';
import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.getByText('Upload CSV(Choose file or').click()
  ]);
  await fileChooser.setFiles('./sample/bar_chart_sample.csv');
  await page.getByRole('button', { name: 'Confirm table name, column' }).click();
  await page.locator('.view-lines').click();
  await page.getByRole('textbox', { name: 'Editor content' }).fill('select * from bar_chart_sample;');
  await page.getByRole('button').filter({ hasText: 'Run Query (CTRL+ENTER)' }).click();
  await page.getByRole('combobox').filter({ hasText: 'Bar Chart' }).click();
  await page.getByRole('option', { name: 'Area Chart' }).click();
});