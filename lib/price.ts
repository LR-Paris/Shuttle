// lib/price.ts — which price a product card and the product page lead with.
//
// Style.txt `mainPrice: box` (the default) shows the box price large and the
// unit price on the small line. `mainPrice: unit` swaps them, for shops whose
// box is a whole order size and whose buyers compare unit prices.

export type MainPrice = 'box' | 'unit';

export interface PriceLines {
  /** True when the unit price leads. */
  unitFirst: boolean;
  /** The large price, for example "$440.00", or "$46.33" when the unit leads. */
  main: string;
  /** The small line under it, for example "$17.60 per unit", "$46330.00 per box" or "$45000.00 minimum order". */
  secondary: string;
}

// Style.txt `quantityLabel: moq` makes the lot a minimum order, so with the
// unit price leading, the small line reads "$45000.00 minimum order".
export function priceLines(
  product: { boxCost: number; itemCost: number },
  mainPrice?: string,
  quantityLabel?: string,
): PriceLines {
  const unitFirst = mainPrice === 'unit';
  const lotPrice = `$${product.boxCost.toFixed(2)}`;
  return {
    unitFirst,
    main: `$${(unitFirst ? product.itemCost : product.boxCost).toFixed(2)}`,
    secondary: unitFirst
      ? (quantityLabel === 'moq' ? `${lotPrice} minimum order` : `${lotPrice} per box`)
      : `$${product.itemCost.toFixed(2)} per unit`,
  };
}
