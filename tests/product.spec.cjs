import { test, expect } from "@playwright/test";

test.describe("ProductDetails Component Flow", () => {
  const mockProduct = {
    _id: "1",
    name: "Test Product",
    description: "This is a test product.",
    slug: "test-product",
    price: 50,
    category: {
      _id: "c1",
      name: "Category 1",
    },
  };

  const mockRelatedProducts = [
    {
      _id: "2",
      name: "Related Product 1",
      description: "Description for related product 1.",
      slug: "related-product-1",
      price: 40,
      category: {
        _id: "c1",
        name: "Category 1",
      },
    },
    {
      _id: "3",
      name: "Related Product 2",
      description: "Description for related product 2.",
      slug: "related-product-2",
      price: 60,
      category: {
        _id: "c1",
        name: "Category 1",
      },
    },
  ];

  test.beforeEach(async ({ page }) => {
    // Mock the API response for the product details
    await page.route("**/api/v1/product/get-product/test-product", async (route) => {
      route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ product: mockProduct }),
      });
    });

    // Mock the API response for the related products
    await page.route("**/api/v1/product/related-product/1/c1", async (route) => {
      route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ products: mockRelatedProducts }),
      });
    });

    await page.goto("http://localhost:3000/product/test-product");
  });

  test("should display product details correctly", async ({ page }) => {
    // Check that the main product details are displayed
    await expect(page.locator("h6:has-text('Name : Test Product')")).toBeVisible();
    await expect(page.locator("h6:has-text('Description : This is a test product.')")).toBeVisible();
    await expect(page.locator("h6:has-text('Price : $50.00')")).toBeVisible();
    await expect(page.locator("h6:has-text('Category : Category 1')")).toBeVisible();
  });

  test("should display related products correctly", async ({ page }) => {
    // Check that the similar products section title is visible
    await expect(page.locator("h4:has-text('Similar Products ➡️')")).toBeVisible();

    // Check for the related products
    for (const relatedProduct of mockRelatedProducts) {
      await expect(page.locator(`h5:has-text('${relatedProduct.name}')`)).toBeVisible();
      await expect(page.locator(`p:has-text('${relatedProduct.description.substring(0, 60)}...')`)).toBeVisible();
      await expect(
        page.locator(`h5.card-price:has-text('$${relatedProduct.price}.00')`)
      ).toBeVisible();
    }
  });

  test("should show 'No Similar Products found' if there are no related products", async ({ page }) => {
    // Override the related products route to return an empty array
    await page.route("**/api/v1/product/related-product/1/c1", async (route) => {
      route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ products: [] }),
      });
    });

    // Reload the page to apply the new mock response
    await page.reload();

    // Check for the message indicating no similar products
    await expect(page.locator("p:has-text('No Similar Products found')")).toBeVisible();
  });
});
