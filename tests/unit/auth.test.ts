import { describe, it, expect, beforeEach } from "vitest";
import {
  verifyPassword,
  createSessionToken,
  isValidSessionToken,
} from "@/lib/auth";

// Ensure a deterministic password/secret for these tests.
beforeEach(() => {
  process.env.ADMIN_PASSWORD = "s3cret-pass";
  process.env.SESSION_SECRET = "unit-test-secret";
});

describe("verifyPassword", () => {
  it("accepts the correct password", () => {
    expect(verifyPassword("s3cret-pass")).toBe(true);
  });

  it("rejects an incorrect password", () => {
    expect(verifyPassword("wrong")).toBe(false);
  });

  it("rejects empty / non-string values", () => {
    expect(verifyPassword("")).toBe(false);
    expect(verifyPassword(undefined)).toBe(false);
    expect(verifyPassword(123)).toBe(false);
  });
});

describe("session tokens", () => {
  it("creates a token that validates", () => {
    const token = createSessionToken();
    expect(isValidSessionToken(token)).toBe(true);
  });

  it("rejects an empty/undefined token", () => {
    expect(isValidSessionToken(undefined)).toBe(false);
    expect(isValidSessionToken("")).toBe(false);
  });

  it("rejects a tampered token", () => {
    const token = createSessionToken();
    const tampered = token.slice(0, -2) + "00";
    expect(isValidSessionToken(tampered)).toBe(false);
  });

  it("rejects a malformed token", () => {
    expect(isValidSessionToken("not.a.valid.token.shape")).toBe(false);
    expect(isValidSessionToken("admin.123")).toBe(false);
  });

  it("rejects an expired token", () => {
    const past = Date.now() - 1000 * 60 * 60 * 24; // 24h ago
    const token = createSessionToken(past);
    expect(isValidSessionToken(token)).toBe(false);
  });

  it("rejects a token signed with a different secret", () => {
    const token = createSessionToken();
    process.env.SESSION_SECRET = "a-different-secret";
    expect(isValidSessionToken(token)).toBe(false);
  });
});
