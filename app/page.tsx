import { prisma } from "@/lib/prisma";
import { CategoryCard } from "@/components/CategoryCard";
import Link from "next/link";

// Make this page dynamic so newly added categories show up without a full rebuild
export const revalidate = 0; // always fetch fresh (can switch to seconds later)

export default async function Home() {
  const categories = await prisma.category.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      products: {
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: { id: true, name: true, image: true }
      }
    }
  });
  
  // Get the first category for the CTA button
  const firstCategory = categories[0];
  
  return (
    <div className="min-h-screen bg-white">
      <div className="w-full px-5 md:px-8 py-12 md:py-16 space-y-16">
        <header className="flex flex-col gap-5 text-center max-w-4xl mx-auto">
          <h1 className="h1-display tracking-tight">
            <span className="text-tertiary font-normal">where</span>{' '}
            <span className="gradient-text font-bold">&ldquo;This reminded me of you&rdquo;</span>{' '}
            <span className="text-tertiary font-normal">lives</span>
          </h1>
          <p className="text-base md:text-lg text-secondary leading-relaxed max-w-[48ch] mx-auto">
            Everything you felt, frozen beautifully.
          </p>
          {firstCategory && (
            <div className="flex justify-center pt-2">
              <Link 
                href={`/categories/${encodeURIComponent(firstCategory.id)}`} 
                className="gift-btn-primary interactive-focus"
              >
                start exploring ✨
              </Link>
            </div>
          )}
        </header>

        <section id="categories" className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
            <h2 className="h2-title text-high-contrast">Categories</h2>
            <span className="text-micro">
              {categories.length} {categories.length === 1 ? "collection" : "collections"}
            </span>
          </div>
          {categories.length === 0 && (
            <p className="text-sm text-tertiary italic text-center py-12">No categories yet — add some in the admin panel.</p>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {categories.map((c) => (
              <CategoryCard
                key={c.id}
                category={{ id: c.id, name: c.name, description: c.description ?? undefined }}
                previews={c.products.map(p => ({ id: p.id, name: p.name, image: p.image }))}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
