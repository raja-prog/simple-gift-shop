"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME || "Divs Aesthetix Store";
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "9600717850";
// Mobile-friendly reduction: drop trailing "Store" for small screens to avoid wrapping awkwardly
const MOBILE_STORE_NAME = STORE_NAME.replace(/\s*Store\s*$/i, "");

interface Category { id: string; name: string; }

export function NavBar() {
  const [open, setOpen] = useState(false);
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const waLink = buildWhatsAppLink(
    WHATSAPP_NUMBER,
    "Hi Divs Aesthetix! I'd like to order a gift. Could you help me? 😊"
  );

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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-30 transition-all duration-500 ${
        scrolled
          ? "bg-white/70 backdrop-blur-xl border-b border-zinc-200/70 shadow-[0_1px_20px_rgba(0,0,0,0.04)]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="w-full px-5 md:px-8 py-3 lg:py-5 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-baseline gap-1.5 group cursor-grow" aria-label={STORE_NAME}>
          <span className="nav-logo text-zinc-900 leading-none transition-opacity group-hover:opacity-70">
            <span className="md:hidden">{MOBILE_STORE_NAME}</span>
            <span className="hidden md:inline">{STORE_NAME}</span>
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-pink-500 translate-y-[-1px]" />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/collections" prefetch className="nav-link">Collections</Link>
          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-white bg-[#25D366] hover:bg-[#20BA5A] rounded-full px-4 py-2 transition-colors cursor-grow"
            >
              <WhatsAppIcon size={16} />
              <span>Order</span>
            </a>
          )}
        </div>

        <button
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen(o => !o)}
          className="md:hidden inline-flex items-center gap-2 text-sm font-medium text-zinc-900"
        >
          <span className="flex flex-col gap-[5px]">
            <span className={`h-[1.5px] w-5 bg-zinc-900 transition-transform ${open ? "translate-y-[6.5px] rotate-45" : ""}`} />
            <span className={`h-[1.5px] w-5 bg-zinc-900 transition-opacity ${open ? "opacity-0" : ""}`} />
            <span className={`h-[1.5px] w-5 bg-zinc-900 transition-transform ${open ? "-translate-y-[6.5px] -rotate-45" : ""}`} />
          </span>
        </button>
      </div>

      {/* Mobile panel */}
      {open && (
        <div className="md:hidden px-5 pb-5 bg-white/95 backdrop-blur-xl border-t border-zinc-200">
          <div className="flex flex-col gap-4 py-4">
            <Link onClick={() => setOpen(false)} href="/collections" className="text-lg font-medium text-zinc-900">Collections</Link>
            {waLink && (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center gap-2 text-base font-semibold text-white bg-[#25D366] hover:bg-[#20BA5A] rounded-full px-5 py-3 transition-colors"
              >
                <WhatsAppIcon size={18} /> Order
              </a>
            )}
            <div className="pt-3 border-t border-zinc-200">
              <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-400 mb-3">Browse</p>
              <div className="flex flex-wrap gap-2">
                {loading && <span className="text-xs text-zinc-400">Loading…</span>}
                {!loading && cats.map(c => (
                  <Link key={c.id} href={`/categories/${encodeURIComponent(c.id)}`} onClick={() => setOpen(false)} className="px-3.5 py-1.5 rounded-full border border-zinc-200 bg-white text-xs text-zinc-800 hover:border-pink-300 hover:text-pink-600 transition-colors">
                    {c.name}
                  </Link>
                ))}
                {!loading && cats.length === 0 && (
                  <span className="text-xs text-zinc-400 italic">No categories yet</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
