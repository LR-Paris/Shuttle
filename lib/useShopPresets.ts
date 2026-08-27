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
  /** False until /api/presets has answered, for anything that must not flash. */
  loaded: boolean;
}

export function useShopPresets(): ShopDisplay {
  const [display, setDisplay] = useState<ShopDisplay>({
    showPrices: true,
    isRequest: false,
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
export function requestWords(isRequest: boolean) {
  return {
    noun: isRequest ? 'request' : 'order',
    Noun: isRequest ? 'Request' : 'Order',
    cart: isRequest ? 'request' : 'cart',
    Cart: isRequest ? 'Request' : 'Cart',
  };
}
