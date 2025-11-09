"use client";
import { buildWhatsAppLink } from "@/lib/whatsapp";

interface Props {
  number: string | undefined;
  message: string;
  size?: 'sm' | 'md';
}

export function WhatsAppButtons({ number, message, size = 'md' }: Props) {
  const link = buildWhatsAppLink(number, message);
  const btnSize = size === 'sm' ? 'text-[10px] px-3 py-1' : 'text-sm px-5';

  if (!link) {
    return <span className="text-xs text-muted italic">Set a valid international WhatsApp number.</span>;
  }

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className={`gift-btn-primary ${btnSize}`}
    >
      Message on WhatsApp
    </a>
  );
}
