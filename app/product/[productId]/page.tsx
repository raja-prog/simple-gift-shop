import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { cleanImageUrl, isDisplayableRemote } from "@/lib/image";
import { WhatsAppButtons } from "@/components/WhatsAppButtons";

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
  const productDb = await prisma.product.findUnique({ where: { id } });
  if (!productDb) return notFound();
  const cleanedImage = cleanImageUrl(productDb.image);
  const product = {
    id: productDb.id,
    name: productDb.name,
    description: productDb.description || "",
    image: cleanedImage,
    price: Number(productDb.price),
    categoryId: productDb.categoryId
  };
  const message = `Hi! I'm interested in this product: ${product.name} (${product.id}) - ${product.image}`;

  return (
    <div className="px-4 py-6 max-w-4xl mx-auto">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="gift-card overflow-hidden relative aspect-square md:aspect-[4/5]">
          {product.image && isDisplayableRemote(product.image) ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-center px-3 text-sm text-subtle bg-[var(--gift-bg-alt)]">
              Image unavailable
            </div>
          )}
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="h2-title leading-tight">{product.name}</h1>
            <p className="text-sm text-muted mt-2 leading-relaxed">{product.description}</p>
          </div>
          <p className="text-xl font-semibold text-pink-700">${product.price.toFixed(2)}</p>
          <div className="flex gap-3">
            <WhatsAppButtons number={WHATSAPP_NUMBER} message={message} size="md" />
            <Link href="/" className="gift-btn-outline text-sm">Back</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
