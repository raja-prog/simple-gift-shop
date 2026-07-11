import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidateStorefront } from '@/lib/revalidate';
import { guardMutation, tooLarge } from '@/lib/api-guard';

// Mirror product route pattern: accept params which may arrive as a Promise.
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
    const updated = await prisma.category.update({
      where: { id },
      data: { name: body.name, description: body.description ?? null }
    });
    revalidateStorefront();
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: { params: ParamShape }) {
  const denied = await guardMutation(_req);
  if (denied) return denied;
  try {
    const id = await unwrapId(ctx.params);
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    await prisma.category.delete({ where: { id } });
    revalidateStorefront();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
