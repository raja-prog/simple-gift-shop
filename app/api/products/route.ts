import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(products);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

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
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
