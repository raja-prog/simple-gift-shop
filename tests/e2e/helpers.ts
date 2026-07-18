import { expect, type Page } from "@playwright/test";

/**
 * Navigate from the storefront to the first product of the first category that
 * actually has products, then land on that product page.
 *
 * The admin regression test creates (and later deletes) an empty test category
 * that can transiently sort first on /collections. Selecting the first category
 * blindly is therefore racy under `fullyParallel`, so we skip empty categories
 * and pick one with real products instead.
 */
export async function openFirstProduct(page: Page): Promise<void> {
  await page.goto("/collections");

  // /collections streams its cards in behind a loader; wait for them to render
  // before reading hrefs (evaluateAll does not auto-wait like .click() does).
  const cards = page.getByRole("link", { name: /view .* category/i });
  await cards.first().waitFor();

  const hrefs = await cards.evaluateAll((els) =>
    els
      .map((el) => (el as HTMLAnchorElement).getAttribute("href"))
      .filter((href): href is string => Boolean(href))
  );

  for (const href of hrefs) {
    await page.goto(href);
    // Category pages also stream behind a loader; the <h1> (category name) is
    // rendered with the real content, so it marks the page as "loaded".
    await page.getByRole("heading", { level: 1 }).waitFor();
    const product = page.locator('a[href^="/product/"]').first();
    if ((await product.count()) > 0) {
      await product.click();
      await expect(page).toHaveURL(/\/product\//);
      return;
    }
  }

  throw new Error("No category with products was found on /collections");
}
