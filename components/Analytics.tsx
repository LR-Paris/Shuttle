'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const sent = useRef<string>('');

  useEffect(() => {
    if (sent.current === pathname) return;
    sent.current = pathname;

    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
    const slug = basePath.replace(/^\//, '');
    const apiBase = process.env.NEXT_PUBLIC_LAUNCHPAD_API || '';

    // Extract product slug from URL if on a product page
    const productMatch = pathname.match(/\/products?\/([^/?#]+)/);

    const payload = JSON.stringify({
      path: pathname,
      referrer: document.referrer || null,
      screenWidth: window.innerWidth,
      productSlug: productMatch?.[1] || null,
    });

    const url = `${apiBase}/api/shops/${slug}/analytics/track`;

    // Use sendBeacon for reliability (survives page unload), fall back to fetch
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon(url, blob);
    } else {
      fetch(url, {
        method: 'POST',
        body: payload,
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
      }).catch(() => {});
    }
  }, [pathname]);

  return null;
}
