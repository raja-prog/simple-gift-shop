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
  return (
    <div className="min-h-screen px-4 py-6 max-w-6xl mx-auto">
      <header className="flex flex-col gap-3 mb-8 text-center">
          <h1 className="h1-display">
            <span className="text-zinc-300 dark:text-zinc-400 font-medium tracking-wide">where</span>{' '}
            <span className="gradient-text font-semibold">“This reminded me of you”</span>{' '}
            <span className="text-zinc-300 dark:text-zinc-400 font-medium tracking-wide">lives</span>
          </h1>
        <p className="text-sm sm:text-base text-subtle max-w-xl mx-auto">
          Discover hand-picked gifts, artisan candles, unique cards and curated
          sets. Message us directly to order.
        </p>
        <div className="flex justify-center gap-3">
          <Link
            href="/admin"
            className="gift-btn-outline text-xs sm:text-sm"
          >
            Admin
          </Link>
          <a
            href="#categories"
            className="gift-btn-primary text-xs sm:text-sm"
          >
            Browse Categories
          </a>
        </div>
      </header>

      <section id="categories" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="h2-title text-high-contrast">Categories</h2>
          <span className="text-xs text-subtle">
            {categories.length} {categories.length === 1 ? "collection" : "collections"}
          </span>
        </div>
        <div className="gift-divider" />
        {categories.length === 0 && (
          <p className="text-xs text-subtle italic">No categories yet — add some in the admin panel.</p>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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
  );
}
