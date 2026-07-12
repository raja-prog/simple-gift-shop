import { notFound } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { prisma } from "@/lib/prisma";

export const revalidate = 60; // Cache for 60 seconds

interface PageProps { params: Promise<{ categoryId: string }> | { categoryId: string } }

// Generate static params for all categories at build time
export async function generateStaticParams() {
  const categories = await prisma.category.findMany({
    select: { id: true }
  });
  return categories.map((category) => ({
    categoryId: category.id,
  }));
}

export default async function CategoryPage({ params }: PageProps) {
  const resolved = 'then' in params ? await params : params;
  const rawId = resolved?.categoryId;
  if (!rawId || typeof rawId !== 'string' || rawId.trim() === '') {
    return notFound();
  }
  // URL may be encoded (for ids with spaces). Decode before lookup.
  const id = decodeURIComponent(rawId);
  
  // Fetch category and products in parallel
  const [category, products] = await Promise.all([
    prisma.category.findUnique({ where: { id } }),
    prisma.product.findMany({ 
      where: { categoryId: id }, 
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        image: true,
        price: true,
        categoryId: true
      }
    })
  ]);
  
  if (!category) return notFound();

  // Resolve the first gallery image per product (fallback to the product's base image).
  const productIds = products.map((p) => p.id);
  const galleryImages = productIds.length > 0
    ? await prisma.productImage.findMany({
        where: { productId: { in: productIds } },
        orderBy: { order: "asc" },
        select: { productId: true, url: true, order: true },
      })
    : [];
  const firstImageByProduct = new Map<string, string>();
  for (const img of galleryImages) {
    if (!firstImageByProduct.has(img.productId)) firstImageByProduct.set(img.productId, img.url);
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="h2-title sm:text-2xl font-semibold text-high-contrast tracking-tight mb-2 drop-shadow-[0_1px_1px_rgba(0,0,0,0.08)]">{category.name}</h1>
      <div className="gift-divider mb-6" />
      {category.description && (
        <p className="text-sm text-muted mb-6">{category.description}</p>
      )}
      {products.length === 0 && (
        <p className="text-sm text-muted">No products in this category yet.</p>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-8">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            product={{
              id: p.id,
              name: p.name,
              description: p.description || "",
              image: firstImageByProduct.get(p.id) || p.image,
              price: Number(p.price),
              categoryId: p.categoryId,
            }}
          />
        ))}
      </div>
    </div>
  );
}
