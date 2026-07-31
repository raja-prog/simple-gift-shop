// Extract base64 product images from backups/db-backup.json into .image-staging/
// so they can be uploaded to Cloudinary. Writes a manifest.json mapping each
// product/gallery id to its local file (or existing remote URL).
// Usage: node scripts/extract-images.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const backupFile = path.join(root, 'backups', 'db-backup.json');
const outDir = path.join(root, '.image-staging');

const mimeExt = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif', 'image/svg+xml': 'svg' };

function parseDataUri(s) {
  const m = /^data:([a-zA-Z0-9.+/-]+);base64,(.*)$/s.exec(s || '');
  if (!m) return null;
  return { mime: m[1].toLowerCase(), buf: Buffer.from(m[2], 'base64') };
}

const backup = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
const products = backup.data?.products ?? [];
const gallery = backup.data?.productImages ?? [];

fs.mkdirSync(outDir, { recursive: true });

const manifest = { products: [], gallery: [] };
let base64Count = 0, remoteCount = 0, emptyCount = 0, bytes = 0;

for (const p of products) {
  const parsed = parseDataUri(p.image);
  if (parsed) {
    const ext = mimeExt[parsed.mime] || 'bin';
    const file = `product-${p.id}.${ext}`;
    fs.writeFileSync(path.join(outDir, file), parsed.buf);
    manifest.products.push({ id: p.id, source: 'base64', mime: parsed.mime, file, bytes: parsed.buf.length });
    base64Count++; bytes += parsed.buf.length;
  } else if (typeof p.image === 'string' && /^https?:\/\//i.test(p.image)) {
    manifest.products.push({ id: p.id, source: 'remote', url: p.image });
    remoteCount++;
  } else {
    manifest.products.push({ id: p.id, source: 'none' });
    emptyCount++;
  }
}

for (const g of gallery) {
  const parsed = parseDataUri(g.url);
  if (parsed) {
    const ext = mimeExt[parsed.mime] || 'bin';
    const file = `gallery-${g.id}.${ext}`;
    fs.writeFileSync(path.join(outDir, file), parsed.buf);
    manifest.gallery.push({ id: g.id, productId: g.productId, source: 'base64', mime: parsed.mime, file, bytes: parsed.buf.length });
    bytes += parsed.buf.length;
  } else if (typeof g.url === 'string' && /^https?:\/\//i.test(g.url)) {
    manifest.gallery.push({ id: g.id, productId: g.productId, source: 'remote', url: g.url });
  }
}

fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

console.log('Extracted to', outDir);
console.log(JSON.stringify({
  products: products.length,
  base64Images: base64Count,
  remoteImages: remoteCount,
  noImage: emptyCount,
  galleryImages: manifest.gallery.length,
  totalMB: +(bytes / 1048576).toFixed(2),
}, null, 2));
