// lib/variants.ts — Variant grouping helpers (STS-3.0.0+)
//
// A "variant group" is 2+ sibling products that share a base name (e.g. the same
// product in several sizes or colors). The catalog engine stamps a `variants`
// array onto every member of a group. These helpers collapse a group down to a
// single representative product so that product LISTINGS and product COUNTS treat
// one variant set as one item (instead of one per size/color).

export interface VariantLike {
  id: string;
  variants?: { id: string }[];
}

// Returns one representative per variant group (the first variant in the group),
// leaving non-variant products untouched. Input order is preserved.
export function dedupeVariantGroups<T extends VariantLike>(products: T[]): T[] {
  return products.filter(
    (p) => !p.variants || p.variants.length === 0 || p.variants[0].id === p.id
  );
}

// Count of distinct products, treating each variant group as a single item.
export function countDistinctProducts(products: VariantLike[]): number {
  return dedupeVariantGroups(products).length;
}

// Display name for a card: the variant group base name (e.g. "Branded Sneakers")
// rather than the folder name of one variant ("Branded Sneakers (10)").
export function variantDisplayName(product: { name: string; variantGroup?: string }): string {
  return product.variantGroup || product.name;
}
