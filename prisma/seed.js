/* Seed initial categories and products */
import { prisma } from '../lib/prisma';

async function run() {
  const categories = [
    { id: 'cards', name: 'Cards', description: 'Greeting and occasion cards' },
    { id: 'candles', name: 'Candles', description: 'Hand-poured artisan candles' },
    { id: 'gifts', name: 'Gift Sets', description: 'Curated bundles and sets' }
  ];

  for (const c of categories) {
    await prisma.category.upsert({
      where: { id: c.id },
      update: {},
      create: c
    });
  }

  const products = [
    {
      id: 'card-rose',
      name: 'Rose Thank You Card',
      description: 'Elegant thank you card with rose motif.',
      image: 'https://placehold.co/600x600?text=Rose+Card',
      price: 4.50,
      categoryId: 'cards'
    },
    {
      id: 'candle-vanilla',
      name: 'Vanilla Soy Candle',
      description: 'Clean-burning soy candle with vanilla fragrance.',
      image: 'https://placehold.co/600x600?text=Vanilla+Candle',
      price: 12.00,
      categoryId: 'candles'
    },
    {
      id: 'gift-relax',
      name: 'Relax Gift Set',
      description: 'Mini candle + calming tea packets.',
      image: 'https://placehold.co/600x600?text=Relax+Set',
      price: 22.00,
      categoryId: 'gifts'
    }
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: {},
      create: p
    });
  }
}

run()
  .catch(err => { console.error('Seed error:', err); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
