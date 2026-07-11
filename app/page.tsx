import { prisma } from "@/lib/prisma";
import { CategoryCard } from "@/components/CategoryCard";
import { HeroSection } from "@/components/HeroSection";
import { Marquee } from "@/components/Marquee";

// Make this page dynamic so newly added categories show up without a full rebuild
export const revalidate = 120; // Cache page for 2 minutes (ISR) to stay within free hosting limits under traffic

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
    <div>
      <div className="page-shell !pt-0 !pb-0">
        <HeroSection firstCategoryId={firstCategory?.id} />
      </div>

      <Marquee />

      <div className="page-shell !pt-16 md:!pt-20">
        <section id="categories" className="space-y-10">
          <div className="flex items-baseline justify-between pb-6 border-b border-zinc-200">
            <h2 className="h2-title text-high-contrast">
              Collections
            </h2>
            <span className="text-micro">
              {categories.length} {categories.length === 1 ? "collection" : "collections"}
            </span>
          </div>
          {categories.length === 0 && (
            <p className="text-sm text-tertiary italic text-center py-12">No categories yet — add some in the admin panel.</p>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 md:gap-7">
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
