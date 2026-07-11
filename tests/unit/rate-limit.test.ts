import { describe, it, expect, beforeEach } from "vitest";
import { rateLimit, clientIp, _resetRateLimiter } from "@/lib/rate-limit";

beforeEach(() => {
  _resetRateLimiter();
});

describe("rateLimit", () => {
  it("allows requests under the limit", () => {
    const now = 1_000_000;
    for (let i = 0; i < 5; i++) {
      const r = rateLimit("ip-a", 5, 10_000, now);
      expect(r.allowed).toBe(true);
    }
  });

  it("blocks the request that exceeds the limit", () => {
    const now = 1_000_000;
    for (let i = 0; i < 3; i++) rateLimit("ip-b", 3, 10_000, now);
    const over = rateLimit("ip-b", 3, 10_000, now);
    expect(over.allowed).toBe(false);
    expect(over.remaining).toBe(0);
  });

  it("resets after the window passes", () => {
    const start = 1_000_000;
    for (let i = 0; i < 3; i++) rateLimit("ip-c", 3, 10_000, start);
    expect(rateLimit("ip-c", 3, 10_000, start).allowed).toBe(false);
    // After the window expires, counting restarts.
    const later = start + 10_001;
    expect(rateLimit("ip-c", 3, 10_000, later).allowed).toBe(true);
  });

  it("tracks different keys independently", () => {
    const now = 1_000_000;
    for (let i = 0; i < 3; i++) rateLimit("ip-d", 3, 10_000, now);
    expect(rateLimit("ip-d", 3, 10_000, now).allowed).toBe(false);
    expect(rateLimit("ip-e", 3, 10_000, now).allowed).toBe(true);
  });
});

describe("clientIp", () => {
  it("reads the Netlify client IP header first", () => {
    const h = new Headers({ "x-nf-client-connection-ip": "1.2.3.4" });
    expect(clientIp(h)).toBe("1.2.3.4");
  });

  it("falls back to the first x-forwarded-for entry", () => {
    const h = new Headers({ "x-forwarded-for": "5.6.7.8, 9.9.9.9" });
    expect(clientIp(h)).toBe("5.6.7.8");
  });

  it("returns 'unknown' when no ip headers exist", () => {
    expect(clientIp(new Headers())).toBe("unknown");
  });
});
