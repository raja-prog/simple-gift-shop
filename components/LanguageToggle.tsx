"use client";
import { useLang } from "@/components/LanguageProvider";
import { LANGUAGES } from "@/lib/i18n";

// Compact EN | த language switch. Persists via the LanguageProvider.
export function LanguageToggle({ className = "" }: { className?: string }) {
  const { lang, setLang } = useLang();
  return (
    <div
      className={`inline-flex items-center rounded-full border border-zinc-200 bg-white/70 p-0.5 text-xs ${className}`}
      role="group"
      aria-label="Language"
    >
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => setLang(l.code)}
          aria-pressed={lang === l.code}
          className={`px-2.5 py-1 rounded-full transition-colors ${
            lang === l.code
              ? "bg-pink-500 text-white"
              : "text-zinc-600 hover:text-pink-600"
          }`}
        >
          {l.short}
        </button>
      ))}
    </div>
  );
}
