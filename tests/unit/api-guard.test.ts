import { describe, it, expect, beforeEach, vi } from "vitest";
import { _resetRateLimiter } from "@/lib/rate-limit";

// Mock the admin check so we can drive both authed/unauthed branches.
const isAdmin = vi.fn();
vi.mock("@/lib/auth", () => ({
  isAdminRequest: () => isAdmin(),
}));

import { guardMutation, tooLarge, MAX_BODY_BYTES } from "@/lib/api-guard";

function reqWithIp(ip: string) {
  return new Request("http://localhost/api/products", {
    method: "POST",
    headers: { "x-forwarded-for": ip },
  });
}

beforeEach(() => {
  _resetRateLimiter();
  isAdmin.mockReset();
});

describe("guardMutation", () => {
  it("returns 401 when not authenticated", async () => {
    isAdmin.mockResolvedValue(false);
    const res = await guardMutation(reqWithIp("10.0.0.1"));
    expect(res).not.toBeNull();
    expect(res!.status).toBe(401);
  });

  it("returns null (passes) when authenticated", async () => {
    isAdmin.mockResolvedValue(true);
    const res = await guardMutation(reqWithIp("10.0.0.2"));
    expect(res).toBeNull();
  });

  it("returns 429 after too many requests from one IP", async () => {
    isAdmin.mockResolvedValue(true);
    let last = null as Awaited<ReturnType<typeof guardMutation>>;
    for (let i = 0; i < 45; i++) {
      last = await guardMutation(reqWithIp("10.0.0.3"));
    }
    expect(last).not.toBeNull();
    expect(last!.status).toBe(429);
  });
});

describe("tooLarge", () => {
  it("is false for small payloads", () => {
    expect(tooLarge("hello")).toBe(false);
  });

  it("is true for payloads over the cap", () => {
    const big = "a".repeat(MAX_BODY_BYTES + 1);
    expect(tooLarge(big)).toBe(true);
  });
});
