import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidateStorefront } from '@/lib/revalidate';
import { guardMutation, tooLarge } from '@/lib/api-guard';

// In Next.js 16 dynamic route handlers params can arrive as a Promise.
type ParamShape = { id: string } | Promise<{ id: string }>;

async function unwrapId(params: ParamShape): Promise<string> {
  const isPromise = typeof (params as unknown as { then?: unknown })?.then === 'function';
  const resolved: { id: string } = isPromise ? await (params as Promise<{ id: string }>) : (params as { id: string });
  return decodeURIComponent(resolved.id);
}

export async function PUT(req: Request, ctx: { params: ParamShape }) {
  const denied = await guardMutation(req);
  if (denied) return denied;
  try {
    const id = await unwrapId(ctx.params);
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    const raw = await req.text();
    if (tooLarge(raw)) {
      return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
    }
    const body = JSON.parse(raw);
    const priceValue = body.price !== undefined && typeof body.price === 'string' ? parseFloat(body.price) : body.price;
    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description ?? null,
        image: body.image,
        price: priceValue,
        categoryId: body.categoryId,
        featured: body.featured === undefined ? undefined : !!body.featured
      }
    });
    // Replace extra images if provided
    if (Array.isArray(body.images)) {
      try {
        // Delete existing images first, then insert new set (simple replace semantics)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (prisma as unknown as any).productImage.deleteMany({ where: { productId: id } });
        const imgs = (body.images as Array<{ url: string; alt?: string | null; order?: number } | string>)
          .map((it, idx) => typeof it === 'string'
            ? { url: it, alt: null as string | null, order: idx }
            : { url: it.url, alt: it.alt ?? null, order: typeof it.order === 'number' ? it.order : idx }
          )
          .filter(img => typeof img.url === 'string' && img.url.trim().length > 0);
        if (imgs.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (prisma as unknown as any).productImage.createMany({ data: imgs.map(img => ({ ...img, productId: id })) });
        }
      } catch {
        // Swallow image persistence errors to allow product update without gallery table present
      }
    }
    revalidateStorefront();
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: { params: ParamShape }) {
  const denied = await guardMutation(_req);
  if (denied) return denied;
  try {
    const id = await unwrapId(ctx.params);
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    await prisma.product.delete({ where: { id } });
    revalidateStorefront();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}

export async function GET(_req: Request, ctx: { params: ParamShape }) {
  try {
    const id = await unwrapId(ctx.params);
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    const [product, images] = await Promise.all([
      prisma.product.findUnique({ where: { id } }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (async () => { try { return await (prisma as unknown as any).productImage.findMany({ where: { productId: id }, orderBy: { order: 'asc' } }); } catch { return []; } })()
    ]);
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ ...product, images });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}
