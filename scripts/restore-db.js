// Restore database from backups/db-backup.json into the DATABASE_URL target.
// Usage: DATABASE_URL="postgres://..." node scripts/restore-db.js
// Safe to run against a fresh (migrated) database. Uses upserts so it is idempotent.
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const file = path.join(__dirname, '..', 'backups', 'db-backup.json');
  const backup = JSON.parse(fs.readFileSync(file, 'utf8'));
  const { categories, products, productImages } = backup.data;

  console.log('Restoring:', JSON.stringify(backup.counts));

  // Order matters: categories -> products -> productImages (FK dependencies).
  for (const c of categories) {
    await prisma.category.upsert({
      where: { id: c.id },
      update: { name: c.name, description: c.description },
      create: { id: c.id, name: c.name, description: c.description, createdAt: c.createdAt, updatedAt: c.updatedAt },
    });
  }

  for (const p of products) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: { name: p.name, description: p.description, image: p.image, price: p.price, categoryId: p.categoryId },
      create: { id: p.id, name: p.name, description: p.description, image: p.image, price: p.price, categoryId: p.categoryId, createdAt: p.createdAt, updatedAt: p.updatedAt },
    });
  }

  for (const img of productImages) {
    await prisma.productImage.upsert({
      where: { id: img.id },
      update: { url: img.url, alt: img.alt, order: img.order, productId: img.productId },
      create: { id: img.id, url: img.url, alt: img.alt, order: img.order, productId: img.productId, createdAt: img.createdAt, updatedAt: img.updatedAt },
    });
  }

  console.log('Restore complete.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
