import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidateStorefront } from '@/lib/revalidate';
import { guardMutation, tooLarge } from '@/lib/api-guard';
import { productImageSrc } from '@/lib/image';

export async function GET() {
  try {
    // Product images are now small Cloudinary URLs, so we select the image
    // column directly (legacy base64 rows still fall back to /api/images).
    const rows = await prisma.$queryRaw<Array<{ id: string; name: string; description: string | null; price: unknown; categoryId: string; featured: boolean; image: string | null; updatedAt: Date }>>`
      SELECT id, name, description, price, "categoryId", featured, "updatedAt", image
      FROM "Product"
      ORDER BY "createdAt" DESC
    `;
    const products = rows.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      price: Number(r.price),
      categoryId: r.categoryId,
      featured: r.featured,
      image: productImageSrc(r.image, r.id, r.updatedAt) || '',
    }));
    return NextResponse.json(products);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

type ImageInput = { url: string; alt?: string | null; order?: number } | string;

export async function POST(req: Request) {
  const denied = await guardMutation(req);
  if (denied) return denied;
  try {
    const raw = await req.text();
    if (tooLarge(raw)) {
      return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
    }
    const data = JSON.parse(raw);
    if (!data.id || !data.name || !data.categoryId || data.price === undefined) {
      return NextResponse.json({ error: 'id, name, categoryId, price required' }, { status: 400 });
    }
    if (String(data.id).length > 80 || String(data.name).length > 200) {
      return NextResponse.json({ error: 'id or name too long' }, { status: 400 });
    }
    const existing = await prisma.product.findUnique({ where: { id: data.id } });
    if (existing) {
      return NextResponse.json({ error: 'Product id already exists' }, { status: 409 });
    }
    const priceValue = typeof data.price === 'string' ? parseFloat(data.price) : data.price;
    const created = await prisma.product.create({ data: { id: data.id, name: data.name, description: data.description || null, image: data.image || 'https://placehold.co/600x600', price: priceValue, categoryId: data.categoryId, featured: !!data.featured } });
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
