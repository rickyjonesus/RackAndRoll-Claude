import { test, expect } from '@playwright/test';

test('app root redirects unauthenticated users to login', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/auth\/login/);
  await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
});
