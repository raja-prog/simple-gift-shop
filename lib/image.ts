// Image URL utilities
// - normalizeImageUrl: trims, resolves google redirect (imgres), converts protocol-less URLs
// - isDisplayableRemote: decides if we can safely hand the URL to next/image (host allowlist + scheme checks)

const DEFAULT_ALLOWED_HOSTS = [
  'images.unsplash.com',
  'placehold.co',
  'rukminim2.flixcart.com',
  'res.cloudinary.com'
];

function getAllowedHosts(): Set<string> {
  const envHosts = (process.env.NEXT_PUBLIC_IMAGE_HOSTS || '')
    .split(',')
    .map(h => h.trim())
    .filter(Boolean);
  return new Set([...DEFAULT_ALLOWED_HOSTS, ...envHosts]);
}

export function normalizeImageUrl(raw: string | undefined | null): string | undefined {
  if (!raw) return undefined;
  let url = raw.trim();
  // Handle protocol-less (//example.com/img.jpg)
  if (url.startsWith('//')) url = 'https:' + url;
  // Resolve google redirect
  try {
    if (url.includes('google.com/imgres')) {
      const u = new URL(url);
      const original = u.searchParams.get('imgurl');
      if (original) {
        url = decodeURIComponent(original);
        // Recursively normalize the extracted value in case it's protocol-less
        return normalizeImageUrl(url);
      }
    }
  } catch { /* ignore parsing errors */ }
  return url;
}

export function isDisplayableRemote(raw: string | undefined | null): boolean {
  const url = normalizeImageUrl(raw);
  if (!url) return false;
  // Allow data URLs (e.g., uploads) for preview, we do not run host checks
  if (url.startsWith('data:')) return true;
  if (!/^https?:\/\//.test(url)) return false;
  if (url.includes('google.com/imgres')) return false; // still a redirect
  try {
    const { hostname } = new URL(url);
    const allowed = getAllowedHosts();
    return allowed.has(hostname);
  } catch {
    return false;
  }
}

// Backwards compatibility exports
export const cleanImageUrl = normalizeImageUrl;

// ---- Base64 → cacheable API-URL resolution (zero new infrastructure) ----
// Product images uploaded via admin are stored as base64 data-URIs in Postgres.
// Embedding those blobs in page HTML is slow on mobile, so at each DB read site we
// swap a base64 value for a short `/api/images/...` URL that streams the same bytes
// with cache headers. Remote URLs are returned untouched.

function isBase64Data(raw: string | undefined | null): boolean {
  return typeof raw === "string" && raw.startsWith("data:image/");
}

// Appends a cache-busting `?v=` token so /api/images can be served with a long
// (effectively immutable) CDN cache: the URL changes whenever the row's
// updatedAt changes, so an edited image shows up immediately instead of being
// stuck behind a stale cache. Requests WITHOUT a version keep the short cache
// (see app/api/images/[kind]/[id]/route.ts).
export function withImageVersion(url: string, version?: string | number | Date | null): string {
  if (version === undefined || version === null || version === "") return url;
  const token = version instanceof Date ? version.getTime() : version;
  return `${url}?v=${encodeURIComponent(String(token))}`;
}

// Insert Cloudinary auto format/quality transforms so delivered images are
// smaller (webp/avif). No-op for non-Cloudinary URLs.
function optimizeCloudinary(url: string | undefined): string | undefined {
  if (!url || !url.includes('res.cloudinary.com')) return url;
  const marker = '/image/upload/';
  const i = url.indexOf(marker);
  if (i === -1) return url;
  const start = i + marker.length;
  const rest = url.slice(start);
  if (rest.startsWith('f_auto') || rest.startsWith('q_auto')) return url;
  return url.slice(0, start) + 'f_auto,q_auto/' + rest;
}

export function productImageSrc(raw: string | undefined | null, productId: string, version?: string | number | Date | null): string | undefined {
  if (isBase64Data(raw)) return withImageVersion(`/api/images/product/${encodeURIComponent(productId)}`, version);
  return optimizeCloudinary(normalizeImageUrl(raw));
}

export function galleryImageSrc(raw: string | undefined | null, imageId: string): string | undefined {
  if (isBase64Data(raw)) return `/api/images/gallery/${encodeURIComponent(imageId)}`;
  return optimizeCloudinary(normalizeImageUrl(raw));
}

// Client-side unsigned upload to Cloudinary; returns the delivered secure URL.
export async function uploadToCloudinary(file: File): Promise<string> {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!cloud || !preset) throw new Error('Cloudinary is not configured (set NEXT_PUBLIC_CLOUDINARY_* env vars)');
  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', preset);
  form.append('folder', 'divs/product');
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, { method: 'POST', body: form });
  const json = await res.json();
  if (!res.ok) throw new Error((json as { error?: { message?: string } })?.error?.message || 'Cloudinary upload failed');
  return (json as { secure_url: string }).secure_url;
}

// Presence-only resolver for list pages. Avoids transferring huge base64 blobs from
// the DB just to render a thumbnail: the query selects a cheap "has image" flag, and
// we always route through the image API (which serves base64 or redirects remote).
export function listImageSrc(hasImage: boolean, productId: string, version?: string | number | Date | null): string | undefined {
  return hasImage ? withImageVersion(`/api/images/product/${encodeURIComponent(productId)}`, version) : undefined;
}

// True when the src can be rendered directly: our own image API path or an allowed remote host.
export function isServableImage(src: string | undefined | null): boolean {
  if (!src) return false;
  if (src.startsWith("/api/images/")) return true;
  return isDisplayableRemote(src);
}

// True when the src should bypass next/image optimization (already-sized bytes from our API).
export function isApiImage(src: string | undefined | null): boolean {
  return typeof src === "string" && src.startsWith("/api/images/");
}

/**
 * Compress/resize an image File in the browser using a canvas.
 * Returns a smaller data URL. Falls back to the original on any failure.
 */
export async function compressImageFile(
  file: File,
  { maxEdge = 1280, quality = 0.8, mimeType = 'image/jpeg' }:
    { maxEdge?: number; quality?: number; mimeType?: string } = {}
): Promise<string> {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
    return readFileAsDataURL(file);
  }
  try {
    const dataUrl = await readFileAsDataURL(file);
    const img = await loadImage(dataUrl);
    const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return dataUrl;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    const out = canvas.toDataURL(mimeType, quality);
    return out.length < dataUrl.length ? out : dataUrl;
  } catch {
    return readFileAsDataURL(file);
  }
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = ev => resolve(String(ev.target?.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
