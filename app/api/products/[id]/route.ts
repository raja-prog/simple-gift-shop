import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// In Next.js 16 dynamic route handlers params can arrive as a Promise.
type ParamShape = { id: string } | Promise<{ id: string }>;

async function unwrapId(params: ParamShape): Promise<string> {
  const isPromise = typeof (params as unknown as { then?: unknown })?.then === 'function';
  const resolved: { id: string } = isPromise ? await (params as Promise<{ id: string }>) : (params as { id: string });
  return decodeURIComponent(resolved.id);
}

export async function PUT(req: Request, ctx: { params: ParamShape }) {
  try {
    const id = await unwrapId(ctx.params);
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    const body = await req.json();
    const priceValue = body.price !== undefined && typeof body.price === 'string' ? parseFloat(body.price) : body.price;
    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description ?? null,
        image: body.image,
        price: priceValue,
        categoryId: body.categoryId
      }
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: { params: ParamShape }) {
  try {
    const id = await unwrapId(ctx.params);
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
