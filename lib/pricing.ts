import { getDisplay } from '@/lib/presets';
import { getProduct, type Product, type Collection } from '@/lib/catalog';

/**
 * Price redaction for shops that run with `show_prices: false`.
 *
 * Hiding prices in the UI is not the same as keeping them confidential: the
 * browse APIs would still hand every unit cost to anyone who opens devtools.
 * For a shop built on a client's supplier rate card that matters, so the API
 * layer zeroes the cost fields before they leave the server.
 *
 * Costs stay in the DATABASE files and are re-read server-side when an order is
 * written, so the order CSV still carries a real total.
 */

export function pricesAreVisible(): boolean {
  return getDisplay().show_prices;
}

export function redactProduct(product: Product): Product {
  if (pricesAreVisible()) return product;
  return { ...product, itemCost: 0, boxCost: 0 };
}

export function redactProducts(products: Product[]): Product[] {
  if (pricesAreVisible()) return products;
  return products.map(p => ({ ...p, itemCost: 0, boxCost: 0 }));
}

export function redactCollection(collection: Collection): Collection {
  if (pricesAreVisible()) return collection;
  return { ...collection, products: redactProducts(collection.products) };
}

export function redactCollections(collections: Collection[]): Collection[] {
  if (pricesAreVisible()) return collections;
  return collections.map(redactCollection);
}

/**
 * Recompute an order total from the catalog rather than trusting the client.
 *
 * Needed whenever prices are redacted — the browser only ever saw zeros, so the
 * total it submits is zero. It is also the right thing to do when prices are
 * visible, since a client-supplied total is a client-supplied number.
 *
 * Falls back to the submitted boxCost for any product that is no longer in the
 * catalog, so a renamed folder cannot silently zero out a line.
 */
export function recomputeTotal(
  items: { productId: string; boxCost: number; quantity: number }[],
): number {
  let total = 0;
  for (const item of items) {
    const product = getProduct(item.productId);
    const boxCost = product ? product.boxCost : item.boxCost;
    total += boxCost * item.quantity;
  }
  return Math.round(total * 100) / 100;
}
