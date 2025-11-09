"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME || "Divs Aesthetix Store";
// Mobile-friendly reduction: drop trailing "Store" for small screens to avoid wrapping awkwardly
const MOBILE_STORE_NAME = STORE_NAME.replace(/\s*Store\s*$/i, "");

interface Category { id: string; name: string; }

export function NavBar() {
  const [open, setOpen] = useState(false);
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch('/api/categories');
        if (res.ok) setCats(await res.json());
      } finally { setLoading(false); }
    }
    load();
  }, []);

  return (
    <nav className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-zinc-200 shadow-sm">
      <div className="w-full px-5 md:px-8 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group" aria-label={STORE_NAME}>
            <span className="text-xl md:text-2xl font-bold gradient-text leading-none group-hover:opacity-90 transition-opacity">
              <span className="md:hidden">{MOBILE_STORE_NAME}</span>
              <span className="hidden md:inline">{STORE_NAME}</span>
            </span>
          </Link>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <Link href="/#categories" className="gift-btn-outline text-sm">Browse</Link>
          <Link href="/admin" className="gift-btn-primary text-sm">Admin</Link>
        </div>
        <button aria-label="Toggle navigation" aria-expanded={open} onClick={() => setOpen(o => !o)} className="md:hidden gift-btn-outline text-sm">
          {open ? 'Close' : 'Menu'}
        </button>
      </div>
      {/* Mobile panel */}
      {open && (
        <div className="md:hidden px-5 pb-4 bg-zinc-50 border-t border-zinc-200">
          <div className="flex flex-col gap-3 py-3">
            <Link onClick={() => setOpen(false)} href="/#categories" className="gift-btn-outline text-sm w-full text-center">Browse</Link>
            <Link onClick={() => setOpen(false)} href="/admin" className="gift-btn-primary text-sm w-full text-center">Admin</Link>
            <div className="pt-3 border-t border-zinc-200">
              <p className="text-xs text-tertiary mb-2 font-medium">Collections</p>
              <div className="flex flex-wrap gap-2">
                {loading && <span className="text-xs text-muted">Loading…</span>}
                {!loading && cats.map(c => (
                  <Link key={c.id} href={`/categories/${encodeURIComponent(c.id)}`} onClick={() => setOpen(false)} className="px-3 py-1.5 rounded-full border border-zinc-200 bg-white text-xs text-high-contrast hover:bg-zinc-50 transition-colors">
                    {c.name}
                  </Link>
                ))}
                {!loading && cats.length === 0 && (
                  <span className="text-xs text-muted italic">No categories yet</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
