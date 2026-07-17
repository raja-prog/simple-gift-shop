"use client";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "9600717850";

// Persistent floating WhatsApp button shown on every page. Positioned to clear
// the mobile bottom order bars (home / product) so it never overlaps them.
export function FloatingWhatsApp() {
  const waLink = buildWhatsAppLink(
    WHATSAPP_NUMBER,
    "Hi Divs Aesthetix! I'd like to order a handcrafted gift. Could you help me? 😊"
  );

  if (!waLink) return null;

  return (
    <a
      href={waLink}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-24 right-4 sm:bottom-6 sm:right-6 z-50 inline-flex items-center justify-center h-14 w-14 rounded-full text-white bg-[#25D366] hover:bg-[#20BA5A] transition-colors shadow-[0_10px_30px_-6px_rgba(37,211,102,0.7)]"
    >
      <WhatsAppIcon size={26} />
    </a>
  );
}
