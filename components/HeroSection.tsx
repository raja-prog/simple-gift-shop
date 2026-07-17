"use client";
import Link from "next/link";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { HeroDoodles } from "@/components/HeroDoodles";
import { TrustStat } from "@/components/TrustStat";
import { useLang } from "@/components/LanguageProvider";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "9600717850";

const LINES: { t: string; accent: boolean }[][] = [
  [{ t: "Gifts that", accent: false }],
  [{ t: "say", accent: true }, { t: " what", accent: false }],
  [{ t: "words ", accent: false }, { t: "can’t", accent: true }, { t: ".", accent: false }],
];

const EYEBROW = "Handcrafted with intention";

export function HeroSection({ firstCategoryId }: { firstCategoryId?: string }) {
  const { t } = useLang();
  const waLink = buildWhatsAppLink(
    WHATSAPP_NUMBER,
    "Hi Divs Aesthetix! I'd like to order a handcrafted gift. Could you help me? 😊"
  );
  return (
    <>
      {/* ───────── MOBILE HERO (clean, centered) ───────── */}
      <header className="lg:hidden relative flex flex-col items-center justify-center text-center min-h-[calc(100svh-9rem)] pt-2 pb-6">
        {/* Hand-drawn gift-exchange scene */}
        <HeroDoodles />

        {/* Headline */}
        <h1 className="hero-title-mobile mt-2">
          {LINES.map((line, i) => (
            <span key={i} className="line-mask">
              <span style={{ animationDelay: `${260 + i * 120}ms` }}>
                {line.map((part, j) =>
                  part.accent ? (
                    <em key={j} className="gradient-text">{part.t}</em>
                  ) : (
                    <span key={j}>{part.t}</span>
                  )
                )}
              </span>
            </span>
          ))}
        </h1>

        {/* Trust row */}
        <div className="fade-rise flex items-center gap-2 mt-5 text-[12px] text-zinc-500" style={{ animationDelay: "820ms" }}>
          <span className="text-amber-400 tracking-tight">★★★★★</span>
          <span className="text-zinc-300">•</span>
          <TrustStat />
        </div>

        {/* CTAs */}
        <div className="fade-rise w-full flex flex-col items-center gap-5 mt-7" style={{ animationDelay: "920ms" }}>
          {firstCategoryId && (
            <Link
              href="/collections"
              prefetch
              className="btn-premium btn-premium--block group w-full max-w-xs"
            >
              <span className="link-sweep">{t("hero.explore")}</span>
              <span className="btn-premium-chip">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 13L13 3M13 3H5M13 3V11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </Link>
          )}
          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#25D366] hover:text-[#20BA5A] transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              {t("common.orderOnWhatsapp")}
            </a>
          )}
        </div>
      </header>

      {/* ───────── DESKTOP HERO (editorial, unchanged) ───────── */}
      <header className="hidden lg:flex relative min-h-[86vh] flex-col justify-center pt-14">
      <div>
        <div>
          {/* Eyebrow row */}
          <div className="flex items-center gap-4 mb-5 lg:mb-14">
            <span className="fade-rise flex items-center gap-2.5" style={{ animationDelay: "100ms" }}>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500" />
              </span>
              <span className="text-[11px] font-medium tracking-[0.25em] uppercase text-zinc-500">
                {EYEBROW.split("").map((c, i) => (
                  <span key={i} className="char-in" style={{ animationDelay: `${180 + i * 14}ms` }}>
                    {c === " " ? "\u00A0" : c}
                  </span>
                ))}
              </span>
            </span>
          </div>

          {/* Giant editorial statement with kinetic line-mask reveal */}
          <h1 className="editorial-display">
            {LINES.map((line, i) => (
              <span key={i} className="line-mask">
                <span style={{ animationDelay: `${300 + i * 130}ms` }}>
                  {line.map((part, j) =>
                    part.accent ? (
                      <em key={j} className="gradient-text">{part.t}</em>
                    ) : (
                      <span key={j}>{part.t}</span>
                    )
                  )}
                </span>
              </span>
            ))}
          </h1>

          <div className="mt-7 md:mt-16 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <p
              className="fade-rise text-[15px] md:text-lg text-secondary leading-relaxed max-w-[42ch]"
              style={{ animationDelay: "880ms" }}
            >
              Handcrafted resin frames, keepsakes &amp; personalised gifts — where{" "}
              <span className="text-zinc-900 font-medium">&ldquo;this reminded me of you&rdquo;</span> lives.
            </p>

            {firstCategoryId && (
              <div className="fade-rise flex flex-col sm:flex-row sm:items-center gap-4" style={{ animationDelay: "1000ms" }}>
                {waLink && (
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 text-base font-semibold text-white bg-[#25D366] hover:bg-[#20BA5A] rounded-full px-6 py-3.5 transition-colors cursor-grow"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    {t("common.orderOnWhatsapp")}
                  </a>
                )}
                <Link
                  href="/collections"
                  prefetch
                  className="btn-premium group cursor-grow"
                >
                  <span className="link-sweep">{t("hero.explore")}</span>
                  <span className="btn-premium-chip">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M3 13L13 3M13 3H5M13 3V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="fade-rise hidden md:flex items-center gap-3 mt-16" style={{ animationDelay: "1150ms" }}>
        <span className="scroll-cue" aria-hidden="true" />
        <span className="text-[11px] tracking-[0.25em] uppercase text-zinc-400">Scroll to explore</span>
      </div>
      </header>
    </>
  );
}
