import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import { rateLimit, clientIp } from "@/lib/rate-limit";

// Guard for mutating API routes (POST/PUT/DELETE). Applies a generous
// rate limit and requires a valid admin session cookie. Returns a
// NextResponse to short-circuit on failure, or null to continue.
export async function guardMutation(req: Request): Promise<NextResponse | null> {
  const ip = clientIp(req.headers);
  const rl = rateLimit(`mutate:${ip}`, 40, 10_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Slow down." },
      { status: 429, headers: { "Retry-After": "10" } }
    );
  }
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

// Payload size cap (defensive against oversized base64 image floods).
export const MAX_BODY_BYTES = 8 * 1024 * 1024; // 8 MB

export function tooLarge(raw: string): boolean {
  return Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES;
}
