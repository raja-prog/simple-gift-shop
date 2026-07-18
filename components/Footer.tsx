import Link from "next/link";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

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
              <WhatsAppIcon size={16} /> Chat on WhatsApp
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
                className="opacity-90 hover:opacity-100 hover:scale-110 transition-all"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                  <defs>
                    <linearGradient id="ig-grad" x1="0" y1="1" x2="1" y2="0">
                      <stop offset="0" stopColor="#feda75" />
                      <stop offset="0.35" stopColor="#fa7e1e" />
                      <stop offset="0.6" stopColor="#d62976" />
                      <stop offset="0.8" stopColor="#962fbf" />
                      <stop offset="1" stopColor="#4f5bd5" />
                    </linearGradient>
                  </defs>
                  <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#ig-grad)" />
                  <circle cx="12" cy="12" r="4" fill="none" stroke="#fff" strokeWidth="1.8" />
                  <circle cx="17.2" cy="6.8" r="1.15" fill="#fff" />
                </svg>
              </a>
              <a
                href="https://www.youtube.com/@divsaesthetixgift"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Divs Aesthetix on YouTube"
                className="opacity-90 hover:opacity-100 hover:scale-110 transition-all"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="2" y="5" width="20" height="14" rx="4.5" fill="#FF0000" />
                  <path d="M10 8.5 L16 12 L10 15.5 Z" fill="#fff" />
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
