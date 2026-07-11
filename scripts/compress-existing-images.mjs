// One-time script: compress existing base64 images stored in the database.
//
// Scans Product.image and ProductImage.url. For any value that is a base64
// `data:image/...` URL, it resizes (longest edge <= MAX_EDGE) and re-encodes
// as JPEG (QUALITY), then writes the smaller version back. Remote http(s)
// URLs and non-image data are left untouched.
//
// Usage:
//   DATABASE_URL="postgresql://..." node scripts/compress-existing-images.mjs
//   add --dry to preview savings without writing.

import { PrismaClient } from '@prisma/client';
import sharp from 'sharp';

const prisma = new PrismaClient();

const MAX_EDGE = 1280;
const QUALITY = 80;
const DRY_RUN = process.argv.includes('--dry');

function isDataImage(s) {
  return typeof s === 'string' && /^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(s);
}

function bytesOf(dataUrl) {
  const idx = dataUrl.indexOf('base64,');
  if (idx === -1) return 0;
  const b64 = dataUrl.slice(idx + 7);
  return Math.floor(b64.length * 0.75);
}

async function compressDataUrl(dataUrl) {
  // Skip SVG (sharp can rasterize, but we keep vectors as-is)
  if (dataUrl.startsWith('data:image/svg')) return null;
  const idx = dataUrl.indexOf('base64,');
  const input = Buffer.from(dataUrl.slice(idx + 7), 'base64');
  const output = await sharp(input)
    .rotate() // respect EXIF orientation
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true })
    .flatten({ background: '#ffffff' }) // drop alpha -> white (for JPEG)
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toBuffer();
  const newUrl = `data:image/jpeg;base64,${output.toString('base64')}`;
  // Only keep if actually smaller
  return newUrl.length < dataUrl.length ? newUrl : null;
}

function human(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function main() {
  let before = 0;
  let after = 0;
  let changed = 0;
  let scanned = 0;

  console.log(`\n${DRY_RUN ? '[DRY RUN] ' : ''}Compressing existing base64 images (maxEdge=${MAX_EDGE}, quality=${QUALITY})\n`);

  // 1) Product.image (primary)
  const products = await prisma.product.findMany({ select: { id: true, image: true } });
  for (const p of products) {
    if (!isDataImage(p.image)) continue;
    scanned++;
    const orig = bytesOf(p.image);
    const compressed = await compressDataUrl(p.image);
    before += orig;
    if (compressed) {
      after += bytesOf(compressed);
      changed++;
      console.log(`product ${p.id}: ${human(orig)} -> ${human(bytesOf(compressed))}`);
      if (!DRY_RUN) {
        await prisma.product.update({ where: { id: p.id }, data: { image: compressed } });
      }
    } else {
      after += orig;
    }
  }

  // 2) ProductImage.url (gallery)
  const gallery = await prisma.productImage.findMany({ select: { id: true, url: true } });
  for (const g of gallery) {
    if (!isDataImage(g.url)) continue;
    scanned++;
    const orig = bytesOf(g.url);
    const compressed = await compressDataUrl(g.url);
    before += orig;
    if (compressed) {
      after += bytesOf(compressed);
      changed++;
      console.log(`image ${g.id}: ${human(orig)} -> ${human(bytesOf(compressed))}`);
      if (!DRY_RUN) {
        await prisma.productImage.update({ where: { id: g.id }, data: { url: compressed } });
      }
    } else {
      after += orig;
    }
  }

  console.log(`\n──────────────────────────────`);
  console.log(`Scanned base64 images: ${scanned}`);
  console.log(`Compressed:            ${changed}`);
  console.log(`Before:                ${human(before)}`);
  console.log(`After:                 ${human(after)}`);
  console.log(`Saved:                 ${human(before - after)} (${before ? Math.round((1 - after / before) * 100) : 0}%)`);
  console.log(DRY_RUN ? `\n(dry run — nothing written)\n` : `\nDone.\n`);
}

main()
  .catch(e => { console.error(e); process.exitCode = 1; })
  .finally(async () => { await prisma.$disconnect(); });
