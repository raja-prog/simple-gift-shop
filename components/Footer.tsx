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
            <Link href="/#categories" className="text-zinc-400 hover:text-pink-500 transition-colors link-sweep">
              Browse Collections
            </Link>
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
