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
