// WhatsApp link helper
// Requirements: number must be in full international format without +, spaces, or dashes.
// If number invalid (< 8 digits) we return empty string for caller to hide button.
export function buildWhatsAppLink(rawNumber: string | undefined | null, message: string): string {
  let digits = (rawNumber || '').replace(/[^0-9]/g, '');

  // Auto-normalize Indian numbers (add 91 if only 10 digits)
  if (/^0\d{9}$/.test(digits)) digits = digits.slice(1);
  if (/^\d{10}$/.test(digits)) digits = '91' + digits;
  if (digits.startsWith('91') && digits.length !== 12) return '';
  if (!digits.startsWith('91') && digits.length < 8) return '';

  const encoded = encodeURIComponent(message);

  // Primary: wa.me short link (often less blocked)
  const waMeLink = `https://wa.me/${digits}?text=${encoded}`;
  return waMeLink;
}

// Builds a clean, boutique-friendly WhatsApp order message.
// Avoids leaking internal IDs / raw image URLs. Includes a product-page link when available.
export function buildOrderMessage(opts: {
  name: string;
  price?: number;
  productPath?: string; // e.g. /product/abc
}): string {
  const { name, price, productPath } = opts;
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
  const link = productPath ? `${base}${productPath}` : "";
  const priceLine = typeof price === "number" ? `\nPrice: ₹${price.toLocaleString("en-IN")}` : "";
  const linkLine = link ? `\n${link}` : "";
  return `Hi Divs Aesthetix! I'd like to order "${name}".${priceLine}${linkLine}\n\nIs it available? 😊`;
}

// Rich order details captured by the on-page Order Helper before opening WhatsApp.
// Every field is optional so the message stays clean when the buyer skips some.
export interface OrderHelperDetails {
  occasion?: string;
  recipient?: string;
  neededBy?: string; // ISO date or free text
  pincode?: string;
  personalization?: string;
  quantity?: number;
}

// Builds a detailed pre-filled message that collapses the owner's usual Q&A
// (occasion, recipient, date, pincode, personalization, quantity) into one message.
export function buildDetailedOrderMessage(opts: {
  name: string;
  productId?: string;
  price?: number;
  productPath?: string;
  details?: OrderHelperDetails;
}): string {
  const { name, productId, price, productPath, details } = opts;
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
  const link = productPath ? `${base}${productPath}` : "";

  const qty = details?.quantity && details.quantity > 0 ? details.quantity : 1;
  const idPart = productId ? ` (${productId})` : "";
  const pricePart = typeof price === "number" ? ` — ₹${price.toLocaleString("en-IN")}` : "";
  const header = `Hi Divs Aesthetix! Order: ${name}${idPart} ×${qty}${pricePart}.`;

  const lines: string[] = [];
  if (details?.occasion) lines.push(`Occasion: ${details.occasion}`);
  if (details?.recipient) lines.push(`For: ${details.recipient}`);
  if (details?.neededBy) lines.push(`Needed by: ${details.neededBy}`);
  if (details?.pincode) lines.push(`Deliver to: ${details.pincode}`);
  if (details?.personalization) lines.push(`Personalize: ${details.personalization}`);

  const detailBlock = lines.length ? `\n${lines.join("\n")}` : "";
  const linkLine = link ? `\n${link}` : "";
  return `${header}${detailBlock}${linkLine}\n\nIs this doable? 😊`;
}
