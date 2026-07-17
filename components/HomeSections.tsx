"use client";
import { useLang } from "@/components/LanguageProvider";

// Small client wrappers so section text on the (server-rendered) homepage responds
// to the language toggle.

export function FeaturedHeading() {
  const { t } = useLang();
  return (
    <div className="flex items-baseline justify-between pb-4 md:pb-6 border-b border-zinc-200">
      <h2 className="h2-title text-high-contrast">{t("home.featured")}</h2>
      <span className="text-micro">{t("home.tapToOrder")}</span>
    </div>
  );
}

export function CollectionsHeading({ count }: { count: number }) {
  const { t } = useLang();
  const noun = count === 1 ? t("home.collectionOne") : t("home.collectionMany");
  return (
    <div className="flex items-baseline justify-between pb-4 md:pb-6 border-b border-zinc-200">
      <h2 className="h2-title text-high-contrast">{t("home.collections")}</h2>
      <span className="text-micro">
        {count} {noun}
      </span>
    </div>
  );
}

export function NoCollectionsNote() {
  const { t } = useLang();
  return (
    <p className="text-sm text-tertiary italic text-center py-12">{t("home.noCollections")}</p>
  );
}
