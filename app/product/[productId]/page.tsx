import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { cleanImageUrl } from "@/lib/image";
import { WhatsAppButtons } from "@/components/WhatsAppButtons";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { buildOrderMessage, buildWhatsAppLink } from "@/lib/whatsapp";
import { formatPrice } from "@/lib/format";
import { ProductGallery } from "../../../components/ProductGallery";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "9600717850";
export const revalidate = 0;

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
  const message = buildOrderMessage({
    name: product.name,
    price: product.price,
    productPath: `/product/${product.id}`,
  });
  const waLink = buildWhatsAppLink(WHATSAPP_NUMBER, message);

  return (
    <div className="px-4 py-6 max-w-4xl mx-auto">
      <div className="grid gap-6 md:grid-cols-2">
        <ProductGallery
          primary={product.image}
          images={gallery}
          alt={product.name}
        />
        <div className="flex flex-col gap-4">
          <div>
            <Link
              href={`/categories/${encodeURIComponent(product.categoryId)}`}
              className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-zinc-400 hover:text-pink-500 transition-colors mb-3"
            >
              <span>←</span> Back to collection
            </Link>
            <h1 className="h2-title leading-tight text-zinc-900">{product.name}</h1>
            {product.description ? (
              <div className="mt-3 text-sm text-muted space-y-1.5">
                {product.description.split('\n').filter(line => line.trim()).length > 1 ? (
                  product.description.split('\n').filter(line => line.trim()).map((line, idx) => (
                    <div key={`desc-${product.id}-${idx}`} className="flex gap-2">
                      <span className="text-pink-500 flex-shrink-0">•</span>
                      <span className="leading-relaxed">{line.trim()}</span>
                    </div>
                  ))
                ) : (
                  <p className="leading-relaxed">{product.description}</p>
                )}
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted leading-relaxed">
                A handcrafted keepsake, made to order with love. Message us on
                WhatsApp to personalise the colours, names or dates.
              </p>
            )}
          </div>

          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-semibold text-pink-700">{formatPrice(product.price)}</p>
            <span className="text-xs text-zinc-400">· made to order</span>
          </div>

          <div className="hidden sm:flex gap-3">
            <WhatsAppButtons number={WHATSAPP_NUMBER} message={message} size="md" />
            <Link href={`/categories/${encodeURIComponent(product.categoryId)}`} className="gift-btn-outline text-sm">Back</Link>
          </div>

          {/* Trust / reassurance strip */}
          <ul className="mt-2 grid gap-2.5 border-t border-zinc-100 pt-4 text-sm text-zinc-600">
            <li className="flex items-center gap-2.5">
              <span className="text-pink-500">✦</span> Handcrafted &amp; personalised just for you
            </li>
            <li className="flex items-center gap-2.5">
              <span className="text-pink-500">✦</span> Share names, dates &amp; colours over chat
            </li>
            <li className="flex items-center gap-2.5">
              <span className="text-pink-500">✦</span> Trusted by 3,500+ happy gifters
            </li>
          </ul>
        </div>
      </div>

      {/* Sticky mobile order bar */}
      {waLink && (
        <div className="sm:hidden fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 backdrop-blur-xl px-4 py-3 flex items-center justify-between gap-3">
          <span className="text-lg font-semibold text-zinc-900">{formatPrice(product.price)}</span>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-full font-semibold text-white bg-[#25D366] hover:bg-[#20BA5A] transition-colors text-sm py-3"
          >
            <WhatsAppIcon size={17} /> Order on WhatsApp
          </a>
        </div>
      )}
    </div>
  );
}
