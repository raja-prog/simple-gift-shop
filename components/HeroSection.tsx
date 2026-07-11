"use client";
import Link from "next/link";

const LINES: { t: string; accent: boolean }[][] = [
  [{ t: "Gifts that", accent: false }],
  [{ t: "say", accent: true }, { t: " what", accent: false }],
  [{ t: "words ", accent: false }, { t: "can’t", accent: true }, { t: ".", accent: false }],
];

const EYEBROW = "Handcrafted with intention";

export function HeroSection({ firstCategoryId }: { firstCategoryId?: string }) {
  return (
    <header className="relative min-h-[70vh] lg:min-h-[86vh] flex flex-col justify-start lg:justify-center pt-4 pb-16 lg:pt-14">
      <div>
        <div>
          {/* Eyebrow row */}
          <div className="flex items-center gap-4 mb-6 lg:mb-14">
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

          <div className="mt-12 md:mt-16 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-8">
            <p
              className="fade-rise text-base md:text-lg text-secondary leading-relaxed max-w-[44ch]"
              style={{ animationDelay: "880ms" }}
            >
              Handcrafted resin frames, keepsakes &amp; personalised gifts — where{" "}
              <span className="text-zinc-900 font-medium">&ldquo;this reminded me of you&rdquo;</span> lives.
            </p>

            {firstCategoryId && (
              <div className="fade-rise" style={{ animationDelay: "1000ms" }}>
                <Link
                  href="/collections"
                  prefetch
                  className="group inline-flex items-center gap-3 text-lg font-medium text-zinc-900 cursor-grow"
                >
                  <span className="link-sweep">Explore the collections</span>
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-zinc-900 text-white transition-transform duration-500 group-hover:rotate-45">
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
  );
}
