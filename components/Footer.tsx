import Link from "next/link";

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "9600717850";
const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME || "Divs Aesthetix Gifts";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200/70 bg-white/40 backdrop-blur-sm">
      <div className="page-shell !py-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="nav-logo text-zinc-900">{STORE_NAME}</p>
            <p className="text-xs text-zinc-400 mt-1.5">Handcrafted gifts, frozen in memory.</p>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <a
              href={`https://wa.me/${WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[#25D366] font-medium hover:underline"
            >
              <span>💬</span> Chat on WhatsApp
            </a>
            <Link href="/collections" prefetch className="text-zinc-400 hover:text-pink-500 transition-colors link-sweep">
              Browse Collections
            </Link>
            <div className="flex items-center gap-4 mt-1">
              <a
                href="https://www.instagram.com/divs.aesthetix.gifts/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Divs Aesthetix on Instagram"
                className="text-zinc-400 hover:text-pink-500 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" stroke="currentColor" strokeWidth="1.8" />
                  <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.8" />
                  <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" />
                </svg>
              </a>
              <a
                href="https://www.youtube.com/@divsaesthetixgift"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Divs Aesthetix on YouTube"
                className="text-zinc-400 hover:text-pink-500 transition-colors"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="2.5" y="5" width="19" height="14" rx="4" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M10.2 9.3 L15 12 L10.2 14.7 Z" fill="currentColor" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-zinc-200/70 mt-8 pt-6">
          <p className="text-xs text-zinc-400 text-center tracking-wide">
            © {new Date().getFullYear()} {STORE_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
