/**
 * Packaging helpers.
 *
 * Shuttle prices by the box: `quantity` in a cart line is a number of boxes and
 * `boxCost` is the price of one box. Plenty of catalogs sell single units, and
 * those arrive with UnitsPerBox.txt set to 1 — for them every "Box of 1 units"
 * and "2 boxes x $18.00" in the UI is wrong. These helpers return null when the
 * product is not boxed so the caller can drop the line entirely.
 */

/** True when the product ships as loose units rather than a case. */
export function isSingleUnit(unitsPerBox: number): boolean {
  return !Number.isFinite(unitsPerBox) || unitsPerBox <= 1;
}

/** "Box of 32 units", or null for single-unit products. */
export function packLabel(unitsPerBox: number): string | null {
  return isSingleUnit(unitsPerBox) ? null : `Box of ${unitsPerBox} units`;
}

/** "box" / "boxes" for cased goods, "item" / "items" for single units. */
export function unitNoun(unitsPerBox: number, quantity: number): string {
  const plural = quantity !== 1;
  if (isSingleUnit(unitsPerBox)) return plural ? 'items' : 'item';
  return plural ? 'boxes' : 'box';
}

/** "per box" / "each". */
export function perUnitLabel(unitsPerBox: number): string {
  return isSingleUnit(unitsPerBox) ? 'each' : 'per box';
}

/** "64 total units", or null when boxes and units are the same thing. */
export function totalUnitsLabel(quantity: number, unitsPerBox: number): string | null {
  if (isSingleUnit(unitsPerBox)) return null;
  return `${quantity * unitsPerBox} total units`;
}
