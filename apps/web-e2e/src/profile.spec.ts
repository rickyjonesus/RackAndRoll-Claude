import { test, expect } from '@playwright/test';
import { loginAs, fixtures } from './support/helpers';

test.describe('Profile', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page);
    await page.route('**/api/users/me', async (route) => {
      if (route.request().method() === 'PATCH') {
        await route.fulfill({ status: 200, json: {} });
      } else {
        await route.fulfill({ json: fixtures.userMe });
      }
    });
  });

  test('displays user display name and email', async ({ page }) => {
    await page.goto('/profile');

    await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible();
    await expect(page.getByText('Test User')).toBeVisible();
    await expect(page.getByText('test@example.com')).toBeVisible();
  });

  test('pre-fills home venue from profile data', async ({ page }) => {
    await page.goto('/profile');

    await expect(page.getByPlaceholder('Home venue')).toHaveValue('The Cue Club');
  });

  test('allows editing home venue', async ({ page }) => {
    await page.goto('/profile');

    await page.getByPlaceholder('Home venue').fill('New Billiards Hall');
    await expect(page.getByPlaceholder('Home venue')).toHaveValue('New Billiards Hall');
  });

  test('Save button submits updated home venue', async ({ page }) => {
    let patchBody: unknown;
    await page.route('**/api/users/me', async (route) => {
      if (route.request().method() === 'PATCH') {
        patchBody = route.request().postDataJSON();
        await route.fulfill({ status: 200, json: {} });
      } else {
        await route.fulfill({ json: fixtures.userMe });
      }
    });

    await page.goto('/profile');
    await page.getByPlaceholder('Home venue').fill('New Billiards Hall');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(patchBody).toMatchObject({ homeVenue: 'New Billiards Hall' });
  });

  test('Sign Out button logs out and redirects to login', async ({ page }) => {
    await page.goto('/profile');

    await page.getByRole('button', { name: 'Sign Out' }).click();

    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
  });

  test('after logout, localStorage token is cleared', async ({ page }) => {
    await page.goto('/profile');
    await page.getByRole('button', { name: 'Sign Out' }).click();
    await expect(page).toHaveURL(/\/auth\/login/);

    // Verify auth state was cleared in localStorage (addInitScript token is overwritten by logout)
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeNull();
  });
});
