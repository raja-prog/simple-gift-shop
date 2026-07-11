"use client";
import Link from "next/link";
import { useRef } from "react";
import { normalizeImageUrl } from "@/lib/image";

// Local Category type (remove dependency on in-memory store types)
interface CategoryType { id: string; name: string; description?: string }
interface PreviewProduct { id: string; name: string; image: string }

export function CategoryCard({ category, previews = [] }: { category: CategoryType; previews?: PreviewProduct[] }) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const limited = previews.slice(0, 2).map(p => ({ ...p, image: normalizeImageUrl(p.image) }));

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    el.style.setProperty("--rx", `${(0.5 - py) * 14}deg`);
    el.style.setProperty("--ry", `${(px - 0.5) * 14}deg`);
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
    <Link
      aria-label={`View ${category.name} category`}
      href={`/categories/${encodeURIComponent(category.id)}`}
      className="tilt-parent block focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-300 cursor-grow"
      prefetch={true}
    >
      <div ref={cardRef} className="tilt-card" onMouseMove={handleMove} onMouseLeave={handleLeave}>
        <span className="tilt-glare" aria-hidden="true" />

        {previews.length > 0 && (
          <span className="tilt-badge badge-pop" style={{ animationDelay: "300ms" }}>
            {previews.length}
          </span>
        )}

        <div className="tilt-content">
          <h3 className="tilt-layer card-title-serif text-lg sm:text-xl text-high-contrast mb-1.5" style={{ ["--z" as string]: "45px" }}>
            {category.name}
          </h3>
          {category.description && (
            <p className="tilt-layer text-xs sm:text-[13px] text-subtle leading-snug line-clamp-2" style={{ ["--z" as string]: "28px" }}>
              {category.description}
            </p>
          )}
          {limited.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-2 tilt-layer" style={{ ["--z" as string]: "60px" }}>
              {limited.map(p => {
                const show = p.image && (p.image.startsWith('data:') || /^https?:\/\//.test(p.image));
                return (
                  <div
                    key={p.id}
                    className="relative w-full aspect-[4/5] rounded-xl border border-[var(--gift-border)] bg-[var(--gift-bg-alt)] overflow-hidden shadow-sm"
                    title={p.name}
                  >
                    {show ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover"
                        loading="eager"
                        decoding="async"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-[9px] text-tertiary">&nbsp;</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <span className="tilt-cta" style={{ ["--z" as string]: "35px" }}>
            View collection <span aria-hidden="true">→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
