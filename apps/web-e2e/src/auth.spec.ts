import { test, expect } from '@playwright/test';
import { fixtures } from './support/helpers';

test.describe('Authentication', () => {
  test.describe('Login', () => {
    test('renders login form', async ({ page }) => {
      await page.goto('/auth/login');
      await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
      await expect(page.getByPlaceholder('Email')).toBeVisible();
      await expect(page.getByPlaceholder('Password')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Create account' })).toBeVisible();
    });

    test('submit button is disabled while form is invalid', async ({ page }) => {
      await page.goto('/auth/login');
      await expect(page.getByRole('button', { name: 'Sign In' })).toBeDisabled();

      await page.getByPlaceholder('Email').fill('not-an-email');
      await page.getByPlaceholder('Password').fill('pass');
      await expect(page.getByRole('button', { name: 'Sign In' })).toBeDisabled();
    });

    test('submit button enables once form is valid', async ({ page }) => {
      await page.goto('/auth/login');
      await page.getByPlaceholder('Email').fill('test@example.com');
      await page.getByPlaceholder('Password').fill('password123');
      await expect(page.getByRole('button', { name: 'Sign In' })).toBeEnabled();
    });

    test('successful login navigates to dashboard', async ({ page }) => {
      await page.route('**/api/auth/login', (route) =>
        route.fulfill({ json: { accessToken: 'mock-jwt-token' } }),
      );
      await page.route('**/api/stats/summary', (route) =>
        route.fulfill({ json: fixtures.statsSummary }),
      );

      await page.goto('/auth/login');
      await page.getByPlaceholder('Email').fill('test@example.com');
      await page.getByPlaceholder('Password').fill('password123');
      await page.getByRole('button', { name: 'Sign In' }).click();

      await expect(page).toHaveURL(/\/dashboard/);
      await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    });

    test('link navigates to register page', async ({ page }) => {
      await page.goto('/auth/login');
      await page.getByRole('link', { name: 'Create account' }).click();
      await expect(page).toHaveURL(/\/auth\/register/);
    });
  });

  test.describe('Register', () => {
    test('renders register form', async ({ page }) => {
      await page.goto('/auth/register');
      await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();
      await expect(page.getByPlaceholder('Display name')).toBeVisible();
      await expect(page.getByPlaceholder('Email')).toBeVisible();
      await expect(page.getByPlaceholder('Password (8+ chars)')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Create Account' })).toBeDisabled();
      await expect(page.getByRole('link', { name: 'Already have an account?' })).toBeVisible();
    });

    test('submit button disabled with password shorter than 8 chars', async ({ page }) => {
      await page.goto('/auth/register');
      await page.getByPlaceholder('Display name').fill('Test User');
      await page.getByPlaceholder('Email').fill('test@example.com');
      await page.getByPlaceholder('Password (8+ chars)').fill('short');
      await expect(page.getByRole('button', { name: 'Create Account' })).toBeDisabled();
    });

    test('submit button enables with valid form', async ({ page }) => {
      await page.goto('/auth/register');
      await page.getByPlaceholder('Display name').fill('Test User');
      await page.getByPlaceholder('Email').fill('test@example.com');
      await page.getByPlaceholder('Password (8+ chars)').fill('password123');
      await expect(page.getByRole('button', { name: 'Create Account' })).toBeEnabled();
    });

    test('successful registration navigates to dashboard', async ({ page }) => {
      await page.route('**/api/auth/register', (route) =>
        route.fulfill({ json: { accessToken: 'mock-jwt-token' } }),
      );
      await page.route('**/api/stats/summary', (route) =>
        route.fulfill({ json: fixtures.statsSummary }),
      );

      await page.goto('/auth/register');
      await page.getByPlaceholder('Display name').fill('New User');
      await page.getByPlaceholder('Email').fill('new@example.com');
      await page.getByPlaceholder('Password (8+ chars)').fill('password123');
      await page.getByRole('button', { name: 'Create Account' }).click();

      await expect(page).toHaveURL(/\/dashboard/);
    });

    test('link navigates back to login', async ({ page }) => {
      await page.goto('/auth/register');
      await page.getByRole('link', { name: 'Already have an account?' }).click();
      await expect(page).toHaveURL(/\/auth\/login/);
    });
  });

  test.describe('Auth Guard', () => {
    test('unauthenticated user is redirected from dashboard to login', async ({ page }) => {
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('unauthenticated user is redirected from matches to login', async ({ page }) => {
      await page.goto('/matches');
      await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('root path redirects unauthenticated user to login', async ({ page }) => {
      await page.goto('/');
      await expect(page).toHaveURL(/\/auth\/login/);
    });
  });
});
