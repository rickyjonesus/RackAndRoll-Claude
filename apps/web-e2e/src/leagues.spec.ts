import { test, expect } from '@playwright/test';
import { loginAs, fixtures } from './support/helpers';

test.describe('Leagues', () => {
  test.describe('League List', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page);
      await page.route('**/api/leagues', (route) =>
        route.fulfill({ json: fixtures.leagues }),
      );
    });

    test('displays heading and create league link', async ({ page }) => {
      await page.goto('/leagues');
      await expect(page.getByRole('heading', { name: 'Leagues' })).toBeVisible();
      await expect(page.getByRole('link', { name: '+ Create League' })).toBeVisible();
    });

    test('lists leagues with name, game type, and status', async ({ page }) => {
      await page.goto('/leagues');

      await expect(page.getByRole('link', { name: 'Spring 8-Ball League' })).toBeVisible();
      await expect(page.getByText('EIGHT_BALL').first()).toBeVisible();
      await expect(page.getByText('ACTIVE')).toBeVisible();

      await expect(page.getByRole('link', { name: 'Winter 9-Ball' })).toBeVisible();
      await expect(page.getByText('NINE_BALL')).toBeVisible();
      await expect(page.getByText('PENDING')).toBeVisible();
    });

    test('league name link navigates to standings', async ({ page }) => {
      await page.route('**/api/leagues/league-1/standings', (route) =>
        route.fulfill({ json: fixtures.standings }),
      );

      await page.goto('/leagues');
      await page.getByRole('link', { name: 'Spring 8-Ball League' }).click();

      await expect(page).toHaveURL(/\/leagues\/league-1\/standings/);
      await expect(page.getByRole('heading', { name: 'League Standings' })).toBeVisible();
    });

    test('Create League link navigates to creation form', async ({ page }) => {
      await page.goto('/leagues');
      await page.getByRole('link', { name: '+ Create League' }).click();

      await expect(page).toHaveURL(/\/leagues\/new/);
      await expect(page.getByRole('heading', { name: 'Create League' })).toBeVisible();
    });
  });

  test.describe('Create League', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page);
    });

    test('renders create league form with all fields', async ({ page }) => {
      await page.goto('/leagues/new');

      await expect(page.getByRole('heading', { name: 'Create League' })).toBeVisible();
      await expect(page.getByPlaceholder('League name')).toBeVisible();
      await expect(page.getByRole('combobox')).toBeVisible();
      await expect(page.locator('input[type="date"]').first()).toBeVisible();
      await expect(page.locator('input[type="date"]').last()).toBeVisible();
      await expect(page.getByRole('button', { name: 'Create' })).toBeDisabled();
    });

    test('submit button disabled without required fields', async ({ page }) => {
      await page.goto('/leagues/new');

      await page.getByPlaceholder('League name').fill('My League');
      // missing startDate and endDate
      await expect(page.getByRole('button', { name: 'Create' })).toBeDisabled();
    });

    test('submit button enables with all required fields', async ({ page }) => {
      await page.goto('/leagues/new');

      await page.getByPlaceholder('League name').fill('Summer League');
      await page.locator('input[type="date"]').first().fill('2026-06-01');
      await page.locator('input[type="date"]').last().fill('2026-08-31');

      await expect(page.getByRole('button', { name: 'Create' })).toBeEnabled();
    });

    test('game type select contains all game types', async ({ page }) => {
      await page.goto('/leagues/new');

      const select = page.getByRole('combobox');
      await expect(select.locator('option[value="EIGHT_BALL"]')).toHaveText('8-Ball');
      await expect(select.locator('option[value="NINE_BALL"]')).toHaveText('9-Ball');
      await expect(select.locator('option[value="TEN_BALL"]')).toHaveText('10-Ball');
      await expect(select.locator('option[value="STRAIGHT"]')).toHaveText('Straight');
    });

    test('creating league navigates to its standings page', async ({ page }) => {
      await page.route('**/api/leagues', async (route) => {
        if (route.request().method() === 'POST') {
          await route.fulfill({ json: { id: 'league-new' } });
        } else {
          await route.fulfill({ json: fixtures.leagues });
        }
      });
      await page.route('**/api/leagues/league-new/standings', (route) =>
        route.fulfill({ json: fixtures.standings }),
      );

      await page.goto('/leagues/new');
      await page.getByPlaceholder('League name').fill('Summer League');
      await page.locator('input[type="date"]').first().fill('2026-06-01');
      await page.locator('input[type="date"]').last().fill('2026-08-31');
      await page.getByRole('button', { name: 'Create' }).click();

      await expect(page).toHaveURL(/\/leagues\/league-new\/standings/);
    });
  });

  test.describe('League Standings', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page);
      await page.route('**/api/leagues/league-1/standings', (route) =>
        route.fulfill({ json: fixtures.standings }),
      );
    });

    test('displays standings table with correct columns', async ({ page }) => {
      await page.goto('/leagues/league-1/standings');

      await expect(page.getByRole('heading', { name: 'League Standings' })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: '#', exact: true })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: 'Player', exact: true })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: 'P', exact: true })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: 'W', exact: true })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: 'L', exact: true })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: 'Pts', exact: true })).toBeVisible();
    });

    test('displays all players in rank order with correct stats', async ({ page }) => {
      await page.goto('/leagues/league-1/standings');

      const rows = page.getByRole('row').filter({ hasNot: page.getByRole('columnheader') });
      await expect(rows).toHaveCount(3);

      const firstRow = rows.first();
      await expect(firstRow.getByRole('cell').nth(0)).toHaveText('1');
      await expect(firstRow.getByRole('cell').nth(1)).toHaveText('Test User');
      await expect(firstRow.getByRole('cell').nth(2)).toHaveText('5');
      await expect(firstRow.getByRole('cell').nth(3)).toHaveText('4');
      await expect(firstRow.getByRole('cell').nth(4)).toHaveText('1');
      await expect(firstRow.getByRole('cell').nth(5)).toHaveText('12');

      const secondRow = rows.nth(1);
      await expect(secondRow.getByRole('cell').nth(0)).toHaveText('2');
      await expect(secondRow.getByRole('cell').nth(1)).toHaveText('Bob Smith');
    });
  });
});
