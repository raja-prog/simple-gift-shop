"use client";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

interface Props {
  number: string | undefined;
  message: string;
  size?: 'sm' | 'md';
}

export function WhatsAppButtons({ number, message, size = 'md' }: Props) {
  const link = buildWhatsAppLink(number, message);
  const btnSize = size === 'sm' ? 'text-xs px-4 py-2.5' : 'text-sm px-6 py-3';

  if (!link) {
    return <span className="text-xs text-muted italic">Set a valid international WhatsApp number.</span>;
  }

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold text-white bg-[#25D366] hover:bg-[#20BA5A] transition-colors ${btnSize}`}
    >
      <WhatsAppIcon size={size === 'sm' ? 15 : 18} /> Order on WhatsApp
    </a>
  );
}
