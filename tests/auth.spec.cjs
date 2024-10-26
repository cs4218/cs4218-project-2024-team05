// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Authentication e2e tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' }); // The load event is sometimes not fired
    });

    test('should navigate to login and display correct login page, login, then logout', async ({ page }) => {
        // Navigate to login page
        await page.getByRole('link', { name: 'Login' }).click();
        // Verify login page loaded
        await expect(page).toHaveTitle('Login - Ecommerce App');
        await expect(page.getByRole('heading', { name: 'LOGIN FORM' })).toBeVisible();
        await expect(page.getByPlaceholder('Enter Your Email')).toBeEditable();
        await expect(page.getByPlaceholder('Enter Your Email')).toHaveAttribute('type', 'email');
        await expect(page.getByPlaceholder('Enter Your Password')).toBeEditable();
        await expect(page.getByPlaceholder('Enter Your Password')).toHaveAttribute('type', 'password');
        await expect(page.getByRole('button', { name: 'Forgot Password' })).toBeEnabled()
        await expect(page.getByRole('button', { name: 'Forgot Password' })).toHaveAttribute('type', 'button');
        await expect(page.getByRole('button', { name: 'LOGIN' })).toBeEnabled()
        await expect(page.getByRole('button', { name: 'LOGIN' })).toHaveAttribute('type', 'submit');
        // Login
        await page.getByPlaceholder('Enter Your Email').fill('example123@example.com');
        await page.getByPlaceholder('Enter Your Password').fill('123456');
        await page.getByRole('button', { name: 'LOGIN' }).click();
        // Verify login status
        await expect(page.getByRole('button', { name: 'Test' })).toBeVisible();
        // Logout
        await page.getByRole('button', { name: 'Test' }).click();
        await page.getByRole('link', { name: 'Logout' }).click();
        // Verify logout status
        await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
    });

    test('should login, display correct view profile page and update profile successfully', async ({ page }) => {
        // Navigate to login page
        await page.getByRole('link', { name: 'Login' }).click();
        // Login
        await page.getByPlaceholder('Enter Your Email').fill('example123@example.com');
        await page.getByPlaceholder('Enter Your Password').fill('123456');
        await page.getByRole('button', { name: 'LOGIN' }).click();
        // Navigate to profile page
        await page.getByRole('button', { name: 'Test' }).click();
        await page.getByRole('link', { name: 'Dashboard' }).click();
        await page.getByRole('link', { name: 'Profile' }).click();
        // Verify profile page loaded
        await expect(page).toHaveTitle('Your Profile');
        await expect(page.getByRole('heading', { name: 'USER PROFILE' })).toBeVisible();
        await expect(page.getByPlaceholder('Enter Your Name')).toBeEditable();
        await expect(page.getByPlaceholder('Enter Your Name')).toHaveValue('Test');
        await expect(page.getByPlaceholder('Enter Your Email')).not.toBeEditable();
        await expect(page.getByPlaceholder('Enter Your Email')).toHaveValue('example123@example.com');
        await expect(page.getByPlaceholder('Enter Your Password')).toBeEditable();
        await expect(page.getByPlaceholder('Enter Your Password')).toHaveValue('');
        await expect(page.getByPlaceholder('Enter Your Phone')).toBeEditable();
        await expect(page.getByPlaceholder('Enter Your Phone')).toHaveValue('98765432');
        await expect(page.getByPlaceholder('Enter Your Address')).toBeEditable();
        const address = await page.getByPlaceholder('Enter Your Address').inputValue();
        if (address.endsWith('1')) {
            await expect(page.getByPlaceholder('Enter Your Address')).toHaveValue('Blk123 Rainbow Road 1');
        }
        else {
            await expect(page.getByPlaceholder('Enter Your Address')).toHaveValue('Blk123 Rainbow Road 2');
        }
        await expect(page.getByRole('button', { name: 'UPDATE' })).toBeEnabled()
        await expect(page.getByRole('button', { name: 'UPDATE' })).toHaveAttribute('type', 'submit');
        // Update address
        if (address.endsWith('1')) {
            await page.getByPlaceholder('Enter Your Address').fill('Blk123 Rainbow Road 2');
        }
        else {
            await page.getByPlaceholder('Enter Your Address').fill('Blk123 Rainbow Road 1');
        }
        await page.getByRole('button', { name: 'UPDATE' }).click();
        // Verify updated address
        await expect(page.locator('div').filter({ hasText: /^Profile Updated Successfully$/ }).nth(1)).toBeVisible();
        await page.getByRole('button', { name: 'Test' }).click();
        await page.getByRole('link', { name: 'Dashboard' }).click();
        if (address.endsWith('1')) {
            await expect(page.getByRole('heading', { name: 'Blk123 Rainbow Road' })).toHaveText('Blk123 Rainbow Road 2');
        }
        else {
            await expect(page.getByRole('heading', { name: 'Blk123 Rainbow Road' })).toHaveText('Blk123 Rainbow Road 1');
        }
    });

    test('should fail login, then navigate to forgot password page', async ({ page }) => {
        // Navigate to login page
        await page.getByRole('link', { name: 'Login' }).click();
        // Attempt failed login
        await page.getByPlaceholder('Enter Your Email').fill('testingaverylongandinvalidemail@example.com');
        await page.getByPlaceholder('Enter Your Password').fill('super1duper1long1password1which1hopefully1no1one1uses');
        await page.getByRole('button', { name: 'LOGIN' }).click();
        // Verify failed login toast appears
        await expect(page.getByText('Something went wrong')).toBeVisible();
        // Navigate to forgot password page
        await page.getByRole('button', { name: 'Forgot Password' }).click();
        await expect(page.getByText('404')).toBeVisible(); // Currently, there is no forgot password page
    });

    test('should timeout when no server connection', async ({ page, context }) => {
        // Navigate to login page
        await page.getByRole('link', { name: 'Login' }).click();
        // Login
        await context.setOffline(true);
        await page.getByPlaceholder('Enter Your Email').fill('example123@example.com');
        await page.getByPlaceholder('Enter Your Password').fill('123456');
        await page.getByRole('button', { name: 'LOGIN' }).click();
        // Verify timeout toast appears
        await expect(page.getByText('Something went wrong')).toBeVisible();
    });
});
