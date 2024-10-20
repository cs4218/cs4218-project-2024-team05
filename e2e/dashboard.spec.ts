import { test, expect } from "@playwright/test";

test.describe("Dashboard Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/login");
    await page.getByPlaceholder("Enter Your Email ").click();
    await page.getByPlaceholder("Enter Your Email ").fill("123@123.com");
    await page.getByPlaceholder("Enter Your Password").click();
    await page.getByPlaceholder("Enter Your Password").fill("123456");
    await page.getByRole("button", { name: "LOGIN" }).click();

    await page.goto("http://localhost:3000/dashboard/user");
  });

  test("should display user information correctly on dashboard", async ({
    page,
  }) => {
    await expect(page.locator("h3")).toHaveText("123456");

    await expect(page.locator("h3")).toHaveText("123@123.com");

    await expect(page.locator("h3")).toHaveText("123 Orchard Road");
  });

  test("should redirect to profile page when clicking on profile button", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Profile" }).click();
    await expect(page).toHaveURL(
      "http://localhost:3000/dashboard/user/profile"
    );
  });

  test("should redirect to orders page when clicking on profile button", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Orders" }).click();
    await expect(page).toHaveURL("http://localhost:3000/dashboard/user/orders");
  });

  test("should update profile when new input is filled in", async ({
    page,
  }) => {
    await page.goto("http://localhost:3000/dashboard/user/profile");
    await page.getByPlaceholder("123@123.com").click();
    await page.getByPlaceholder("123@123.com").fill("12345@123.com");
    await page.getByRole("button", { name: "UPDATE" }).click();
    await expect(page.toHaveText("12345@123.com"));
  });
});
