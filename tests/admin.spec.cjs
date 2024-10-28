import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard Flow', () => {
    
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000/login');

        // Log in as admin 
        await page.getByPlaceholder('Enter Your Email ').fill('lleyi0606@gmail.com');
        await page.getByPlaceholder('Enter Your Password').click();
        await page.getByPlaceholder('Enter Your Password').fill('Test123');
        await page.getByRole('button', { name: 'LOGIN' }).click();

        await page.locator('text=LEYI').click();
        await page.locator('text=DASHBOARD').click();
        await expect(page).toHaveURL('http://localhost:3000/dashboard/admin');
    });

    // Test 1: Create and Delete Category
    test('Create and Delete Category', async ({ page }) => {
        await page.locator('text=Create Category').click();
        await page.getByPlaceholder('Enter new category').fill('test category');
        await page.getByRole('button', { name: 'Submit' }).click();

        // Wait for the success toast to appear
        await expect(page.locator('text=test category is created')).toBeVisible();

        // Check if the table cell with the test category is visible
        await expect(page.getByRole('cell', { name: 'test category' })).toBeVisible();

        // Delete the created category
        const categoryRow = page.locator('tr:has-text("test category")'); 
        const deleteButton = categoryRow.locator('button:has-text("DELETE")');
        await deleteButton.click(); 

        // Wait for the deletion success message
        await expect(page.locator('text=category is deleted')).toBeVisible();

        await expect(page.getByRole('cell', { name: 'test category' })).toBeHidden();
    });

    test('Create and Delete Product', async ({ page }) => {
        await page.locator('text=Create Product').click();
        await expect(page).toHaveURL('http://localhost:3000/dashboard/admin/create-product');

        const categorySelect = page.locator('text=Select a category');
        await categorySelect.waitFor({ state: 'visible', timeout: 5000 });
        await categorySelect.click({ force: true });
        await page.locator('.ant-select-dropdown').waitFor({ state: 'visible' });
        await page.locator('.ant-select-item-option-content').first().click();
        await page.locator('.ant-select-dropdown').waitFor({ state: 'hidden' });

        const filePath = 'assets/haribo.jpg';
        await page.setInputFiles('input[type="file"]', filePath);

        const productName = `TestPdt2_${new Date().toISOString().replace(/[:.-]/g, '')}`;

        await page.getByPlaceholder('write a name').fill(productName);
        await page.getByPlaceholder('write a description').fill('This is for testing.');
        await page.getByPlaceholder('write a Price').fill('19.99');
        await page.getByPlaceholder('write a quantity').fill('100');

        const shippingSelect = page.locator('text=Select Shipping');
        await shippingSelect.waitFor({ state: 'visible', timeout: 5000 });
        await shippingSelect.click({ force: true });
        await page.locator('.ant-select-item-option-content:has-text("Yes")').click();

        await page.locator('button:has-text("CREATE PRODUCT")').click();

        await expect(page.locator('text=Product Created Successfully')).toBeVisible();
        await expect(page).toHaveURL('http://localhost:3000/dashboard/admin/products');

        // Reload and check if product is listed
        await page.reload();
        await expect(page.locator(`text=${productName}`)).toBeVisible();

        // Delete the product
        await page.getByRole('link', { name: `${productName} ${productName}` }).click();
        await expect(page.locator('text=This is for testing.')).toBeVisible();
        page.on('dialog', dialog => {
            dialog.accept('yes'); 
        });
        await page.getByRole('button', { name: 'DELETE PRODUCT' }).click();

        // Ensure product is deleted
        await expect(page.locator(`text=${productName}`)).toBeHidden();
    });

    // Test 3: Create Product, Update Product, and Delete Product
    test('Create, Update, and Delete Product', async ({ page }) => {
        await page.locator('text=Create Product').click();
        await expect(page).toHaveURL('http://localhost:3000/dashboard/admin/create-product');

        const categorySelect = page.locator('text=Select a category');
        await categorySelect.waitFor({ state: 'visible', timeout: 5000 });
        await categorySelect.click({ force: true });
        await page.locator('.ant-select-dropdown').waitFor({ state: 'visible' });
        await page.locator('.ant-select-item-option-content').first().click();
        await page.locator('.ant-select-dropdown').waitFor({ state: 'hidden' });

        const filePath = 'assets/haribo.jpg';
        await page.setInputFiles('input[type="file"]', filePath);

        const productName = `TestPdt_${new Date().toISOString().replace(/[:.-]/g, '')}`;

        await page.getByPlaceholder('write a name').fill(productName);
        await page.getByPlaceholder('write a description').fill('This is for testing.');
        await page.getByPlaceholder('write a Price').fill('19.99');
        await page.getByPlaceholder('write a quantity').fill('100');

        const shippingSelect = page.locator('text=Select Shipping');
        await shippingSelect.waitFor({ state: 'visible', timeout: 5000 });
        await shippingSelect.click({ force: true });
        await page.locator('.ant-select-item-option-content:has-text("Yes")').click();

        // Click on the 'CREATE PRODUCT' button
        await page.locator('button:has-text("CREATE PRODUCT")').click();

        // Wait for success toast and check for success message
        await expect(page.locator('text=Product Created Successfully')).toBeVisible();
        await expect(page).toHaveURL('http://localhost:3000/dashboard/admin/products');

        // Reload and check if product is listed
        await page.reload();
        await expect(page.locator(`text=${productName}`)).toBeVisible();

        // Update the product
        await page.getByRole('link', { name: `${productName} ${productName}` }).click();
        await expect(page.locator('text=This is for testing.')).toBeVisible();
        await page.getByPlaceholder('write a description').fill('Updated description.');

        await page.locator('button:has-text("UPDATE PRODUCT")').click();
        
        // Wait for the update success message
        await expect(page.locator('text=Product updated successfully')).toBeVisible();

        // Delete the product
        await page.reload();
        await expect(page.locator(`text=${productName}`)).toBeVisible();
        await page.getByRole('link', { name: `${productName} ${productName}` }).click();
        await expect(page.locator('text=Updated description.')).toBeVisible();

        page.on('dialog', dialog => {
            dialog.accept('yes'); 
        });
        await page.getByRole('button', { name: 'DELETE PRODUCT' }).click();

        // Ensure product is deleted
        await expect(page.locator(`text=${productName}`)).toBeHidden();
    });
});
