import { test, expect } from '@playwright/test';
import { loginAs, fixtures } from './support/helpers';

test.describe('Matches', () => {
  test.describe('Match History', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page);
      await page.route('**/api/matches/history', (route) =>
        route.fulfill({ json: fixtures.matchesHistory }),
      );
    });

    test('displays match history heading and log match link', async ({ page }) => {
      await page.goto('/matches');
      await expect(page.getByRole('heading', { name: 'Match History' })).toBeVisible();
      await expect(page.getByRole('link', { name: '+ Log Match' })).toBeVisible();
    });

    test('lists all matches with player names and scores', async ({ page }) => {
      await page.goto('/matches');

      await expect(page.getByText('Test User vs Bob Smith')).toBeVisible();
      await expect(page.getByText('5 – 3')).toBeVisible();
      await expect(page.getByText('EIGHT_BALL').first()).toBeVisible();

      await expect(page.getByText('Test User vs Alice Chen')).toBeVisible();
      await expect(page.getByText('2 – 7')).toBeVisible();
      await expect(page.getByText('NINE_BALL')).toBeVisible();
    });

    test('Log Match link navigates to new match page', async ({ page }) => {
      await page.route('**/api/users/search**', (route) => route.fulfill({ json: [] }));

      await page.goto('/matches');
      await page.getByRole('link', { name: '+ Log Match' }).click();

      await expect(page).toHaveURL(/\/matches\/new/);
    });
  });

  test.describe('New Match – Player Search', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page);
    });

    test('renders new match form', async ({ page }) => {
      await page.route('**/api/users/search**', (route) => route.fulfill({ json: [] }));

      await page.goto('/matches/new');
      await expect(page.getByRole('heading', { name: 'Log Match' })).toBeVisible();
      await expect(page.getByPlaceholder('Search player by name or email')).toBeVisible();
      await expect(page.getByRole('combobox')).toBeVisible(); // gameType select
      await expect(page.getByPlaceholder('Race to (racks)')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Start Match' })).toBeDisabled();
    });

    test('shows search results dropdown after typing 2+ characters', async ({ page }) => {
      await page.route('**/api/users/search**', (route) =>
        route.fulfill({ json: fixtures.playerSearch }),
      );

      await page.goto('/matches/new');
      await page.getByPlaceholder('Search player by name or email').fill('Bo');

      await expect(page.locator('.results-dropdown')).toBeVisible();
      await expect(page.getByText('Bob Smith')).toBeVisible();
      await expect(page.getByText('Bob Jones')).toBeVisible();
      await expect(page.locator('.rating').first()).toBeVisible();
    });

    test('does not show dropdown for single character input', async ({ page }) => {
      await page.route('**/api/users/search**', (route) =>
        route.fulfill({ json: fixtures.playerSearch }),
      );

      await page.goto('/matches/new');
      await page.getByPlaceholder('Search player by name or email').fill('B');

      await expect(page.locator('.results-dropdown')).not.toBeVisible();
    });

    test('selecting a player from dropdown shows selected player chip', async ({ page }) => {
      await page.route('**/api/users/search**', (route) =>
        route.fulfill({ json: fixtures.playerSearch }),
      );

      await page.goto('/matches/new');
      await page.getByPlaceholder('Search player by name or email').fill('Bo');
      await page.getByText('Bob Smith').click();

      await expect(page.locator('.selected-player')).toBeVisible();
      await expect(page.locator('.selected-player')).toContainText('Bob Smith');
      await expect(page.locator('.results-dropdown')).not.toBeVisible();
    });

    test('removing selected player restores search input', async ({ page }) => {
      await page.route('**/api/users/search**', (route) =>
        route.fulfill({ json: fixtures.playerSearch }),
      );

      await page.goto('/matches/new');
      await page.getByPlaceholder('Search player by name or email').fill('Bo');
      await page.getByText('Bob Smith').click();
      await page.locator('.selected-player button[title="Remove"]').click();

      await expect(page.locator('.selected-player')).not.toBeVisible();
      await expect(page.getByPlaceholder('Search player by name or email')).toBeVisible();
    });

    test('Start Match button enables after selecting a player', async ({ page }) => {
      await page.route('**/api/users/search**', (route) =>
        route.fulfill({ json: fixtures.playerSearch }),
      );

      await page.goto('/matches/new');
      await expect(page.getByRole('button', { name: 'Start Match' })).toBeDisabled();

      await page.getByPlaceholder('Search player by name or email').fill('Bo');
      await page.getByText('Bob Smith').click();

      await expect(page.getByRole('button', { name: 'Start Match' })).toBeEnabled();
    });

    test('submitting new match navigates to live scoring', async ({ page }) => {
      await page.route('**/api/users/search**', (route) =>
        route.fulfill({ json: fixtures.playerSearch }),
      );
      await page.route('**/api/matches', (route) =>
        route.fulfill({ json: { id: 'match-live' } }),
      );
      await page.route('**/api/matches/match-live', (route) =>
        route.fulfill({ json: fixtures.matchDetail }),
      );

      await page.goto('/matches/new');
      await page.getByPlaceholder('Search player by name or email').fill('Bo');
      await page.getByText('Bob Smith').click();
      await page.getByRole('button', { name: 'Start Match' }).click();

      await expect(page).toHaveURL(/\/matches\/live\/match-live/);
    });
  });

  test.describe('New Match – Guest Mode', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page);
    });

    test('guest mode link shows guest name input', async ({ page }) => {
      await page.goto('/matches/new');
      await page.getByRole('button', { name: 'Play as guest (opponent without an account)' }).click();

      await expect(page.getByPlaceholder('Guest name (optional)')).toBeVisible();
      await expect(page.getByRole('button', { name: '← Search for a registered player' })).toBeVisible();
    });

    test('Start Match enables in guest mode without entering a name', async ({ page }) => {
      await page.goto('/matches/new');
      await page.getByRole('button', { name: 'Play as guest (opponent without an account)' }).click();

      await expect(page.getByRole('button', { name: 'Start Match' })).toBeEnabled();
    });

    test('switching back from guest mode restores search', async ({ page }) => {
      await page.goto('/matches/new');
      await page.getByRole('button', { name: 'Play as guest (opponent without an account)' }).click();
      await page.getByRole('button', { name: '← Search for a registered player' }).click();

      await expect(page.getByPlaceholder('Search player by name or email')).toBeVisible();
      await expect(page.getByPlaceholder('Guest name (optional)')).not.toBeVisible();
    });

    test('guest match submission navigates to live scoring', async ({ page }) => {
      await page.route('**/api/matches', (route) =>
        route.fulfill({ json: { id: 'match-guest' } }),
      );
      await page.route('**/api/matches/match-guest', (route) =>
        route.fulfill({ json: fixtures.guestMatchDetail }),
      );

      await page.goto('/matches/new');
      await page.getByRole('button', { name: 'Play as guest (opponent without an account)' }).click();
      await page.getByPlaceholder('Guest name (optional)').fill('Walk-in Player');
      await page.getByRole('button', { name: 'Start Match' }).click();

      await expect(page).toHaveURL(/\/matches\/live\/match-guest/);
    });
  });

  test.describe('Live Scoring', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page);
      await page.route('**/api/matches/match-live', (route) =>
        route.fulfill({ json: fixtures.matchDetail }),
      );
    });

    test('displays player names and starting scores', async ({ page }) => {
      await page.goto('/matches/live/match-live');

      await expect(page.getByRole('heading', { name: 'Live Scoring' })).toBeVisible();
      await expect(page.locator('.player-name', { hasText: 'Test User' })).toBeVisible();
      await expect(page.locator('.player-name', { hasText: 'Bob Smith' })).toBeVisible();

      const scores = page.locator('.score-display');
      await expect(scores.first()).toHaveText('0');
      await expect(scores.last()).toHaveText('0');
    });

    test('displays two +Rack buttons and action buttons', async ({ page }) => {
      await page.goto('/matches/live/match-live');

      const rackBtns = page.locator('.rack-btn');
      await expect(rackBtns).toHaveCount(2);
      await expect(page.getByRole('button', { name: 'Undo Last Rack' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Finalize Match' })).toBeVisible();
    });

    test('clicking +Rack for home player increments their score', async ({ page }) => {
      await page.route('**/api/matches/match-live/racks', (route) =>
        route.fulfill({ status: 201, json: {} }),
      );

      await page.goto('/matches/live/match-live');

      const homeRackBtn = page.locator('.scoreboard .player-col').first().locator('.rack-btn');
      await homeRackBtn.click();

      await expect(page.locator('.scoreboard .player-col').first().locator('.score-display')).toHaveText('1');
      await expect(page.locator('.scoreboard .player-col').last().locator('.score-display')).toHaveText('0');
    });

    test('clicking +Rack for away player increments their score', async ({ page }) => {
      await page.route('**/api/matches/match-live/racks', (route) =>
        route.fulfill({ status: 201, json: {} }),
      );

      await page.goto('/matches/live/match-live');

      const awayRackBtn = page.locator('.scoreboard .player-col').last().locator('.rack-btn');
      await awayRackBtn.click();

      await expect(page.locator('.scoreboard .player-col').first().locator('.score-display')).toHaveText('0');
      await expect(page.locator('.scoreboard .player-col').last().locator('.score-display')).toHaveText('1');
    });

    test('undo button shows confirmation dialog with last scorer name', async ({ page }) => {
      await page.route('**/api/matches/match-live/racks', (route) =>
        route.fulfill({ status: 201, json: {} }),
      );

      await page.goto('/matches/live/match-live');

      const homeRackBtn = page.locator('.scoreboard .player-col').first().locator('.rack-btn');
      await homeRackBtn.click();

      await page.getByRole('button', { name: 'Undo Last Rack' }).click();

      await expect(page.locator('.undo-dialog')).toBeVisible();
      await expect(page.locator('.undo-dialog')).toContainText('Test User');
      await expect(page.getByRole('button', { name: 'Yes, undo' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
    });

    test('cancelling undo dismisses the dialog', async ({ page }) => {
      await page.route('**/api/matches/match-live/racks', (route) =>
        route.fulfill({ status: 201, json: {} }),
      );

      await page.goto('/matches/live/match-live');
      const homeRackBtn = page.locator('.scoreboard .player-col').first().locator('.rack-btn');
      await homeRackBtn.click();
      await page.getByRole('button', { name: 'Undo Last Rack' }).click();
      await page.getByRole('button', { name: 'Cancel' }).click();

      await expect(page.locator('.undo-dialog')).not.toBeVisible();
      await expect(page.locator('.scoreboard .player-col').first().locator('.score-display')).toHaveText('1');
    });

    test('confirming undo decrements the score', async ({ page }) => {
      await page.route('**/api/matches/match-live/racks', (route) =>
        route.fulfill({ status: 201, json: {} }),
      );
      await page.route('**/api/matches/match-live/racks/undo', (route) =>
        route.fulfill({ status: 200, json: {} }),
      );

      await page.goto('/matches/live/match-live');
      const homeRackBtn = page.locator('.scoreboard .player-col').first().locator('.rack-btn');
      await homeRackBtn.click();
      await page.getByRole('button', { name: 'Undo Last Rack' }).click();
      await page.getByRole('button', { name: 'Yes, undo' }).click();

      await expect(page.locator('.undo-dialog')).not.toBeVisible();
      await expect(page.locator('.scoreboard .player-col').first().locator('.score-display')).toHaveText('0');
    });

    test('finalizing match navigates to match history', async ({ page }) => {
      await page.route('**/api/matches/match-live/finalize', (route) =>
        route.fulfill({ status: 200, json: {} }),
      );
      await page.route('**/api/matches/history', (route) =>
        route.fulfill({ json: fixtures.matchesHistory }),
      );

      await page.goto('/matches/live/match-live');
      await page.getByRole('button', { name: 'Finalize Match' }).click();

      await expect(page).toHaveURL(/\/matches$/);
    });

    test('active match banner appears and links to live scoring', async ({ page }) => {
      await page.goto('/matches/live/match-live');

      const banner = page.locator('.active-match-banner');
      await expect(banner).toBeVisible();
      await expect(banner).toContainText('Test User vs Bob Smith');
    });

    test('guest match displays synthesized guest name', async ({ page }) => {
      await page.route('**/api/matches/match-guest', (route) =>
        route.fulfill({ json: fixtures.guestMatchDetail }),
      );

      await page.goto('/matches/live/match-guest');

      await expect(page.locator('.player-name', { hasText: 'Guest Player' })).toBeVisible();
    });
  });
});
