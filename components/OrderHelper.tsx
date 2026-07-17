"use client";
import { useMemo, useState } from "react";
import { buildWhatsAppLink, buildDetailedOrderMessage, type OrderHelperDetails } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { formatPrice } from "@/lib/format";
import { useLang } from "@/components/LanguageProvider";

interface Props {
  number: string | undefined;
  name: string;
  productId: string;
  price: number;
  productPath: string;
}

const OCCASIONS = ["Birthday", "Anniversary", "Wedding", "Valentine", "Farewell", "Newborn", "Other"];
const RECIPIENTS = ["Her", "Him", "Couple", "Kids", "Parents", "Friends"];

// On-page Order Helper: captures occasion, recipient, date, pincode, personalization
// and quantity, then opens WhatsApp with a rich pre-filled message. Renders its own
// desktop button and mobile sticky bar so the PDP stays a clean server component.
export function OrderHelper({ number, name, productId, price, productPath }: Props) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState<OrderHelperDetails>({ quantity: 1 });

  const waLink = useMemo(() => {
    const message = buildDetailedOrderMessage({ name, productId, price, productPath, details });
    return buildWhatsAppLink(number, message);
  }, [number, name, productId, price, productPath, details]);

  const set = (patch: Partial<OrderHelperDetails>) => setDetails((d) => ({ ...d, ...patch }));

  return (
    <>
      {/* Desktop trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden sm:inline-flex items-center justify-center gap-2 rounded-full font-semibold text-white bg-[#25D366] hover:bg-[#20BA5A] transition-colors text-sm px-6 py-3"
      >
        <WhatsAppIcon size={18} /> {t("common.orderOnWhatsapp")}
      </button>

      {/* Mobile sticky bar */}
      <div className="sm:hidden fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 backdrop-blur-xl px-4 py-3 flex items-center justify-between gap-3">
        <span className="text-lg font-semibold text-zinc-900">{formatPrice(price)}</span>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-full font-semibold text-white bg-[#25D366] hover:bg-[#20BA5A] transition-colors text-sm py-3"
        >
          <WhatsAppIcon size={17} /> {t("common.orderOnWhatsapp")}
        </button>
      </div>

      {/* Bottom sheet */}
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Order details"
            className="relative w-full sm:max-w-md max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white p-5 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-400">{t("order.tagline")}</p>
                <h2 className="text-lg font-semibold text-zinc-900 leading-tight">{name}</h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t("order.close")}
                className="text-zinc-400 hover:text-zinc-700 text-2xl leading-none -mt-1"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-zinc-600 mb-2">{t("order.occasion")}</p>
                <div className="flex flex-wrap gap-2">
                  {OCCASIONS.map((o) => (
                    <button
                      key={o}
                      type="button"
                      onClick={() => set({ occasion: details.occasion === o ? undefined : o })}
                      className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                        details.occasion === o
                          ? "bg-pink-500 border-pink-500 text-white"
                          : "border-zinc-200 text-zinc-700 hover:border-pink-300"
                      }`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-zinc-600 mb-2">{t("order.for")}</p>
                <div className="flex flex-wrap gap-2">
                  {RECIPIENTS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => set({ recipient: details.recipient === r ? undefined : r })}
                      className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                        details.recipient === r
                          ? "bg-pink-500 border-pink-500 text-white"
                          : "border-zinc-200 text-zinc-700 hover:border-pink-300"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs font-medium text-zinc-600">{t("order.neededBy")}</span>
                  <input
                    type="date"
                    value={details.neededBy || ""}
                    onChange={(e) => set({ neededBy: e.target.value || undefined })}
                    className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-zinc-600">{t("order.pincode")}</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="600042"
                    value={details.pincode || ""}
                    onChange={(e) => set({ pincode: e.target.value.replace(/[^0-9]/g, "") || undefined })}
                    className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-xs font-medium text-zinc-600">{t("order.personalization")}</span>
                <textarea
                  rows={2}
                  placeholder={t("order.personalizationPlaceholder")}
                  value={details.personalization || ""}
                  onChange={(e) => set({ personalization: e.target.value || undefined })}
                  className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm focus:border-pink-400 focus:outline-none resize-none"
                />
              </label>

              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-600">{t("order.quantity")}</span>
                <div className="inline-flex items-center rounded-full border border-zinc-200">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() => set({ quantity: Math.max(1, (details.quantity || 1) - 1) })}
                    className="h-8 w-8 text-lg text-zinc-600 hover:text-pink-600"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm font-medium">{details.quantity || 1}</span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => set({ quantity: (details.quantity || 1) + 1 })}
                    className="h-8 w-8 text-lg text-zinc-600 hover:text-pink-600"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {waLink ? (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-full font-semibold text-white bg-[#25D366] hover:bg-[#20BA5A] transition-colors text-sm py-3.5"
              >
                <WhatsAppIcon size={18} /> {t("common.continueOnWhatsapp")}
              </a>
            ) : (
              <p className="mt-5 text-xs text-center text-zinc-400 italic">
                Set a valid WhatsApp number to enable ordering.
              </p>
            )}
            <p className="mt-2 text-[11px] text-center text-zinc-400">
              {t("order.priceNote")}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
