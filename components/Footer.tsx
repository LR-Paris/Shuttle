'use client';

import Link from 'next/link';
import Image from 'next/image';
import { getVersion } from '@/lib/version';
import { useEffect, useState } from 'react';

interface FooterProps {
  footerText: string;
  primaryColor: string;
  bodyFont?: string;
}

export default function Footer({ footerText, primaryColor, bodyFont = 'Inter' }: FooterProps) {
  const version = getVersion();
  // The Terms of use link only appears once a shop actually has terms on file,
  // so no shop ships a link to an empty page.
  const [hasTerms, setHasTerms] = useState(false);
  useEffect(() => {
    fetch('/api/terms')
      .then(r => (r.ok ? r.json() : { terms: '' }))
      .then(d => setHasTerms(Boolean(d?.terms)))
      .catch(() => setHasTerms(false));
  }, []);

  return (
    <footer
      className="mt-auto py-8"
      style={{ backgroundColor: primaryColor }}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center space-y-4">
          <p className="text-center text-white text-sm" style={{ fontFamily: bodyFont }}>{footerText}</p>
          <div className="flex items-center gap-2">
            <p className="text-center text-white text-xs opacity-75" style={{ fontFamily: bodyFont }}>
              {version} • Built with LR Paris Shuttle •{' '}
              <Link href="/about" className="underline hover:opacity-80">
                About
              </Link>
              {hasTerms && (
                <>
                  {' • '}
                  <Link href="/terms" className="underline hover:opacity-80">
                    Terms of use
                  </Link>
                </>
              )}
            </p>
            {/* Easter Egg - subtle SVG */}
            <Link
              href="/secret"
              className="hover:opacity-100 transition-opacity"
              title="?"
            >
              <Image
                src="/egg.svg"
                alt=""
                width={12}
                height={15}
                className="opacity-30 hover:opacity-100 transition-opacity"
              />
            </Link>
          </div>
          {/* LR Paris Logo */}
          <a
            href="https://lrparis.com"
            target="_blank"
            rel="noopener noreferrer"
            className="block hover:opacity-90 transition-opacity"
          >
            <Image
              src="/lr-paris-logo.svg"
              alt="LR Paris"
              width={60}
              height={60}
              className="block"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
