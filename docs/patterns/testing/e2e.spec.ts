import { test, expect } from '@playwright/test';

test('feature page loads', async ({ page }) => {
  await page.goto('/feature');
  await expect(page.getByRole('heading')).toBeVisible();
});
