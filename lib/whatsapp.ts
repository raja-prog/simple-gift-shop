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
