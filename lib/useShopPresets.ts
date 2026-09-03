'use client';

import { useState, useEffect } from 'react';

/**
 * Client-side view of the two display presets that affect storefront chrome:
 * whether prices render at all, and whether cart/checkout copy reads "request"
 * instead of "order".
 *
 * Defaults match pre-STS-4.1.0 behavior — prices on, order language — so a page
 * renders correctly on the first paint, before /api/presets answers, and keeps
 * working against a Shuttle whose presets endpoint predates these fields.
 */
export interface ShopDisplay {
  showPrices: boolean;
  isRequest: boolean;
  showUnitLabel: boolean;
  showSystemInfo: boolean;
  /** False until /api/presets has answered, for anything that must not flash. */
  loaded: boolean;
}

export function useShopPresets(): ShopDisplay {
  const [display, setDisplay] = useState<ShopDisplay>({
    showPrices: true,
    isRequest: false,
    showUnitLabel: true,
    showSystemInfo: true,
    loaded: false,
  });

  useEffect(() => {
    let cancelled = false;

    fetch('/api/presets')
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        setDisplay({
          showPrices: data?.display?.show_prices !== false,
          isRequest: data?.display?.request_language === true,
          showUnitLabel: data?.display?.show_unit_label !== false,
          showSystemInfo: data?.display?.show_system_info !== false,
          loaded: true,
        });
      })
      .catch(() => {
        if (!cancelled) setDisplay(d => ({ ...d, loaded: true }));
      });

    return () => { cancelled = true; };
  }, []);

  return display;
}

/** "request" / "order" and their capitalized forms, for copy that switches. */
/**
 * Copy for a request shop.
 *
 * `noun` switches: what the customer submits is a request, not an order.
 * `cart` does not. The client asked for a standard shopping journey — Add to
 * Cart, Shopping Cart, Cart (n), Proceed to Checkout — with only the submission
 * framed as a request for approval. A cart called a "Request" also collides
 * with the submitted request it later becomes.
 */
export function requestWords(isRequest: boolean) {
  return {
    noun: isRequest ? 'request' : 'order',
    Noun: isRequest ? 'Request' : 'Order',
    cart: 'cart',
    Cart: 'Cart',
  };
}
