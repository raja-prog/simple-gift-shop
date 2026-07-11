import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { cleanImageUrl } from "@/lib/image";
import { WhatsAppButtons } from "@/components/WhatsAppButtons";
import { ProductGallery } from "../../../components/ProductGallery";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "9600717850";
export const revalidate = 300; // Cache product page for 5 minutes (ISR)

interface PageProps { params: Promise<{ productId: string }> | { productId: string } }

export default async function ProductPage({ params }: PageProps) {
  const resolved = 'then' in params ? await params : params;
  const rawId = resolved?.productId;
  if (!rawId || typeof rawId !== 'string' || rawId.trim() === '') {
    return notFound();
  }
  const id = decodeURIComponent(rawId);
  const [productDb, images] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.productImage.findMany({ where: { productId: id }, orderBy: { order: 'asc' } })
  ]);
  if (!productDb) return notFound();
  const baseImage = cleanImageUrl(productDb.image);
  const gallery = (images as Array<{ url: string; alt?: string | null }>)
    .map((img) => ({ url: cleanImageUrl(img.url), alt: img.alt || productDb.name }))
    .filter((i) => !!i.url)
    .map(i => ({ url: i.url as string, alt: i.alt }));
  const product = {
    id: productDb.id,
    name: productDb.name,
    description: productDb.description || "",
    image: baseImage,
    price: Number(productDb.price),
    categoryId: productDb.categoryId
  };
  const message = `Hi! I'm interested in this product: ${product.name} (${product.id}) — ₹${Number(product.price).toLocaleString('en-IN')}. Could you share more details?`;

  return (
    <div className="page-shell">
      <Link href="/" className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-zinc-400 hover:text-pink-500 transition-colors mb-10 group cursor-grow">
        <span className="group-hover:-translate-x-1 transition-transform inline-block">←</span>
        Back to shop
      </Link>
      <div className="grid gap-10 md:gap-14 md:grid-cols-2">
        <ProductGallery
          primary={product.image}
          images={gallery}
          alt={product.name}
        />
        <div className="flex flex-col gap-6 md:pt-6">
          <div>
            <h1 className="editorial-display !text-[clamp(2rem,5vw,3.4rem)] leading-[1.05]">{product.name}</h1>
            {product.description && (
              <div className="mt-6 text-base text-secondary space-y-2">
                {product.description.split('\n').filter(line => line.trim()).length > 1 ? (
                  product.description.split('\n').filter(line => line.trim()).map((line, idx) => (
                    <div key={`desc-${product.id}-${idx}`} className="flex gap-3">
                      <span className="text-pink-500 flex-shrink-0 mt-1">—</span>
                      <span className="leading-relaxed">{line.trim()}</span>
                    </div>
                  ))
                ) : (
                  <p className="leading-relaxed">{product.description}</p>
                )}
              </div>
            )}
          </div>
          <div className="flex items-baseline gap-2 pt-2 border-t border-zinc-200">
            <span className="text-3xl font-bold text-zinc-900 pt-4">₹{Number(product.price).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <WhatsAppButtons number={WHATSAPP_NUMBER} message={message} size="md" />
          </div>
        </div>
      </div>
    </div>
  );
}
