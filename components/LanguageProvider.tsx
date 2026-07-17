"use client";
import { createContext, useCallback, useContext, useEffect, useSyncExternalStore } from "react";
import { translate, type Lang } from "@/lib/i18n";

const STORAGE_KEY = "divs-lang";

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

// ---- External language store (localStorage-backed) ----
// Reading the persisted choice via useSyncExternalStore keeps rendering in sync with
// an external system without calling setState inside an effect, and yields a stable
// "en" server snapshot so hydration never mismatches.
const listeners = new Set<() => void>();

function readStoredLang(): Lang | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "ta") return stored;
  } catch {
    /* ignore storage errors */
  }
  return null;
}

function browserPreferredLang(): Lang {
  try {
    const prefs = navigator.languages || [navigator.language];
    if (prefs.some((l) => l?.toLowerCase().startsWith("ta"))) return "ta";
  } catch {
    /* ignore */
  }
  return "en";
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

function getClientSnapshot(): Lang {
  return readStoredLang() ?? browserPreferredLang();
}

function getServerSnapshot(): Lang {
  return "en";
}

function writeStoredLang(l: Lang) {
  try {
    window.localStorage.setItem(STORAGE_KEY, l);
  } catch {
    /* ignore storage errors */
  }
  listeners.forEach((cb) => cb());
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const lang = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    writeStoredLang(l);
  }, []);

  const t = useCallback((key: string) => translate(lang, key), [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Safe fallback so components never crash if rendered outside the provider.
    return { lang: "en", setLang: () => {}, t: (key: string) => translate("en", key) };
  }
  return ctx;
}
