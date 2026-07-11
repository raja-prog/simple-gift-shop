"use client";
import { useState, useMemo } from "react";
import Image from "next/image";
import { isDisplayableRemote } from "@/lib/image";

type Img = { url: string; alt?: string | null };

export function ProductGallery({ primary, images, alt }: { primary?: string; images: Img[]; alt: string }) {
  const list = useMemo(() => {
    const arr: Img[] = [];
    if (primary && isDisplayableRemote(primary)) arr.push({ url: primary, alt });
    for (const img of images) {
      if (img?.url && isDisplayableRemote(img.url)) arr.push({ url: img.url, alt: img.alt ?? alt });
    }
    // de-dup by URL
    const seen = new Set<string>();
    return arr.filter(it => {
      const k = it.url;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }, [primary, images, alt]);

  const [index, setIndex] = useState(0);
  const current = list[index];

  if (list.length === 0) {
    return (
      <div className="gift-card overflow-hidden relative aspect-square md:aspect-[4/5] flex items-center justify-center text-sm text-subtle bg-[var(--gift-bg-alt)]">
        Image unavailable
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="gift-card overflow-hidden relative aspect-square md:aspect-[4/5]">
        <Image
          key={current.url}
          src={current.url}
          alt={current.alt || alt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          quality={100}
          priority={true}
        />
      </div>
      {list.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {list.map((img, i) => (
            <button
              key={img.url}
              onClick={() => setIndex(i)}
              className={`relative w-16 h-16 rounded-md overflow-hidden border ${i === index ? 'border-pink-500' : 'border-[var(--gift-border)]'}`}
              aria-label={`View image ${i+1}`}
            >
              <Image src={img.url} alt={img.alt || alt} fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
