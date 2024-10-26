const { test, expect } = require('@playwright/test');

test.describe('HomePage', () => {
    const mockProducts = [
        {
            _id: "1",
            name: "Test Product 1",
            description: "Description for test product 1",
            slug: "test-product-1",
            price: 50,
            category: "c1"
        },
        {
            _id: "2",
            name: "Test Product 2",
            description: "Description for test product 2",
            slug: "test-product-2",
            price: 100,
            category: "c2"
        },
    ];
    const mockCategories = [
        {
            _id: "c1",
            name: "Category 1"
        },
        {
            _id: "c2",
            name: "Category 2"
        }
    ];
    test.beforeEach(async ({ page }) => {
        // Intercept API calls and return mock data
        await page.route('**/api/v1/category/get-category', async route => {
            route.fulfill({
                contentType: 'application/json',
                body: JSON.stringify({ success: true, category: mockCategories }),
            });
        });

        await page.route('**/api/v1/product/product-list/1', async route => {
            route.fulfill({
                contentType: 'application/json',
                body: JSON.stringify({ products: mockProducts }),
            });
        });

        await page.route('**/api/v1/product/product-count', async route => {
            route.fulfill({
                contentType: 'application/json',
                body: JSON.stringify({ total: mockProducts.length }),
            });
        });

        await page.goto('http://localhost:3000');
    });

    test('should display the correct title and banner', async ({ page }) => {
        const bannerImage = page.locator('.banner-img');
        await expect(bannerImage).toBeVisible();
        await expect(page.locator('text=All products')).toBeVisible();
    });

    test('should display all categories and filter by category', async ({ page }) => {
        const categoriesContainer = page.locator('.filters'); 
        for (const category of mockCategories) {
            await expect(categoriesContainer.locator(`text=${category.name}`)).toBeVisible();
        }

        await categoriesContainer.locator(`text=${mockCategories[0].name}`).check()

        const filteredProducts = mockProducts.filter(product => product.category === mockCategories[0]._id);
        for (const product of filteredProducts) {
            const productCard = page.getByRole('heading', { name: `${product.name}` })
            await expect(productCard).toBeVisible();
        }
    });

    test('should display all products', async ({ page }) => {
        for (const product of mockProducts.slice(0, 6)) {
            const productCard = page.getByRole('heading', { name: `${product.name}` })
            await expect(productCard).toBeVisible();
        }
    });

    test('should navigate to product details when "More Details" is clicked', async ({ page }) => {
        // click more details on the first product
        await page.click('text=More Details');
        const firstProduct = mockProducts[0];
        await expect(page).toHaveURL(`http://localhost:3000/product/${firstProduct.slug}`);
    });

    test('should add product to cart and show success toast', async ({ page }) => {
        await page.click(`text=ADD TO CART`);

        const toastLocator = page.locator('text=Item Added to cart');
        await expect(toastLocator).toBeVisible();
    });

});