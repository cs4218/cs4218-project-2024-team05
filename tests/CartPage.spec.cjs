// CartPage.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Cart Page Functionality', () => {

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('auth', JSON.stringify({
        user: {
          name: 'John Doe',
          address: '123 Test St',
        },
        token: 'test-token',
      }));
      localStorage.setItem('cart', JSON.stringify([
        {
          _id: 'prod-1',
          name: 'Test Product',
          price: 100,
          description: 'This is a test product',
        }
      ]));
    });

    await page.goto('http://localhost:3000/cart');
  });


  test('should display cart contents and user details', async ({ page }) => {

    await expect(page.locator('h1')).toContainText('Hello John Doe');

    const cartItem = page.locator('.row.card').first();
    await expect(cartItem.locator('p').first()).toContainText('Test Product');
    await expect(cartItem.locator('p').nth(1)).toContainText('This is a test product');
    await expect(cartItem.locator('p').nth(2)).toContainText('Price : 100');
  });


  test('should remove item from the cart', async ({ page }) => {

    const removeButton = page.locator('button.btn-danger');
    await removeButton.click();

    await expect(page.locator('h1')).toContainText('Your Cart Is Empty');
  });


  test('should navigate to payment when checking out', async ({ page }) => {

    const paymentButton = page.locator('button.btn-primary');
    await expect(paymentButton).toBeVisible();

    await paymentButton.click();

    await expect(paymentButton).toContainText('Make Payment');
  });

  
  test('should prompt login if user is not authenticated', async ({ page }) => {
    
    await page.addInitScript(() => {
      localStorage.removeItem('auth');
    });

    await page.reload();

    await expect(page.locator('h1')).toContainText('Hello Guest');
    const loginButton = page.locator('button.btn-outline-warning');
    await expect(loginButton).toContainText('Plase Login to checkout');
  });
});
