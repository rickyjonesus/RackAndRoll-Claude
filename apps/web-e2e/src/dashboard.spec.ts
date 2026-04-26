import { test, expect } from '@playwright/test';
import { loginAs, fixtures } from './support/helpers';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page);
    await page.route('**/api/stats/summary', (route) =>
      route.fulfill({ json: fixtures.statsSummary }),
    );
  });

  test('displays all stats cards with correct values', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page.getByText('Wins')).toBeVisible();
    await expect(page.getByText('Losses')).toBeVisible();
    await expect(page.getByText('Win %')).toBeVisible();
    await expect(page.getByText('Streak')).toBeVisible();

    // wins: 7, losses: 3, winPct: 0.7 → '70%' (format '1.0-1'), streak: 3
    const cards = page.locator('.card');
    await expect(cards.filter({ hasText: 'Wins' }).locator('.value')).toHaveText('7');
    await expect(cards.filter({ hasText: 'Losses' }).locator('.value')).toHaveText('3');
    await expect(cards.filter({ hasText: 'Win %' }).locator('.value')).toHaveText('70%');
    await expect(cards.filter({ hasText: 'Streak' }).locator('.value')).toHaveText('3');
  });

  test('shows quick action links', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page.getByRole('link', { name: 'Log Match' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Challenge Player' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Stats' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Leagues' })).toBeVisible();
  });

  test('Log Match link navigates to new match page', async ({ page }) => {
    await page.route('**/api/users/search**', (route) => route.fulfill({ json: [] }));

    await page.goto('/dashboard');
    await page.getByRole('link', { name: 'Log Match' }).click();

    await expect(page).toHaveURL(/\/matches\/new/);
    await expect(page.getByRole('heading', { name: 'Log Match' })).toBeVisible();
  });

  test('Challenge Player link navigates to challenge page', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('link', { name: 'Challenge Player' }).click();

    await expect(page).toHaveURL(/\/schedule\/challenge/);
    await expect(page.getByRole('heading', { name: 'Challenge a Player' })).toBeVisible();
  });

  test('Stats link navigates to stats page', async ({ page }) => {
    await page.route('**/api/stats/summary', (route) =>
      route.fulfill({ json: fixtures.statsSummary }),
    );

    await page.goto('/dashboard');
    await page.getByRole('link', { name: 'Stats' }).click();

    await expect(page).toHaveURL(/\/stats/);
    await expect(page.getByRole('heading', { name: 'Stats' })).toBeVisible();
  });

  test('Leagues link navigates to leagues page', async ({ page }) => {
    await page.route('**/api/leagues', (route) =>
      route.fulfill({ json: fixtures.leagues }),
    );

    await page.goto('/dashboard');
    await page.getByRole('link', { name: 'Leagues' }).click();

    await expect(page).toHaveURL(/\/leagues/);
    await expect(page.getByRole('heading', { name: 'Leagues' })).toBeVisible();
  });
});
