"use client";
import { useState, useCallback } from "react";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { isDisplayableRemote, cleanImageUrl } from "@/lib/image";
import type { Product } from "@/data/store";

interface Props {
  product: Product;
  whatsappNumber: string | undefined;
  message: string; // already concise message
}

// Progressive enhancement: tries to fetch image and use Web Share API with a File.
// Falls back to normal WhatsApp link anchor.
export function ProductShareButtons({ product, whatsappNumber, message }: Props) {
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cleaned = cleanImageUrl(product.image);
  const canDisplay = cleaned && isDisplayableRemote(cleaned);
  const waLink = buildWhatsAppLink(whatsappNumber, message);
  const canUseShare = typeof navigator !== 'undefined' && 'share' in navigator;

  const handleShare = useCallback(async () => {
    if (!canUseShare) return;
    setError(null);
    setSharing(true);
    try {
      // Attempt to fetch image if displayable
      let files: File[] | undefined;
      if (canDisplay && cleaned) {
        try {
          const resp = await fetch(cleaned, { mode: 'cors' });
          if (resp.ok) {
            const blob = await resp.blob();
            // Guard extremely large blobs (> 8MB) to avoid share failures
            if (blob.size < 8 * 1024 * 1024) {
              const fileName = `product-${product.id}.` + (blob.type.split('/')[1] || 'jpg');
              const file = new File([blob], fileName, { type: blob.type });
              // Some browsers require navigator.canShare with files
              // The native canShare signature uses ShareData; we provide a minimal compatible shape.
              type MinimalShareData = { files?: File[] };
              const nav = navigator as Navigator & { canShare?: (data?: MinimalShareData) => boolean };
              if (!nav.canShare || nav.canShare({ files: [file] })) {
                files = [file];
              }
            }
          }
        } catch {
          // Ignore image fetch errors; proceed with text-only share.
        }
      }

      const shareData: { text: string; files?: File[] } = { text: message };
      if (files) shareData.files = files;
      await navigator.share(shareData);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to share.';
      setError(msg);
    } finally {
      setSharing(false);
    }
  }, [canUseShare, canDisplay, cleaned, message, product.id]);

  return (
    <div className="flex items-center gap-2 flex-wrap mt-2">
      {waLink && (
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="gift-btn-primary text-[10px] px-3 py-1"
        >
          WhatsApp Chat
        </a>
      )}
      {canUseShare && (
        <button
          type="button"
          disabled={sharing}
          onClick={handleShare}
          className="gift-btn-secondary text-[10px] px-3 py-1 disabled:opacity-50"
        >
          {sharing ? 'Sharing…' : 'Share (attach image)'}
        </button>
      )}
      {!canUseShare && (
        <span className="text-[10px] text-muted">Native share not supported</span>
      )}
      {error && <span className="text-[10px] text-red-600">{error}</span>}
    </div>
  );
}
