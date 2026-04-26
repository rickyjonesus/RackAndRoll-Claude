import { test, expect } from '@playwright/test';
import { loginAs, fixtures } from './support/helpers';

test.describe('Schedule', () => {
  test.describe('Upcoming Matches', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page);
      await page.route('**/api/scheduling/upcoming', (route) =>
        route.fulfill({ json: fixtures.challenges }),
      );
    });

    test('displays heading and challenge player link', async ({ page }) => {
      await page.goto('/schedule');
      await expect(page.getByRole('heading', { name: 'Upcoming Matches' })).toBeVisible();
      await expect(page.getByRole('link', { name: '+ Challenge Player' })).toBeVisible();
    });

    test('lists pending challenges with opponent and status', async ({ page }) => {
      await page.goto('/schedule');

      await expect(page.getByText('vs Bob Smith')).toBeVisible();
      await expect(page.getByText('EIGHT_BALL')).toBeVisible();
      await expect(page.getByText('PENDING')).toBeVisible();
    });

    test('Challenge Player link navigates to challenge form', async ({ page }) => {
      await page.goto('/schedule');
      await page.getByRole('link', { name: '+ Challenge Player' }).click();

      await expect(page).toHaveURL(/\/schedule\/challenge/);
      await expect(page.getByRole('heading', { name: 'Challenge a Player' })).toBeVisible();
    });

    test('displays empty state gracefully with no challenges', async ({ page }) => {
      await page.route('**/api/scheduling/upcoming', (route) =>
        route.fulfill({ json: [] }),
      );

      await page.goto('/schedule');

      await expect(page.getByRole('heading', { name: 'Upcoming Matches' })).toBeVisible();
      await expect(page.locator('.challenge-card')).toHaveCount(0);
    });
  });

  test.describe('Challenge Form', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page);
    });

    test('renders challenge form with all fields', async ({ page }) => {
      await page.goto('/schedule/challenge');

      await expect(page.getByRole('heading', { name: 'Challenge a Player' })).toBeVisible();
      await expect(page.getByPlaceholder('Opponent display name or ID')).toBeVisible();
      await expect(page.getByRole('combobox')).toBeVisible();
      await expect(page.locator('input[type="datetime-local"]')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Send Challenge' })).toBeDisabled();
    });

    test('submit button disabled while required fields are empty', async ({ page }) => {
      await page.goto('/schedule/challenge');

      await page.getByPlaceholder('Opponent display name or ID').fill('Bob Smith');
      // proposedAt still empty → still invalid
      await expect(page.getByRole('button', { name: 'Send Challenge' })).toBeDisabled();
    });

    test('submit button enables with all fields filled', async ({ page }) => {
      await page.goto('/schedule/challenge');

      await page.getByPlaceholder('Opponent display name or ID').fill('Bob Smith');
      await page.locator('input[type="datetime-local"]').fill('2026-05-10T19:00');

      await expect(page.getByRole('button', { name: 'Send Challenge' })).toBeEnabled();
    });

    test('game type select contains all game types', async ({ page }) => {
      await page.goto('/schedule/challenge');

      const select = page.getByRole('combobox');
      await expect(select.locator('option[value="EIGHT_BALL"]')).toHaveText('8-Ball');
      await expect(select.locator('option[value="NINE_BALL"]')).toHaveText('9-Ball');
      await expect(select.locator('option[value="TEN_BALL"]')).toHaveText('10-Ball');
      await expect(select.locator('option[value="STRAIGHT"]')).toHaveText('Straight');
    });

    test('submitting challenge navigates to schedule list', async ({ page }) => {
      await page.route('**/api/scheduling/challenges', (route) =>
        route.fulfill({ status: 201, json: { id: 'challenge-new' } }),
      );
      await page.route('**/api/scheduling/upcoming', (route) =>
        route.fulfill({ json: fixtures.challenges }),
      );

      await page.goto('/schedule/challenge');
      await page.getByPlaceholder('Opponent display name or ID').fill('Bob Smith');
      await page.locator('input[type="datetime-local"]').fill('2026-05-10T19:00');
      await page.getByRole('button', { name: 'Send Challenge' }).click();

      await expect(page).toHaveURL(/\/schedule$/);
      await expect(page.getByRole('heading', { name: 'Upcoming Matches' })).toBeVisible();
    });
  });
});
