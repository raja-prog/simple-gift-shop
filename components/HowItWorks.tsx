"use client";
import { RevealGrid } from "@/components/RevealGrid";
import { useLang } from "@/components/LanguageProvider";

export function HowItWorks() {
  const { t } = useLang();
  const STEPS: { icon: string; title: string; body: string }[] = [
    { icon: "💬", title: t("how.step1Title"), body: t("how.step1Body") },
    { icon: "🎨", title: t("how.step2Title"), body: t("how.step2Body") },
    { icon: "📦", title: t("how.step3Title"), body: t("how.step3Body") },
  ];

  return (
    <section className="space-y-8">
      <div className="text-center max-w-xl mx-auto">
        <span className="text-[11px] font-medium tracking-[0.2em] uppercase text-pink-500">
          {t("how.eyebrow")}
        </span>
        <h2 className="mt-2 editorial-display !text-[clamp(1.6rem,4vw,2.4rem)] leading-[1.1]">
          {t("how.title")}
        </h2>
        <p className="mt-3 text-sm md:text-base text-secondary leading-relaxed">
          {t("how.subtitle")}
        </p>
      </div>

      <RevealGrid className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {STEPS.map((s, i) => (
          <div
            key={i}
            className="relative flex flex-col gap-2 rounded-2xl border border-zinc-100 bg-white/60 p-5"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--gift-accent-soft)] text-xl">
                {s.icon}
              </span>
              <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-pink-500">
                {t("how.step")} {i + 1}
              </span>
            </div>
            <h3 className="text-base font-semibold text-zinc-900">{s.title}</h3>
            <p className="text-sm text-secondary leading-relaxed">{s.body}</p>
          </div>
        ))}
      </RevealGrid>
    </section>
  );
}
