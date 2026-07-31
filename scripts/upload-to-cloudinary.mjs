// Upload staged images (.image-staging/) to Cloudinary using an UNSIGNED upload
// preset, so no API secret is needed. Writes .image-staging/cloudinary-map.json
// mapping each product/gallery id to its Cloudinary secure URL.
//
// Usage:
//   CLOUDINARY_CLOUD_NAME=xxx CLOUDINARY_UPLOAD_PRESET=yyy node scripts/upload-to-cloudinary.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const stageDir = path.join(__dirname, '..', '.image-staging');

const cloud = process.env.CLOUDINARY_CLOUD_NAME;
const preset = process.env.CLOUDINARY_UPLOAD_PRESET;
if (!cloud || !preset) {
  console.error('Set CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET env vars.');
  process.exit(1);
}

const endpoint = `https://api.cloudinary.com/v1_1/${cloud}/image/upload`;
const manifest = JSON.parse(fs.readFileSync(path.join(stageDir, 'manifest.json'), 'utf8'));
const mapFile = path.join(stageDir, 'cloudinary-map.json');
const map = fs.existsSync(mapFile) ? JSON.parse(fs.readFileSync(mapFile, 'utf8')) : { products: {}, gallery: {} };

async function uploadFile(file, folder) {
  const buf = fs.readFileSync(path.join(stageDir, file));
  const form = new FormData();
  form.append('file', new Blob([buf]), file);
  form.append('upload_preset', preset);
  form.append('folder', folder); // folders are allowed on unsigned presets; public_id is not always
  const res = await fetch(endpoint, { method: 'POST', body: form });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message || `HTTP ${res.status}`);
  return json.secure_url;
}

async function run(items, kind) {
  let ok = 0, skip = 0, fail = 0;
  for (const it of items) {
    if (it.source !== 'base64') { skip++; continue; }
    if (map[kind][it.id]) { skip++; continue; } // already uploaded
    const folder = `divs/${kind === 'products' ? 'product' : 'gallery'}`;
    try {
      const url = await uploadFile(it.file, folder);
      map[kind][it.id] = url;
      ok++;
      process.stdout.write(`.`);
      fs.writeFileSync(mapFile, JSON.stringify(map, null, 2)); // persist after each
    } catch (e) {
      fail++;
      console.error(`\nFAIL ${it.id}: ${e.message}`);
    }
  }
  console.log(`\n${kind}: uploaded ${ok}, skipped ${skip}, failed ${fail}`);
}

await run(manifest.products, 'products');
await run(manifest.gallery, 'gallery');
console.log('Wrote', mapFile);
