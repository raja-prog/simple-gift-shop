import { prisma } from "@/lib/prisma";
import { listImageSrc } from "@/lib/image";
import { CategoryCard } from "@/components/CategoryCard";
import { HeroSection } from "@/components/HeroSection";
import { HowItWorks } from "@/components/HowItWorks";
import { ProductCard } from "@/components/ProductCard";
import { Marquee } from "@/components/Marquee";
import { StickyOrderBar } from "@/components/StickyOrderBar";
import { RevealGrid } from "@/components/RevealGrid";
import { FeaturedHeading, CollectionsHeading, NoCollectionsNote } from "@/components/HomeSections";

// Make this page dynamic so newly added categories show up without a full rebuild
export const revalidate = 120; // Cache page for 2 minutes (ISR) to stay within free hosting limits under traffic

type FeaturedRow = {
  id: string;
  name: string;
  description: string | null;
  price: unknown;
  categoryId: string;
  hasImage: boolean;
};

type PreviewRow = {
  categoryId: string;
  id: string;
  name: string;
  hasImage: boolean;
};

export default async function Home() {
  // Fetch only image *presence* (not the heavy base64 blob) to keep the
  // homepage payload small and fast on the Neon free tier. Actual images are
  // streamed on-demand and cached via /api/images/product/:id.
  const [categories, featured, previews] = await Promise.all([
    prisma.category.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, description: true },
    }),
    prisma.$queryRaw<FeaturedRow[]>`
      SELECT id, name, description, price, "categoryId",
             (image IS NOT NULL AND image <> '') AS "hasImage"
      FROM "Product"
      ORDER BY "createdAt" DESC
      LIMIT 6
    `,
    prisma.$queryRaw<PreviewRow[]>`
      SELECT "categoryId", id, name, "hasImage"
      FROM (
        SELECT "categoryId", id, name,
               (image IS NOT NULL AND image <> '') AS "hasImage",
               ROW_NUMBER() OVER (PARTITION BY "categoryId" ORDER BY "createdAt" DESC) AS rn
        FROM "Product"
      ) s
      WHERE rn <= 3
    `,
  ]);

  // Group category preview thumbnails by category (already ordered newest-first)
  const previewsByCategory = new Map<string, PreviewRow[]>();
  for (const row of previews) {
    const list = previewsByCategory.get(row.categoryId) ?? [];
    list.push(row);
    previewsByCategory.set(row.categoryId, list);
  }

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
            <FeaturedHeading />
            <RevealGrid className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
              {featured.map((p) => (
                <ProductCard
                  key={p.id}
                  product={{
                    id: p.id,
                    name: p.name,
                    description: p.description || "",
                    image: listImageSrc(p.hasImage, p.id) || "",
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
          <CollectionsHeading count={categories.length} />
          {categories.length === 0 && (
            <NoCollectionsNote />
          )}
          <RevealGrid className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 md:gap-7">
            {categories.map((c) => (
              <CategoryCard
                key={c.id}
                category={{ id: c.id, name: c.name, description: c.description ?? undefined }}
                previews={(previewsByCategory.get(c.id) ?? []).map(p => ({ id: p.id, name: p.name, image: listImageSrc(p.hasImage, p.id) || "" }))}
              />
            ))}
          </RevealGrid>
        </section>
      </div>

      <StickyOrderBar />
    </div>
  );
}
