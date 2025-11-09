import Link from "next/link";
import { normalizeImageUrl } from "@/lib/image";

// Local Category type (remove dependency on in-memory store types)
interface CategoryType { id: string; name: string; description?: string }
interface PreviewProduct { id: string; name: string; image: string }

export function CategoryCard({ category, previews = [] }: { category: CategoryType; previews?: PreviewProduct[] }) {
  // Only show at most two images (compact visual hint). If more exist, we could add a +N badge.
  const limited = previews.slice(0, 2).map(p => ({ ...p, image: normalizeImageUrl(p.image) }));
  return (
    <Link
      aria-label={`View ${category.name} category`}
      href={`/categories/${encodeURIComponent(category.id)}`}
      className="gift-card gift-hover block p-4 rounded-[var(--gift-radius)] focus:outline-none focus:ring-2 focus:ring-pink-300"
    >
      <h3 className="text-sm sm:text-base font-semibold tracking-tight text-high-contrast mb-1">
        {category.name}
      </h3>
      {category.description && (
        <p className="text-xs sm:text-[13px] text-subtle leading-snug line-clamp-2">
          {category.description}
        </p>
      )}
      {limited.length > 0 && (
        <div className="mt-3 flex -space-x-2">
          {limited.map(p => {
            const show = p.image && (p.image.startsWith('data:') || /^https?:\/\//.test(p.image));
            return (
              <div
                key={p.id}
                className="relative w-10 h-10 rounded-md border border-[var(--gift-border)] bg-[var(--gift-bg-alt)] overflow-hidden shadow-sm"
                title={p.name}
              >
                {show ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-[9px] text-subtle">&nbsp;</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Link>
  );
}
