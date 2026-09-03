'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface DesignData {
  companyName: string;
  colors: { primary: string; text: string; textLight: string; background: string; border: string };
}

/**
 * Terms of use, rendered from DATABASE/Design/Details/Terms.txt.
 *
 * Paragraphs are separated by a blank line. A line ending in a colon is treated
 * as a heading, which keeps the file readable to whoever maintains it without
 * asking them to write markup.
 */
export default function TermsPage() {
  const [design, setDesign] = useState<DesignData | null>(null);
  const [terms, setTerms] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/design')
      .then(r => (r.ok ? r.json() : null))
      .then(setDesign)
      .catch(() => setDesign(null));
    fetch('/api/terms')
      .then(r => (r.ok ? r.json() : { terms: '' }))
      .then(d => setTerms(d?.terms ?? ''))
      .catch(() => setTerms(''));
  }, []);

  useEffect(() => {
    if (design) document.title = `${design.companyName} - Terms of use`;
  }, [design]);

  if (!design || terms === null) {
    return <div className="container mx-auto px-4 py-16 text-center">Loading...</div>;
  }

  const blocks = terms.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-4xl font-bold mb-8" style={{ color: design.colors.primary }}>
        Terms of use
      </h1>

      {blocks.length === 0 ? (
        <p style={{ color: design.colors.textLight }}>
          Terms of use for this portal are being finalized.
        </p>
      ) : (
        blocks.map((block, i) =>
          block.endsWith(':') ? (
            <h2
              key={i}
              className="text-lg font-semibold mt-8 mb-2"
              style={{ color: design.colors.primary }}
            >
              {block.replace(/:$/, '')}
            </h2>
          ) : (
            <p key={i} className="mb-4 leading-relaxed" style={{ color: design.colors.text }}>
              {block}
            </p>
          )
        )
      )}

      <div className="mt-12 pt-6 border-t" style={{ borderColor: design.colors.border }}>
        <Link href="/" className="underline" style={{ color: design.colors.primary }}>
          Back to home
        </Link>
      </div>
    </div>
  );
}
