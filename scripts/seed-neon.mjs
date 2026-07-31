// Seed a fresh Postgres/Neon DB from backups/db-backup.json, replacing base64
// product images with their Cloudinary URLs (.image-staging/cloudinary-map.json).
// Applies the Prisma migrations first (with Prisma-compatible checksums) so a
// later `prisma migrate deploy` on Netlify is a clean no-op.
//
// Usage: NEON_URL="postgresql://..." node scripts/seed-neon.mjs
import dns from 'node:dns';
if (dns.setDefaultResultOrder) dns.setDefaultResultOrder('ipv4first'); // Prisma-free path prefers IPv4
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const { Client } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const url = process.env.NEON_URL || process.env.DATABASE_URL;
if (!url) { console.error('Set NEON_URL (or DATABASE_URL).'); process.exit(1); }

const backup = JSON.parse(fs.readFileSync(path.join(root, 'backups', 'db-backup.json'), 'utf8'));
const map = JSON.parse(fs.readFileSync(path.join(root, '.image-staging', 'cloudinary-map.json'), 'utf8'));
const migRoot = path.join(root, 'prisma', 'migrations');

const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
const sha256 = (buf) => crypto.createHash('sha256').update(buf).digest('hex');

async function applyMigrations() {
  await client.query(`CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    id varchar(36) PRIMARY KEY,
    checksum varchar(64) NOT NULL,
    finished_at timestamptz,
    migration_name varchar(255) NOT NULL,
    logs text,
    rolled_back_at timestamptz,
    started_at timestamptz NOT NULL DEFAULT now(),
    applied_steps_count integer NOT NULL DEFAULT 0
  )`);
  const names = fs.readdirSync(migRoot)
    .filter((n) => fs.existsSync(path.join(migRoot, n, 'migration.sql')))
    .sort();
  for (const name of names) {
    const exists = await client.query('SELECT 1 FROM "_prisma_migrations" WHERE migration_name=$1', [name]);
    if (exists.rows.length) { console.log('migration already recorded:', name); continue; }
    const buf = fs.readFileSync(path.join(migRoot, name, 'migration.sql'));
    console.log('applying migration:', name);
    await client.query(buf.toString('utf8'));
    await client.query(
      'INSERT INTO "_prisma_migrations" (id, checksum, migration_name, finished_at, applied_steps_count) VALUES ($1,$2,$3, now(), 1)',
      [crypto.randomUUID(), sha256(buf), name],
    );
  }
}

async function seed() {
  const { categories = [], products = [], productImages = [] } = backup.data;
  for (const c of categories) {
    await client.query(
      `INSERT INTO "Category" (id, name, description, "createdAt", "updatedAt")
       VALUES ($1,$2,$3, COALESCE($4::timestamptz, now()), COALESCE($5::timestamptz, now()))
       ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, "updatedAt"=now()`,
      [c.id, c.name, c.description ?? null, c.createdAt ?? null, c.updatedAt ?? null],
    );
  }
  let withImg = 0;
  for (const p of products) {
    const cloud = map.products[p.id];
    const img = cloud || (typeof p.image === 'string' && /^https?:\/\//i.test(p.image) ? p.image : '');
    if (img) withImg++;
    await client.query(
      `INSERT INTO "Product" (id, name, description, image, price, featured, "categoryId", "createdAt", "updatedAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7, COALESCE($8::timestamptz, now()), COALESCE($9::timestamptz, now()))
       ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, image=EXCLUDED.image,
         price=EXCLUDED.price, featured=EXCLUDED.featured, "categoryId"=EXCLUDED."categoryId", "updatedAt"=now()`,
      [p.id, p.name, p.description ?? null, img, p.price, p.featured ?? false, p.categoryId, p.createdAt ?? null, p.updatedAt ?? null],
    );
  }
  for (const g of productImages) {
    const cloud = map.gallery[g.id];
    const gurl = cloud || (typeof g.url === 'string' && /^https?:\/\//i.test(g.url) ? g.url : '');
    if (!gurl) continue;
    await client.query(
      `INSERT INTO "ProductImage" (id, url, alt, "order", "productId", "createdAt", "updatedAt")
       VALUES ($1,$2,$3,$4,$5, COALESCE($6::timestamptz, now()), now())
       ON CONFLICT (id) DO UPDATE SET url=EXCLUDED.url, alt=EXCLUDED.alt, "order"=EXCLUDED."order", "updatedAt"=now()`,
      [g.id, gurl, g.alt ?? null, g.order ?? 0, g.productId, g.createdAt ?? null],
    );
  }
  return { categories: categories.length, products: products.length, withImg, gallery: productImages.length };
}

(async () => {
  await client.connect();
  await applyMigrations();
  const summary = await seed();
  console.log('Seeded:', JSON.stringify(summary));
  await client.end();
})().catch((e) => { console.error('ERR', e.message); process.exit(1); });
