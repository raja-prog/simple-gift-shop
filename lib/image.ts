// Image URL utilities
// - normalizeImageUrl: trims, resolves google redirect (imgres), converts protocol-less URLs
// - isDisplayableRemote: decides if we can safely hand the URL to next/image (host allowlist + scheme checks)

const DEFAULT_ALLOWED_HOSTS = [
  'images.unsplash.com',
  'placehold.co',
  'rukminim2.flixcart.com'
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
