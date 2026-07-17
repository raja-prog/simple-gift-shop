"use client";
import { useEffect, useMemo, useState } from "react";
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
const MAX_QTY = 999;

// Controlled Order Helper bottom sheet. Captures occasion, recipient, date, pincode,
// personalization and quantity, then opens WhatsApp with a rich pre-filled message.
// Reusable anywhere (PDP, product cards) via a parent-managed `open` state.
export function OrderSheet({
  open,
  onClose,
  number,
  name,
  productId,
  price,
  productPath,
}: Props & { open: boolean; onClose: () => void }) {
  const { t } = useLang();
  const [details, setDetails] = useState<OrderHelperDetails>({ quantity: 1 });

  const waLink = useMemo(() => {
    const message = buildDetailedOrderMessage({ name, productId, price, productPath, details });
    return buildWhatsAppLink(number, message);
  }, [number, name, productId, price, productPath, details]);

  const set = (patch: Partial<OrderHelperDetails>) => setDetails((d) => ({ ...d, ...patch }));

  const qty = details.quantity || 1;
  const setQty = (n: number) => set({ quantity: Math.min(MAX_QTY, Math.max(1, Math.round(n) || 1)) });

  // Lock background scroll while the sheet is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Order details"
        className="relative flex flex-col w-full sm:max-w-md max-h-[92dvh] sm:max-h-[88vh] rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl overflow-hidden"
      >
        {/* Header (fixed) */}
        <div className="flex-shrink-0 px-5 pt-3 pb-3 border-b border-zinc-100">
          <div className="sm:hidden mx-auto mb-3 h-1.5 w-10 rounded-full bg-zinc-200" aria-hidden="true" />
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-400">{t("order.tagline")}</p>
              <h2 className="text-base font-semibold text-zinc-900 leading-tight truncate">{name}</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t("order.close")}
              className="flex-shrink-0 -mt-1 -mr-1 h-9 w-9 inline-flex items-center justify-center rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 text-2xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Body (scrollable) */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 space-y-4">
          <div>
            <p className="text-xs font-medium text-zinc-600 mb-2">{t("order.occasion")}</p>
            <div className="flex flex-wrap gap-2">
              {OCCASIONS.map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => set({ occasion: details.occasion === o ? undefined : o })}
                  className={`px-3 py-2 rounded-full text-xs border transition-colors ${
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
                  className={`px-3 py-2 rounded-full text-xs border transition-colors ${
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
                className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm focus:border-pink-400 focus:outline-none"
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
                className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm focus:border-pink-400 focus:outline-none"
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
              className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm focus:border-pink-400 focus:outline-none resize-none"
            />
          </label>

          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-zinc-600">{t("order.quantity")}</span>
            <div className="inline-flex items-center rounded-full border border-zinc-200 overflow-hidden">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQty(qty - 1)}
                className="h-10 w-10 text-xl text-zinc-600 hover:text-pink-600 hover:bg-zinc-50"
              >
                −
              </button>
              <input
                type="text"
                inputMode="numeric"
                aria-label={t("order.quantity")}
                value={qty}
                onChange={(e) => {
                  const digits = e.target.value.replace(/[^0-9]/g, "");
                  set({ quantity: digits === "" ? 1 : Math.min(MAX_QTY, parseInt(digits, 10)) });
                }}
                onBlur={(e) => {
                  const n = parseInt(e.target.value.replace(/[^0-9]/g, ""), 10);
                  setQty(Number.isNaN(n) ? 1 : n);
                }}
                className="w-12 h-10 text-center text-sm font-medium border-x border-zinc-200 focus:outline-none focus:bg-pink-50"
              />
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQty(qty + 1)}
                className="h-10 w-10 text-xl text-zinc-600 hover:text-pink-600 hover:bg-zinc-50"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Footer (pinned) */}
        <div className="flex-shrink-0 border-t border-zinc-100 px-5 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] bg-white">
          {waLink ? (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full font-semibold text-white bg-[#25D366] hover:bg-[#20BA5A] transition-colors text-sm py-3.5"
            >
              <WhatsAppIcon size={18} /> {t("common.continueOnWhatsapp")}
            </a>
          ) : (
            <p className="text-xs text-center text-zinc-400 italic py-2">
              Set a valid WhatsApp number to enable ordering.
            </p>
          )}
          <p className="mt-2 text-[11px] text-center text-zinc-400">
            {t("order.priceNote")}
          </p>
        </div>
      </div>
    </div>
  );
}

// On-page Order Helper for the product detail page: renders a desktop button and a
// mobile sticky bar that open the shared OrderSheet.
export function OrderHelper({ number, name, productId, price, productPath }: Props) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);

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
      <div className="sm:hidden fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 backdrop-blur-xl px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] flex items-center justify-between gap-3">
        <span className="text-lg font-semibold text-zinc-900">{formatPrice(price)}</span>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-full font-semibold text-white bg-[#25D366] hover:bg-[#20BA5A] transition-colors text-sm py-3"
        >
          <WhatsAppIcon size={17} /> {t("common.orderOnWhatsapp")}
        </button>
      </div>

      <OrderSheet
        open={open}
        onClose={() => setOpen(false)}
        number={number}
        name={name}
        productId={productId}
        price={price}
        productPath={productPath}
      />
    </>
  );
}
