'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface DesignData {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    textLight: string;
    border: string;
    success: string;
  };
  fonts: {
    titleFont: string;
    bodyFont: string;
  };
  style: {
    cornerRadius: number;
  };
  companyName: string;
}

export default function SecretPage() {
  const [design, setDesign] = useState<DesignData | null>(null);

  useEffect(() => {
    fetch('/api/design')
      .then(r => r.json())
      .then(setDesign)
      .catch(console.error);
  }, []);

  if (!design) {
    return (
      <div className="container mx-auto px-4 py-12">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1
          className="text-6xl font-bold mb-12 text-center"
          style={{
            color: design.colors.text,
            fontFamily: design.fonts.titleFont,
          }}
        >
          You Found the Easter Egg!
        </h1>

        <div
          className="border p-12"
          style={{
            borderColor: design.colors.border,
            backgroundColor: design.colors.background,
            borderRadius: `${design.style.cornerRadius}px`,
          }}
        >
          <p
            className="text-center text-2xl mb-8"
            style={{
              color: design.colors.text,
              fontFamily: design.fonts.bodyFont,
            }}
          >
            Basil the Cat
          </p>

          <div className="mb-8">
            <img
              src="/basil-cat.jpg"
              alt="Basil the Cat"
              className="w-full max-w-2xl mx-auto rounded-lg shadow-lg"
              style={{ borderRadius: `${design.style.cornerRadius}px` }}
            />
          </div>

          <h2
            className="text-4xl font-bold mb-6 text-center"
            style={{
              color: design.colors.text,
              fontFamily: design.fonts.titleFont,
            }}
          >
            Meet Basil!
          </h2>

          <p
            className="text-2xl mb-6 text-center"
            style={{
              color: design.colors.text,
              fontFamily: design.fonts.bodyFont,
            }}
          >
            Shuttle built by <span className="font-bold">Giovanni</span> and <span className="font-bold">Basil</span>
          </p>

          <p
            className="text-lg italic text-center"
            style={{
              color: design.colors.textLight,
              fontFamily: design.fonts.bodyFont,
            }}
          >
            (Yes, Basil did actually help. No she is not an employee at LR Paris.)
          </p>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-block px-6 py-3 text-white font-semibold hover:opacity-90 transition-opacity"
            style={{
              backgroundColor: design.colors.secondary,
              borderRadius: `${design.style.cornerRadius}px`,
              fontFamily: design.fonts.bodyFont,
            }}
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
