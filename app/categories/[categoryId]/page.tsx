import { notFound } from "next/navigation";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { prisma } from "@/lib/prisma";

export const revalidate = 60; // Cache for 60 seconds

interface PageProps { params: Promise<{ categoryId: string }> | { categoryId: string } }

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

  return (
    <div className="page-shell">
      <Link href="/" className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-zinc-400 hover:text-pink-500 transition-colors mb-10 group cursor-grow">
        <span className="group-hover:-translate-x-1 transition-transform inline-block">←</span>
        All Collections
      </Link>
      <div className="flex items-baseline gap-4 mb-4">
        <span className="section-number">·</span>
        <h1 className="editorial-display !text-[clamp(2.5rem,7vw,5rem)]">{category.name}</h1>
      </div>
      <div className="flex items-center justify-between border-b border-zinc-200 pb-5 mb-10">
        <span className="text-[11px] uppercase tracking-[0.2em] text-zinc-400">
          {products.length} {products.length === 1 ? 'item' : 'items'}
        </span>
      </div>
      {category.description && (
        <p className="text-base md:text-lg text-secondary leading-relaxed mb-12 max-w-2xl">{category.description}</p>
      )}
      {products.length === 0 && (
        <p className="text-sm text-muted">No products in this category yet.</p>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-8">
        {(() => {
          const ids = products.map(p => p.id);
          return (
            // Fetch first gallery images for these products
            // Note: in App Router, we can await inside JSX in server components
            (async () => {
              const images = ids.length > 0
                ? await prisma.productImage.findMany({
                    where: { productId: { in: ids } },
                    orderBy: { order: 'asc' },
                    select: { productId: true, url: true, order: true }
                  })
                : [];
              const firstMap = new Map<string, string>();
              for (const img of images) {
                if (!firstMap.has(img.productId)) firstMap.set(img.productId, img.url);
              }
              return products.map(p => (
                <ProductCard
                  key={p.id}
                  product={{
                    id: p.id,
                    name: p.name,
                    description: p.description || "",
                    image: firstMap.get(p.id) || p.image,
                    price: Number(p.price),
                    categoryId: p.categoryId
                  }}
                />
              ));
            })()
          );
        })()}
      </div>
    </div>
  );
}
