import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidateStorefront } from '@/lib/revalidate';
import { guardMutation, tooLarge } from '@/lib/api-guard';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(categories);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const denied = await guardMutation(req);
  if (denied) return denied;
  try {
    const raw = await req.text();
    if (tooLarge(raw)) {
      return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
    }
    const data = JSON.parse(raw);
    if (!data.id || !data.name) {
      return NextResponse.json({ error: 'id and name required' }, { status: 400 });
    }
    if (String(data.id).length > 80 || String(data.name).length > 200) {
      return NextResponse.json({ error: 'id or name too long' }, { status: 400 });
    }
    const existing = await prisma.category.findUnique({ where: { id: data.id } });
    if (existing) {
      return NextResponse.json({ error: 'Category id already exists' }, { status: 409 });
    }
    const created = await prisma.category.create({ data: { id: data.id, name: data.name, description: data.description || null } });
    revalidateStorefront();
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
