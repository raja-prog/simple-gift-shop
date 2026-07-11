import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

// ── Admin auth (server-side, httpOnly signed cookie) ─────────────
// Customers NEVER authenticate. This protects ONLY the /admin page
// and the mutating API routes (create/update/delete).

export const ADMIN_COOKIE = "divs_admin";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

function getAdminPassword(): string {
  // Prefer the private (non-public) secret. Fall back to the legacy public
  // one only if that's all that's configured, then to a dev default.
  return (
    process.env.ADMIN_PASSWORD ||
    process.env.NEXT_PUBLIC_ADMIN_PASSWORD ||
    "kundima123"
  );
}

function getSecret(): string {
  // Sign tokens with a dedicated secret when available, otherwise derive
  // one from the admin password so tokens are still unforgeable.
  return process.env.SESSION_SECRET || `sig:${getAdminPassword()}`;
}

function sign(value: string): string {
  return createHmac("sha256", getSecret()).update(value).digest("hex");
}

/** Verify a plaintext password against the configured admin password. */
export function verifyPassword(candidate: unknown): boolean {
  if (typeof candidate !== "string" || candidate.length === 0) return false;
  const expected = Buffer.from(getAdminPassword());
  const got = Buffer.from(candidate);
  if (expected.length !== got.length) return false;
  return timingSafeEqual(expected, got);
}

/** Create a signed session token that expires after SESSION_TTL_MS. */
export function createSessionToken(now: number = Date.now()): string {
  const exp = now + SESSION_TTL_MS;
  const payload = `admin.${exp}`;
  return `${payload}.${sign(payload)}`;
}

/** Validate a session token's signature and expiry. */
export function isValidSessionToken(
  token: string | undefined | null,
  now: number = Date.now()
): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [role, expStr, sig] = parts;
  if (role !== "admin") return false;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < now) return false;
  const expected = sign(`${role}.${expStr}`);
  if (expected.length !== sig.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
  } catch {
    return false;
  }
}

/** Read the request cookies and return whether the caller is an authed admin. */
export async function isAdminRequest(): Promise<boolean> {
  const store = await cookies();
  return isValidSessionToken(store.get(ADMIN_COOKIE)?.value);
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: Math.floor(SESSION_TTL_MS / 1000),
};
