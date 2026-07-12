"use client";
import { useEffect, useState } from "react";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "9600717850";

// Persistent bottom "Order on WhatsApp" bar for mobile. Appears once the user
// scrolls past the hero so the primary action is always one tap away.
export function StickyOrderBar() {
  const [show, setShow] = useState(false);
  const waLink = buildWhatsAppLink(
    WHATSAPP_NUMBER,
    "Hi Divs Aesthetix! I'd like to order a handcrafted gift. Could you help me? 😊"
  );

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!waLink) return null;

  return (
    <div
      className={`sm:hidden fixed inset-x-0 bottom-0 z-40 px-4 pb-4 pt-2 transition-all duration-300 ${
        show ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
      }`}
    >
      <a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 rounded-full font-semibold text-white bg-[#25D366] hover:bg-[#20BA5A] transition-colors text-[15px] py-3.5 shadow-[0_10px_30px_-8px_rgba(37,211,102,0.7)]"
      >
        <WhatsAppIcon size={17} /> Order on WhatsApp
      </a>
    </div>
  );
}
