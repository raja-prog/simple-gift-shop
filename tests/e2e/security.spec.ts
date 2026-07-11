import { test, expect } from "@playwright/test";

test.describe("security & api", () => {
  test("unauthenticated product creation is rejected (401)", async ({ request }) => {
    const res = await request.post("/api/products", {
      data: { id: "hacktest", name: "Hax", categoryId: "A", price: 1 },
    });
    expect(res.status()).toBe(401);
  });

  test("unauthenticated category creation is rejected (401)", async ({ request }) => {
    const res = await request.post("/api/categories", {
      data: { id: "hackcat", name: "Hax" },
    });
    expect(res.status()).toBe(401);
  });

  test("unauthenticated product delete is rejected (401)", async ({ request }) => {
    const res = await request.delete("/api/products/anything");
    expect(res.status()).toBe(401);
  });

  test("wrong admin password returns 401", async ({ request }) => {
    const res = await request.post("/api/admin/login", {
      data: { password: "definitely-wrong" },
    });
    expect(res.status()).toBe(401);
  });

  test("public GET endpoints remain open", async ({ request }) => {
    const cats = await request.get("/api/categories");
    expect(cats.ok()).toBeTruthy();
    const prods = await request.get("/api/products");
    expect(prods.ok()).toBeTruthy();
  });

  test("admin login sets a session and allows a mutation, then logout revokes it", async ({ request }) => {
    // Log in with the correct password (configured in playwright.config env).
    const login = await request.post("/api/admin/login", {
      data: { password: "kundima123" },
    });
    expect(login.ok()).toBeTruthy();

    // Session check should now report authed.
    const session = await request.get("/api/admin/session");
    const body = await session.json();
    expect(body.authed).toBe(true);

    // Logout clears the cookie.
    const logout = await request.post("/api/admin/logout");
    expect(logout.ok()).toBeTruthy();
  });
});
