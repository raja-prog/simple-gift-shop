import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidateStorefront } from '@/lib/revalidate';

export async function GET() {
  try {
    const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(products);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

type ImageInput = { url: string; alt?: string | null; order?: number } | string;

export async function POST(req: Request) {
  try {
    const data = await req.json();
    if (!data.id || !data.name || !data.categoryId || data.price === undefined) {
      return NextResponse.json({ error: 'id, name, categoryId, price required' }, { status: 400 });
    }
    const existing = await prisma.product.findUnique({ where: { id: data.id } });
    if (existing) {
      return NextResponse.json({ error: 'Product id already exists' }, { status: 409 });
    }
    const priceValue = typeof data.price === 'string' ? parseFloat(data.price) : data.price;
    const created = await prisma.product.create({ data: { id: data.id, name: data.name, description: data.description || null, image: data.image || 'https://placehold.co/600x600', price: priceValue, categoryId: data.categoryId } });
    // Optional extra images array: [{ url, alt?, order? }] or [string]
    if (Array.isArray(data.images)) {
      const imagesPayload = (data.images as Array<ImageInput>)
        .map((it, idx: number) => typeof it === 'string'
          ? { url: it, alt: null as string | null, order: idx }
          : { url: it.url, alt: it.alt ?? null, order: typeof it.order === 'number' ? it.order : idx }
        )
        .filter((img) => typeof img.url === 'string' && img.url.trim().length > 0);
      if (imagesPayload.length > 0) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (prisma as unknown as any).productImage.createMany({
            data: imagesPayload.map(img => ({ ...img, productId: created.id }))
          });
        } catch {
          // Swallow image persistence errors to not block product creation
        }
      }
    }
    revalidateStorefront();
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
