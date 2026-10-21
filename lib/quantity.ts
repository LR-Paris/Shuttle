// lib/quantity.ts — the words a shop uses for the amount a product sells in.
//
// Every product sells in lots of UnitsPerBox units. Most shops call a lot a
// box: "Box of 50 units". A shop whose lot is a minimum order, such as 1,000
// promotional items, sets Style.txt `quantityLabel: moq` and says "MOQ 1000
// units" instead. Ordering does not change: a customer orders whole lots.

export type QuantityLabel = 'box' | 'moq';

export interface QuantityWords {
  /** The line on cards and the product page: "Box of 50 units" or "MOQ 1000 units". */
  lot: (units: number) => string;
  /** The counting word: "box" and "boxes", or "lot" and "lots". */
  noun: (count: number) => string;
  /** After a lot price in the cart: "per box" or "per lot". */
  perLot: string;
  /** The heading over the quantity picker on the product page. */
  quantityHeading: (units: number) => string;
  /** The sort option for lot size: "Units per box" or "MOQ". */
  sortLabel: string;
  /** The sort option for the lot price: "Box price" or "Minimum order". */
  lotPriceLabel: string;
}

export function quantityWords(label?: string): QuantityWords {
  if (label === 'moq') {
    return {
      lot: (units) => `MOQ ${units} units`,
      noun: (count) => (count === 1 ? 'lot' : 'lots'),
      perLot: 'per lot',
      quantityHeading: (units) => `Quantity, in lots of ${units} units:`,
      sortLabel: 'MOQ',
      lotPriceLabel: 'Minimum order',
    };
  }
  return {
    lot: (units) => `Box of ${units} units`,
    noun: (count) => (count === 1 ? 'box' : 'boxes'),
    perLot: 'per box',
    quantityHeading: () => 'Quantity (boxes):',
    sortLabel: 'Units per box',
    lotPriceLabel: 'Box price',
  };
}
