import { notFound } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { prisma } from "@/lib/prisma";

export const revalidate = 0; // always fresh

interface PageProps { params: Promise<{ categoryId: string }> | { categoryId: string } }

export default async function CategoryPage({ params }: PageProps) {
  const resolved = 'then' in params ? await params : params;
  const rawId = resolved?.categoryId;
  if (!rawId || typeof rawId !== 'string' || rawId.trim() === '') {
    return notFound();
  }
  // URL may be encoded (for ids with spaces). Decode before lookup.
  const id = decodeURIComponent(rawId);
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) return notFound();
  const products = await prisma.product.findMany({ where: { categoryId: category.id }, orderBy: { createdAt: 'desc' } });

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="h2-title sm:text-2xl font-semibold text-high-contrast tracking-tight mb-2 drop-shadow-[0_1px_1px_rgba(0,0,0,0.08)]">{category.name}</h1>
      <div className="gift-divider mb-4" />
      {category.description && (
        <p className="text-sm text-muted mb-4">{category.description}</p>
      )}
      {products.length === 0 && (
        <p className="text-sm text-muted">No products in this category yet.</p>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {products.map(p => (
          <ProductCard
            key={p.id}
            product={{
              id: p.id,
              name: p.name,
              description: p.description || "",
              image: p.image,
              price: Number(p.price),
              categoryId: p.categoryId
            }}
          />
        ))}
      </div>
    </div>
  );
}
