"use client";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import type { Product } from "@/data/store";
import { cleanImageUrl, isDisplayableRemote, isApiImage } from "@/lib/image";
import { formatPrice } from "@/lib/format";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { OrderSheet } from "@/components/OrderHelper";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "9600717850"; // Replace

export function ProductCard({ product }: { product: Product }) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [orderOpen, setOrderOpen] = useState(false);
  const cleaned = cleanImageUrl(product.image);
  const shortDesc = (product.description || "").split('\n').map(l => l.trim()).filter(Boolean)[0] || "";

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    el.style.setProperty("--rx", `${(0.5 - py) * 10}deg`);
    el.style.setProperty("--ry", `${(px - 0.5) * 10}deg`);
    el.style.setProperty("--gx", `${px * 100}%`);
    el.style.setProperty("--gy", `${py * 100}%`);
  }

  function handleLeave() {
    const el = cardRef.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  }

  return (
    <div className="tilt-parent cursor-grow">
      <div ref={cardRef} className="tilt-card !p-3 flex flex-col" onMouseMove={handleMove} onMouseLeave={handleLeave}>
        <span className="tilt-glare" aria-hidden="true" />
        <Link href={`/product/${product.id}`} prefetch className="block group tilt-layer" style={{ ["--z" as string]: "50px" }}>
          <div className="relative w-full aspect-[4/5] overflow-hidden rounded-xl bg-zinc-100 skeleton">
            {cleaned && isDisplayableRemote(cleaned) ? (
              <Image
                src={cleaned}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-cover opacity-0 data-[loaded=true]:opacity-100 transition-all duration-700 group-hover:scale-[1.06]"
                onLoad={(e) => e.currentTarget.setAttribute('data-loaded','true')}
                quality={72}
                loading="lazy"
                priority={false}
              />
            ) : cleaned && isApiImage(cleaned) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cleaned}
                alt={product.name}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
              />
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-br from-pink-50 to-purple-50 gap-2">
                <span className="text-3xl">🎁</span>
                <span className="text-[10px] text-tertiary">Preview coming soon</span>
              </div>
            )}
          </div>
        </Link>

        <div className="tilt-layer mt-3 flex flex-col flex-1" style={{ ["--z" as string]: "30px" }}>
          <Link href={`/product/${product.id}`} prefetch className="block">
            <h4 className="text-sm font-semibold tracking-tight text-zinc-900 line-clamp-1">{product.name}</h4>
            {shortDesc && (
              <p className="mt-1 text-xs text-tertiary line-clamp-2 leading-snug">{shortDesc}</p>
            )}
          </Link>

          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="text-base font-bold text-zinc-900">{formatPrice(Number(product.price))}</span>
            <button
              type="button"
              onClick={() => setOrderOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-full font-semibold bg-[#25D366] text-white hover:bg-[#20BA5A] transition-colors duration-200"
            >
              <WhatsAppIcon size={14} /> Order
            </button>
          </div>
        </div>
      </div>

      <OrderSheet
        open={orderOpen}
        onClose={() => setOrderOpen(false)}
        number={WHATSAPP_NUMBER}
        name={product.name}
        productId={product.id}
        price={Number(product.price)}
        productPath={`/product/${product.id}`}
      />
    </div>
  );
}
