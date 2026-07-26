import { NextRequest } from "next/server";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";

// Serves product images that are stored as base64 data-URIs in the database as
// real binary responses. This keeps the huge base64 blobs out of the page HTML/JSON
// (a major mobile-performance win) while requiring NO new storage infrastructure —
// the bytes still live in the existing Postgres, we just deliver them cacheably.
//
// GET /api/images/product/<productId>   -> Product.image
// GET /api/images/gallery/<imageId>     -> ProductImage.url
//
// If the stored value is a remote URL (not base64), we redirect to it.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DATA_URI_PREFIX_RE = /^data:(image\/[a-zA-Z0-9.+-]+);base64,/;

async function loadRawValue(kind: string, id: string): Promise<string | null> {
  if (kind === "product") {
    const row = await prisma.product.findUnique({ where: { id }, select: { image: true } });
    return row?.image ?? null;
  }
  if (kind === "gallery") {
    const row = await prisma.productImage.findUnique({ where: { id }, select: { url: true } });
    return row?.url ?? null;
  }
  return null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ kind: string; id: string }> }
) {
  const { kind, id } = await params;
  if ((kind !== "product" && kind !== "gallery") || !id) {
    return new Response("Not found", { status: 404 });
  }

  let raw: string | null;
  try {
    raw = await loadRawValue(kind, id);
  } catch {
    return new Response("Server error", { status: 500 });
  }

  if (!raw) return new Response("Not found", { status: 404 });

  const prefix = raw.match(DATA_URI_PREFIX_RE);
  if (!prefix) {
    // Remote or non-data value: hand off to the original URL.
    if (/^https?:\/\//.test(raw) || raw.startsWith("//")) {
      const target = raw.startsWith("//") ? `https:${raw}` : raw;
      return Response.redirect(target, 307);
    }
    return new Response("Not found", { status: 404 });
  }

  const contentType = prefix[1];
  const base64 = raw.slice(prefix[0].length);
  const buffer = Buffer.from(base64, "base64");

  const etag = `"${createHash("sha1").update(base64).digest("hex")}"`;
  if (req.headers.get("if-none-match") === etag) {
    return new Response(null, { status: 304, headers: { ETag: etag } });
  }

  // A version token (?v=<updatedAt>) makes the URL content-stable: an edit bumps
  // updatedAt, producing a new URL, so versioned bytes can never change. We cache
  // those aggressively (1 year, immutable) which keeps the serverless FUNCTION
  // and the DB out of the hot path almost entirely — the key to staying inside
  // the free-tier transfer + function quotas. Un-versioned requests keep the
  // conservative 1-hour cache so a stale image can never get stuck.
  const versioned = !!req.nextUrl.searchParams.get("v");
  const browserCache = versioned
    ? "public, max-age=31536000, immutable"
    : "public, max-age=3600, stale-while-revalidate=86400";
  const cdnCache = versioned
    ? "public, durable, max-age=31536000, immutable"
    : "public, durable, max-age=3600, stale-while-revalidate=86400";

  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(buffer.byteLength),
      ETag: etag,
      "Cache-Control": browserCache,
      "Netlify-CDN-Cache-Control": cdnCache,
    },
  });
}
