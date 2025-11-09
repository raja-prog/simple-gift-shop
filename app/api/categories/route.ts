import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(categories);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    if (!data.id || !data.name) {
      return NextResponse.json({ error: 'id and name required' }, { status: 400 });
    }
    const existing = await prisma.category.findUnique({ where: { id: data.id } });
    if (existing) {
      return NextResponse.json({ error: 'Category id already exists' }, { status: 409 });
    }
    const created = await prisma.category.create({ data: { id: data.id, name: data.name, description: data.description || null } });
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
