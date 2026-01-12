import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
    test('should allow a user to login and see the dashboard', async ({ page }) => {
        // Navigate to the login page
        await page.goto('/login');

        // Fill in credentials
        await page.fill('input[type="email"]', 'employee1@company.com');
        await page.fill('input[type="password"]', 'password123');

        // Click sign in
        await page.click('button[type="submit"]');

        // Should redirect to dashboard
        await expect(page).toHaveURL(/\/$/);

        // Should see welcome message
        await expect(page.getByRole('heading', { name: /Welcome back/ })).toBeVisible({ timeout: 10000 });
        await expect(page.getByRole('heading', { name: /Welcome back/ })).toContainText('Welcome back');

        // Should see vacation balance cards
        await expect(page.locator('.grid >> div >> h3').first()).toBeVisible();
    });

    test('should show error message on invalid credentials', async ({ page }) => {
        await page.goto('/login');

        await page.fill('input[type="email"]', 'wrong@example.com');
        await page.fill('input[type="password"]', 'wrongpassword');
        await page.click('button[type="submit"]');

        await expect(page.locator('#login-error')).toBeVisible();
        await expect(page.locator('#login-error')).toContainText('Invalid email or password');
    });
});
