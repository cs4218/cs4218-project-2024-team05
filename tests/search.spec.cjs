import { test, expect } from "@playwright/test";

test.describe("Search Component Flow", () => {
  const mockProducts = [
    {
      _id: "1",
      name: "Test Product 1",
      description: "test 1",
      slug: "test-product-1",
      price: 50,
      category: "c1",
    },
    {
      _id: "2",
      name: "Test Product 2",
      description: "test 2",
      slug: "test-product-2",
      price: 100,
      category: "c2",
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
    await page.route("**/api/v1/category/get-category", async (route) => {
      route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ success: true, category: mockCategories }),
      });
    });

    await page.route("**/api/v1/product/product-list/1", async (route) => {
      route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ products: mockProducts }),
      });
    });

    await page.route("**/api/v1/product/product-count", async (route) => {
      route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ total: mockProducts.length }),
      });
    });

    await page.goto("http://localhost:3000");
  });

  test("should display 'No Products Found' when no search results", async ({ page }) => {
    await page.fill('input[placeholder="Search"]', "NonExistingProduct");
    await page.click('button[type="submit"]');

    // Verify "No Products Found" message
    await expect(page.getByText("No Products Found")).toBeVisible();
  });

  test("should display product results when search matches", async ({ page }) => {
    await page.fill('input[placeholder="Search"]', "Test Product");
    await page.click('button[type="submit"]');

    // Verify the search results display the found products
    await expect(page.getByText("Test Product 1")).toBeVisible();
    await expect(page.getByText("Test Product 2")).toBeVisible();
  });
});
