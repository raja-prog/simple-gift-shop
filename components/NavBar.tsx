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
    <nav className="sticky top-0 z-30 backdrop-blur-md bg-[var(--gift-bg)]/90 border-b border-[var(--gift-border)]">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group" aria-label={STORE_NAME}>
            <span className="h2-title gradient-text leading-none group-hover:opacity-90 transition-opacity">
              <span className="md:hidden">{MOBILE_STORE_NAME}</span>
              <span className="hidden md:inline">{STORE_NAME}</span>
            </span>
            <span className="hidden md:inline ml-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[var(--gift-bg-alt)] border border-[var(--gift-border)] text-high-contrast">Since 2020</span>
          </Link>
        </div>
        <div className="hidden md:flex items-center gap-4 text-sm">
          <Link href="/#categories" className="gift-btn-outline text-xs">Browse</Link>
          <Link href="/admin" className="gift-btn-primary text-xs">Admin</Link>
        </div>
        <button aria-label="Toggle navigation" aria-expanded={open} onClick={() => setOpen(o => !o)} className="md:hidden gift-btn-outline text-[11px]">
          {open ? 'Close' : 'Menu'}
        </button>
      </div>
      {/* Mobile panel */}
      {open && (
        <div className="md:hidden px-4 pb-4 animate-fade-in">
          <div className="flex flex-col gap-3">
            <Link onClick={() => setOpen(false)} href="/#categories" className="gift-btn-outline text-xs">Browse</Link>
            <Link onClick={() => setOpen(false)} href="/admin" className="gift-btn-primary text-xs">Admin</Link>
            <div className="pt-2">
              <p className="text-[11px] text-subtle mb-2">Collections</p>
              <div className="flex flex-wrap gap-2">
                {loading && <span className="text-[10px] text-muted">Loading…</span>}
                {!loading && cats.map(c => (
                  <Link key={c.id} href={`/categories/${encodeURIComponent(c.id)}`} onClick={() => setOpen(false)} className="px-3 py-1 rounded-full border border-[var(--gift-border)] bg-[var(--gift-bg-alt)] text-[11px] text-high-contrast hover:bg-pink-100">
                    {c.name}
                  </Link>
                ))}
                {!loading && cats.length === 0 && (
                  <span className="text-[10px] text-muted italic">No categories yet</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
