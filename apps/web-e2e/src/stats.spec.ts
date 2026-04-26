import { test, expect } from '@playwright/test';
import { loginAs, fixtures } from './support/helpers';

test.describe('Stats', () => {
  test.describe('Stats Dashboard', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page);
      await page.route('**/api/stats/summary', (route) =>
        route.fulfill({ json: fixtures.statsSummary }),
      );
    });

    test('displays all stat labels', async ({ page }) => {
      await page.goto('/stats');

      await expect(page.getByRole('heading', { name: 'Stats' })).toBeVisible();
      await expect(page.getByText('Played')).toBeVisible();
      await expect(page.getByText('Wins')).toBeVisible();
      await expect(page.getByText('Losses')).toBeVisible();
      await expect(page.getByText('Win %')).toBeVisible();
      await expect(page.getByText('Streak')).toBeVisible();
    });

    test('displays correct stat values', async ({ page }) => {
      await page.goto('/stats');

      // played: 10, wins: 7, losses: 3, winPct: 0.7 → '70.0%' (format '1.1-1'), streak: 3
      const stats = page.locator('.stat');
      await expect(stats.filter({ hasText: 'Played' }).locator('span')).toHaveText('10');
      await expect(stats.filter({ hasText: 'Wins' }).locator('span')).toHaveText('7');
      await expect(stats.filter({ hasText: 'Losses' }).locator('span')).toHaveText('3');
      await expect(stats.filter({ hasText: 'Win %' }).locator('span')).toHaveText('70.0%');
      await expect(stats.filter({ hasText: 'Streak' }).locator('span')).toHaveText('3');
    });

    test('shows View Rating Chart link', async ({ page }) => {
      await page.goto('/stats');
      await expect(page.getByRole('link', { name: 'View Rating Chart' })).toBeVisible();
    });

    test('displays zeros for a player with no history', async ({ page }) => {
      await page.route('**/api/stats/summary', (route) =>
        route.fulfill({ json: { played: 0, wins: 0, losses: 0, winPct: 0, streak: 0 } }),
      );

      await page.goto('/stats');

      const stats = page.locator('.stat');
      await expect(stats.filter({ hasText: 'Played' }).locator('span')).toHaveText('0');
      await expect(stats.filter({ hasText: 'Win %' }).locator('span')).toHaveText('0.0%');
    });
  });

  test.describe('Head-to-Head', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page);
      await page.route('**/api/stats/h2h/player-2', (route) =>
        route.fulfill({ json: fixtures.h2hMatches }),
      );
    });

    test('displays head-to-head heading', async ({ page }) => {
      await page.goto('/stats/h2h/player-2');
      await expect(page.getByRole('heading', { name: 'Head-to-Head' })).toBeVisible();
    });

    test('lists all head-to-head matches with scores and game type', async ({ page }) => {
      await page.goto('/stats/h2h/player-2');

      await expect(page.getByText('Test User 7 – 5 Bob Smith')).toBeVisible();
      await expect(page.getByText('EIGHT_BALL').first()).toBeVisible();

      await expect(page.getByText('Bob Smith 7 – 3 Test User')).toBeVisible();
      await expect(page.getByText('NINE_BALL')).toBeVisible();
    });

    test('displays formatted match dates', async ({ page }) => {
      await page.goto('/stats/h2h/player-2');

      // Angular shortDate pipe: '4/15/26' or similar locale-dependent format
      const rows = page.locator('.match-row');
      await expect(rows).toHaveCount(2);
    });

    test('shows empty list gracefully when no h2h matches', async ({ page }) => {
      await page.route('**/api/stats/h2h/player-2', (route) =>
        route.fulfill({ json: [] }),
      );

      await page.goto('/stats/h2h/player-2');

      await expect(page.getByRole('heading', { name: 'Head-to-Head' })).toBeVisible();
      await expect(page.locator('.match-row')).toHaveCount(0);
    });
  });
});
