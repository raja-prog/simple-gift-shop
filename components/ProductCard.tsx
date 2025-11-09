"use client";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/data/store";
import { cleanImageUrl, isDisplayableRemote } from "@/lib/image";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { ProductShareButtons } from "./ProductShareButtons";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "9600717850"; // Replace

export function ProductCard({ product }: { product: Product }) {
  const cleaned = cleanImageUrl(product.image);
  // Keep WhatsApp message concise to avoid extremely long encoded URLs (was previously appending full image URL)
  const message = `Hi! I'm interested in "${product.name}" (ID: ${product.id}). Could you share more details?`;
  const waLink = buildWhatsAppLink(WHATSAPP_NUMBER, message);

  return (
    <div className="gift-card gift-hover p-3 flex flex-col gap-2">
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative w-full aspect-square overflow-hidden rounded-md bg-gift-accent-soft">
          {cleaned && isDisplayableRemote(cleaned) ? (
            <Image
              src={cleaned}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-center px-2 text-[11px] text-subtle bg-[var(--gift-bg-alt)]">
              Image unavailable
            </div>
          )}
        </div>
        <h4 className="mt-2 text-sm font-semibold tracking-tight">{product.name}</h4>
        <p className="text-xs text-muted line-clamp-2">{product.description}</p>
      </Link>
      <div className="flex items-center justify-between mt-auto">
        <span className="text-sm font-medium text-pink-700">${product.price.toFixed(2)}</span>
        {waLink ? (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="gift-btn-primary text-[10px] px-3 py-1"
          >
            WhatsApp
          </a>
        ) : (
          <span className="text-[10px] text-muted italic">Invalid number</span>
        )}
      </div>
      {/* Share with potential image attachment (mobile Web Share API) */}
      <ProductShareButtons product={product} whatsappNumber={WHATSAPP_NUMBER} message={message} />
    </div>
  );
}
