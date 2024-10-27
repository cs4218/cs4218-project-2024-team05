import { test, expect } from "@playwright/test";

test.describe("User Dashboard Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/login");
    await page.getByPlaceholder("Enter Your Email ").fill("123@123.com");
    await page.getByPlaceholder("Enter Your Password").click();
    await page.getByPlaceholder("Enter Your Password").fill("123456");
    await page.getByRole("button", { name: "LOGIN" }).click();

    await page.locator("text=Test User").click();
    await page.locator("text=DASHBOARD").click();
    await expect(page).toHaveURL("http://localhost:3000/dashboard/user");
  });

  test("should display user information correctly on dashboard", async ({
    page,
  }) => {
    await expect(
      page.getByRole("heading", { name: "Test User" })
    ).toBeVisible();

    await expect(
      page.getByRole("heading", { name: "123@123.com" })
    ).toBeVisible();

    await expect(page.getByRole("heading", { name: "q" })).toBeVisible();
  });

  test("should redirect to profile page when clicking on profile button", async ({
    page,
  }) => {
    await page.locator("text=Profile").click();
    await expect(page).toHaveURL(
      "http://localhost:3000/dashboard/user/profile"
    );
  });

  test("should redirect to orders page when clicking on profile button", async ({
    page,
  }) => {
    await page.locator("text=Orders").click();
    await expect(page).toHaveURL("http://localhost:3000/dashboard/user/orders");
  });

  test("should update profile when new input is filled in", async ({
    page,
  }) => {
    await page.locator("text=Profile").click();
    await page.getByPlaceholder("Enter Your Name").click();
    await page.getByPlaceholder("Enter Your Name").fill("Test User 1");
    await page.locator("text=UPDATE").click();
    await page.locator("text=Test User 1").click();
    await page.getByRole("link", { name: "DASHBOARD" }).click();
    await expect(
      page.getByRole("heading", { name: "Test User 1" })
    ).toBeVisible();

    await page.getByRole("link", { name: "Profile" }).click();
    await page.getByPlaceholder("Enter Your Name").click();
    await page.getByPlaceholder("Enter Your Name").fill("Test User");
    await page.getByRole("button", { name: "UPDATE" }).click();
  });
});
