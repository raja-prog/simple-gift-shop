import { prisma } from "@/lib/prisma";
import { CategoryCard } from "@/components/CategoryCard";
import Link from "next/link";

export const metadata = {
  title: "Collections — Divs Aesthetix",
  description: "Browse all handcrafted collections — resin frames, keepsakes and personalised gifts.",
};

// Keep in sync with storefront caching to stay within free hosting limits under traffic
export const revalidate = 120;

export default async function CollectionsPage() {
  const categories = await prisma.category.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      products: {
        orderBy: { createdAt: "desc" },
        take: 3,
        select: { id: true, name: true, image: true },
      },
    },
  });

  return (
    <div className="page-shell">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-zinc-400 hover:text-pink-500 transition-colors mb-10 group cursor-grow"
      >
        <span className="group-hover:-translate-x-1 transition-transform inline-block">←</span>
        Back home
      </Link>

      <section className="space-y-10">
        <div className="flex items-baseline justify-between pb-6 border-b border-zinc-200">
          <h1 className="editorial-display !text-[clamp(2rem,5vw,3.2rem)] leading-[1.05]">
            Collections
          </h1>
          <span className="text-micro">
            {categories.length} {categories.length === 1 ? "collection" : "collections"}
          </span>
        </div>

        <p className="text-base md:text-lg text-secondary max-w-[52ch] leading-relaxed">
          Every piece is handcrafted with intention. Explore the full range of
          resin frames, keepsakes and personalised gifts.
        </p>

        {categories.length === 0 && (
          <p className="text-sm text-tertiary italic text-center py-12">
            New collections coming soon — message us on WhatsApp for custom orders.
          </p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 md:gap-7">
          {categories.map((c: (typeof categories)[number]) => (
            <CategoryCard
              key={c.id}
              category={{ id: c.id, name: c.name, description: c.description ?? undefined }}
              previews={c.products.map((p: (typeof c.products)[number]) => ({ id: p.id, name: p.name, image: p.image }))}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
