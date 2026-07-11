import { revalidatePath } from 'next/cache';

/**
 * Refresh the cached (ISR) storefront pages after an admin create/update/delete
 * so changes appear immediately instead of waiting for the revalidate window.
 */
export function revalidateStorefront() {
  try {
    revalidatePath('/');
    revalidatePath('/categories/[categoryId]', 'page');
    revalidatePath('/product/[productId]', 'page');
  } catch {
    // Never let cache refresh failures break the API response
  }
}
