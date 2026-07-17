import { prisma } from "@/lib/prisma";
import { productImageSrc } from "@/lib/image";
import { CategoryCard } from "@/components/CategoryCard";
import { HeroSection } from "@/components/HeroSection";
import { HowItWorks } from "@/components/HowItWorks";
import { ProductCard } from "@/components/ProductCard";
import { Marquee } from "@/components/Marquee";
import { StickyOrderBar } from "@/components/StickyOrderBar";
import { RevealGrid } from "@/components/RevealGrid";

// Make this page dynamic so newly added categories show up without a full rebuild
export const revalidate = 120; // Cache page for 2 minutes (ISR) to stay within free hosting limits under traffic

export default async function Home() {
  const [categories, featured] = await Promise.all([
    prisma.category.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        products: {
          orderBy: { createdAt: 'desc' },
          take: 3,
          select: { id: true, name: true, image: true }
        }
      }
    }),
    prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { id: true, name: true, description: true, image: true, price: true, categoryId: true },
    }),
  ]);

  // Get the first category for the CTA button
  const firstCategory = categories[0];

  return (
    <div>
      <div className="page-shell !pt-0 !pb-0">
        <HeroSection firstCategoryId={firstCategory?.id} />
      </div>

      <Marquee />

      {featured.length > 0 && (
        <div className="page-shell !pt-10 md:!pt-20">
          <section id="featured" className="space-y-6 md:space-y-8">
            <div className="flex items-baseline justify-between pb-4 md:pb-6 border-b border-zinc-200">
              <h2 className="h2-title text-high-contrast">Featured pieces</h2>
              <span className="text-micro">Tap 💬 to order</span>
            </div>
            <RevealGrid className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
              {featured.map((p) => (
                <ProductCard
                  key={p.id}
                  product={{
                    id: p.id,
                    name: p.name,
                    description: p.description || "",
                    image: productImageSrc(p.image, p.id) || "",
                    price: Number(p.price),
                    categoryId: p.categoryId,
                  }}
                />
              ))}
            </RevealGrid>
          </section>
        </div>
      )}

      <div className="page-shell !pt-10 md:!pt-20">
        <HowItWorks />
      </div>

      <div className="page-shell !pt-10 md:!pt-20">
        <section id="categories" className="space-y-6 md:space-y-10">
          <div className="flex items-baseline justify-between pb-4 md:pb-6 border-b border-zinc-200">
            <h2 className="h2-title text-high-contrast">
              Collections
            </h2>
            <span className="text-micro">
              {categories.length} {categories.length === 1 ? "collection" : "collections"}
            </span>
          </div>
          {categories.length === 0 && (
            <p className="text-sm text-tertiary italic text-center py-12">New collections coming soon — message us on WhatsApp for custom orders.</p>
          )}
          <RevealGrid className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 md:gap-7">
            {categories.map((c) => (
              <CategoryCard
                key={c.id}
                category={{ id: c.id, name: c.name, description: c.description ?? undefined }}
                previews={c.products.map(p => ({ id: p.id, name: p.name, image: productImageSrc(p.image, p.id) || "" }))}
              />
            ))}
          </RevealGrid>
        </section>
      </div>

      <StickyOrderBar />
    </div>
  );
}
