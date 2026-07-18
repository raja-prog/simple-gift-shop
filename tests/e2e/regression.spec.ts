import { test, expect } from "@playwright/test";
import { openFirstProduct } from "./helpers";

// Regression tests for the two issues fixed in this change:
//  1. Admin panel could not create a category because the page never
//     established a server session (login now sets the httpOnly cookie).
//  2. Order Helper sheet: the native date input overflowed its grid cell,
//     overlapping the pincode field and pushing the quantity stepper
//     off-screen on narrow phones. Inputs now shrink (min-w-0).

test.describe("regression: admin auth + order helper", () => {
  test("admin can log in through the UI and create a category", async ({ page }) => {
    // The Delete cleanup below triggers a window.confirm(); auto-accept it.
    page.on("dialog", (d) => d.accept());

    await page.goto("/admin");

    // Log in (password is provided by the Playwright webServer env).
    await page.getByPlaceholder("Password").fill("kundima123");
    await page.getByRole("button", { name: "Enter" }).click();

    // The panel is only reachable once the server session cookie is set.
    await expect(page.getByRole("heading", { name: "Admin Panel" })).toBeVisible();

    const catId = `e2e-cat-${Date.now()}`;
    await page.getByPlaceholder("e.g. frames").fill(catId);
    await page.getByPlaceholder("e.g. Resin Frames").fill("E2E Test Category");
    await page.getByRole("button", { name: "Add category" }).click();

    // A successful create (201 + session cookie) makes it appear in the list.
    const row = page.locator("li", { hasText: catId });
    await expect(row).toBeVisible();
    await expect(row.getByText("E2E Test Category")).toBeVisible();

    // Clean up so re-runs stay idempotent.
    await row.getByRole("button", { name: "Delete" }).click();
    await expect(page.locator("li", { hasText: catId })).toHaveCount(0);
  });

  test("order sheet keeps date/pincode separate and quantity visible at 360px", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });

    // Reach a product page through the storefront.
    await openFirstProduct(page);

    // Open the Order Helper sheet via the mobile trigger button.
    await page.getByRole("button", { name: /order on whatsapp/i }).click();
    const dialog = page.getByRole("dialog", { name: "Order details" });
    await expect(dialog).toBeVisible();

    // Quantity stepper must be present and fully inside the 360px viewport.
    const inc = dialog.getByRole("button", { name: "Increase quantity" });
    const dec = dialog.getByRole("button", { name: "Decrease quantity" });
    await expect(inc).toBeVisible();
    await expect(dec).toBeVisible();
    const incBox = await inc.boundingBox();
    expect(incBox).not.toBeNull();
    expect(incBox!.x + incBox!.width).toBeLessThanOrEqual(360);

    // Date and pincode inputs must sit side by side without overlapping.
    const dateBox = await dialog.locator('input[type="date"]').boundingBox();
    const pinBox = await dialog.locator('input[placeholder="600042"]').boundingBox();
    expect(dateBox).not.toBeNull();
    expect(pinBox).not.toBeNull();
    // Date column ends before the pincode column begins (1px rounding tolerance).
    expect(dateBox!.x + dateBox!.width).toBeLessThanOrEqual(pinBox!.x + 1);
    // Both fields stay within the viewport width.
    expect(pinBox!.x + pinBox!.width).toBeLessThanOrEqual(360);
  });
});
