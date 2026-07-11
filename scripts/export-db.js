// Full database export -> backups/db-backup.json
// Usage: node scripts/export-db.js
// Reads DATABASE_URL from environment (loaded from .env.local by the runner).
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const outDir = path.join(__dirname, '..', 'backups');
  fs.mkdirSync(outDir, { recursive: true });

  const [categories, products, productImages] = await Promise.all([
    prisma.category.findMany(),
    prisma.product.findMany(),
    prisma.productImage.findMany(),
  ]);

  // Convert Decimal/Date to JSON-safe values.
  const backup = {
    exportedAt: new Date().toISOString(),
    counts: {
      categories: categories.length,
      products: products.length,
      productImages: productImages.length,
    },
    data: { categories, products, productImages },
  };

  const outFile = path.join(outDir, 'db-backup.json');
  fs.writeFileSync(
    outFile,
    JSON.stringify(backup, (_key, value) =>
      typeof value === 'bigint' ? value.toString() : value, 2)
  );

  console.log('Exported:', JSON.stringify(backup.counts));
  console.log('Written to:', outFile);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
