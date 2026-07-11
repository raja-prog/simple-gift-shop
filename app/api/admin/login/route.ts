import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ADMIN_COOKIE,
  verifyPassword,
  createSessionToken,
  sessionCookieOptions,
} from "@/lib/auth";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  // Throttle login attempts to slow brute-force guessing.
  const ip = clientIp(req.headers);
  const rl = rateLimit(`login:${ip}`, 8, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a minute." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const password = (body as { password?: unknown })?.password;
  if (!verifyPassword(password)) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const store = await cookies();
  store.set(ADMIN_COOKIE, createSessionToken(), sessionCookieOptions);
  return NextResponse.json({ ok: true });
}
