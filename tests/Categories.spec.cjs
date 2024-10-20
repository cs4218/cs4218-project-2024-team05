const { test, expect } = require('@playwright/test');

test.describe('Categories Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.route('**/api/v1/category/get-category', async route => {
            const responseBody = {
                category: [
                    { _id: "c1", name: "category_1", slug: "c1" },
                    { _id: "c2", name: "category_2", slug: "c2" },
                ]
            };
            route.fulfill({
                contentType: 'application/json',
                body: JSON.stringify(responseBody),
            });
        });

        await page.goto('http://localhost:3000/categories');
    });

    test('should display the correct title', async ({ page }) => {
        await expect(page).toHaveTitle(/Categories/);
    });

    test('should list all categories', async ({ page }) => {
        const categories = [
            { _id: "c1", name: "category_1", slug: "c1" },
            { _id: "c2", name: "category_2", slug: "c2" },
        ]

        for (const category of categories) {
            const button = page.getByRole('link', { name: `${category.name}` });
            await expect(button).toBeVisible();
            await expect(button).toHaveAttribute('href', `/category/${category.slug}`);
        }
    });

    test('should navigate to category details on click', async ({ page }) => {
        const categories = [
            { _id: "c1", name: "category_1", slug: "c1" },
            { _id: "c2", name: "category_2", slug: "c2" },
        ]

        await page.getByRole('link', { name: `${categories[0].name}` }).click();
        await expect(page).toHaveURL(`http://localhost:3000/category/${categories[0].slug}`);

    });

    test('should navigate back to the Home page', async ({ page }) => {
        await page.getByRole('link', { name: 'Home' }).click();

        await expect(page).toHaveURL(`http://localhost:3000`);
    });
});