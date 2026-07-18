import { test, expect } from "@playwright/test";
import { openFirstProduct } from "./helpers";

test.describe("storefront", () => {
  test("home page loads with collections", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    // Collections section is present
    await expect(page.locator("#categories")).toBeVisible();
  });

  test("Explore CTA navigates to /collections (not a single category)", async ({ page }) => {
    await page.goto("/");
    const cta = page.getByRole("link", { name: /explore collections/i }).first();
    await expect(cta).toHaveAttribute("href", "/collections");
    await cta.click();
    await expect(page).toHaveURL(/\/collections$/);
    await expect(page.getByRole("heading", { name: /collections/i })).toBeVisible();
  });

  test("/collections lists category cards", async ({ page }) => {
    await page.goto("/collections");
    const cards = page.getByRole("link", { name: /view .* category/i });
    await expect(cards.first()).toBeVisible();
  });

  test("footer Browse Collections goes to /collections", async ({ page }) => {
    await page.goto("/");
    const link = page.getByRole("link", { name: /browse collections/i });
    await expect(link).toHaveAttribute("href", "/collections");
  });

  test("category -> product navigation works", async ({ page }) => {
    await page.goto("/collections");
    await page.getByRole("link", { name: /view .* category/i }).first().click();
    await expect(page).toHaveURL(/\/categories\//);
  });

  test("product WhatsApp link never contains a base64 image", async ({ page }) => {
    // Reach a product page (skipping any empty category).
    await openFirstProduct(page);
    // The order CTA opens a sheet; the actual wa.me link ("Continue on
    // WhatsApp") carries the rich, pre-filled order message built from the
    // product data — the one place a base64 image could leak into the URL.
    await page.getByRole("button", { name: /order on whatsapp/i }).first().click();
    const dialog = page.getByRole("dialog", { name: "Order details" });
    await expect(dialog).toBeVisible();
    const wa = dialog.getByRole("link", { name: /continue on whatsapp/i });
    const href = (await wa.getAttribute("href")) || "";
    expect(href).not.toContain("data:image");
    expect(href).not.toContain("base64");
    expect(href).toContain("wa.me/");
  });
});
