"use client";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/data/store";
import { cleanImageUrl, isDisplayableRemote } from "@/lib/image";
import { buildWhatsAppLink } from "@/lib/whatsapp";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "9600717850"; // Replace

export function ProductCard({ product }: { product: Product }) {
  const cleaned = cleanImageUrl(product.image);
  // Keep WhatsApp message concise to avoid extremely long encoded URLs (was previously appending full image URL)
  const message = `Hi! I'm interested in "${product.name}" (ID: ${product.id}). Could you share more details?`;
  const waLink = buildWhatsAppLink(WHATSAPP_NUMBER, message);

  return (
    <div className="category-card-parent">
      <div className="category-card-3d gift-card gift-card-border p-4 flex flex-col">
        <Link href={`/product/${product.id}`} className="block group">
          <div className="relative w-full aspect-[4/5] overflow-hidden rounded-lg bg-zinc-100">
          {cleaned && isDisplayableRemote(cleaned) ? (
            <Image
              src={cleaned}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, 33vw"
              className="object-cover opacity-0 data-[loaded=true]:opacity-100 transition-opacity duration-500 group-hover:scale-[1.02]"
              onLoad={(e) => e.currentTarget.setAttribute('data-loaded','true')}
              quality={95}
              priority={false}
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-center px-2 text-[11px] text-tertiary bg-[var(--gift-bg-alt)]">
              Image unavailable
            </div>
          )}
          {/* Skeleton shimmer */}
          {(!cleaned || !isDisplayableRemote(cleaned)) ? null : (
            <div className="absolute inset-0 pointer-events-none skeleton" />
          )}
        </div>
        <h4 className="mt-4 text-sm font-semibold tracking-tight text-zinc-900">{product.name}</h4>
        {product.description && (
          <div className="mt-2 text-xs text-tertiary space-y-1">
            {product.description.split('\n').filter(line => line.trim()).length > 1 ? (
              product.description.split('\n').filter(line => line.trim()).map((line, idx) => (
                <div key={`desc-${product.id}-${idx}`} className="flex gap-1.5">
                  <span className="text-pink-500 flex-shrink-0">•</span>
                  <span>{line.trim()}</span>
                </div>
              ))
            ) : (
              <p className="line-clamp-2">{product.description}</p>
            )}
          </div>
        )}
      </Link>
      <div className="gift-divider my-4" />
      <div className="flex flex-col gap-2.5 mt-3">
        <span className="text-sm font-medium text-pink-700">₹{product.price.toFixed(2)}</span>
        {waLink ? (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] px-3 py-2 rounded-lg font-medium bg-[#25D366] text-white hover:bg-[#20BA5A] transition-colors duration-200 text-center"
          >
            WhatsApp
          </a>
        ) : (
          <span className="text-[11px] text-tertiary italic">Invalid number</span>
        )}
      </div>
      </div>
    </div>
  );
}
