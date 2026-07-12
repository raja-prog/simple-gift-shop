// Single source of truth for currency formatting across the storefront.
export function formatPrice(value: number): string {
  return `₹${Number(value).toLocaleString("en-IN")}`;
}
