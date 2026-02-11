'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const [design, setDesign] = useState<any>(null);
  const [collections, setCollections] = useState<any[]>([]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  useEffect(() => {
    async function loadData() {
      const [designResponse, collectionsResponse] = await Promise.all([
        fetch('/api/design'),
        fetch('/api/collections')
      ]);

      const designData = await designResponse.json();
      const collectionsData = await collectionsResponse.json();

      setDesign(designData);
      setCollections(collectionsData);
      document.title = designData.companyName;
    }
    loadData();
  }, []);

  useEffect(() => {
    if (!design || design.heroImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % design.heroImages.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [design]);

  if (!design) {
    return <div className="container mx-auto px-4 py-12">Loading...</div>;
  }

  const hasHeroImages = design.heroImages && design.heroImages.length > 0;

  return (
    <div>
      {/* Hero Section with Showcase Images */}
      {hasHeroImages ? (
        <div className="relative w-full h-[500px] mb-16 overflow-hidden">
          {design.heroImages.map((image: string, index: number) => (
            <div
              key={image}
              className="absolute inset-0 transition-opacity duration-1000"
              style={{
                opacity: index === currentHeroIndex ? 1 : 0,
              }}
            >
              <img
                src={image}
                alt={`Hero ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="text-center text-white px-4">
              <h1
                className="text-6xl font-bold mb-4"
                style={{ fontFamily: design.fonts.titleFont }}
              >
                {design.companyName}
              </h1>
              <p className="text-2xl mb-8" style={{ fontFamily: design.fonts.bodyFont }}>
                {design.descriptions.tagline}
              </p>
              <Link
                href="/collections"
                className="inline-block px-8 py-3 text-white font-semibold hover:opacity-90 transition-opacity"
                style={{
                  backgroundColor: design.colors.secondary,
                  borderRadius: `${design.style.cornerRadius}px`,
                  fontFamily: design.fonts.bodyFont,
                }}
              >
                Browse Collections
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-12">
          {/* Hero Section without images */}
          <div className="text-center mb-16">
            <h1
              className="text-5xl font-bold mb-4"
              style={{
                color: design.colors.primary,
                fontFamily: design.fonts.titleFont,
              }}
            >
              {design.companyName}
            </h1>
            <p
              className="text-2xl mb-8"
              style={{
                color: design.colors.textLight,
                fontFamily: design.fonts.bodyFont,
              }}
            >
              {design.descriptions.tagline}
            </p>
            <Link
              href="/collections"
              className="inline-block px-8 py-3 text-white text-lg font-semibold hover:opacity-90 transition-opacity"
              style={{
                backgroundColor: design.colors.secondary,
                borderRadius: `${design.style.cornerRadius}px`,
                fontFamily: design.fonts.bodyFont,
              }}
            >
              Browse Collections
            </Link>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-12">
        {/* About Section */}
        <div className="mb-16 max-w-3xl mx-auto">
          <h2
            className="text-3xl font-bold mb-4"
            style={{
              color: design.colors.primary,
              fontFamily: design.fonts.titleFont,
            }}
          >
            About Us
          </h2>
          <p
            className="text-lg leading-relaxed"
            style={{
              color: design.colors.text,
              fontFamily: design.fonts.bodyFont,
            }}
          >
            {design.descriptions.about}
          </p>
        </div>

        {/* Collections Preview */}
        <div>
          <h2
            className="text-3xl font-bold mb-8 text-center"
            style={{
              color: design.colors.primary,
              fontFamily: design.fonts.titleFont,
            }}
          >
            Our Collections
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {collections.map((collection) => {
              const showcaseImage = design.collectionShowcaseImages?.[collection.id];
              return (
                <Link
                  key={collection.id}
                  href={`/collections/${collection.id}`}
                  className="border hover:shadow-lg transition-shadow overflow-hidden"
                  style={{
                    borderColor: design.colors.border,
                    borderRadius: `${design.style.cornerRadius}px`,
                  }}
                >
                  {/* Showcase Image */}
                  {showcaseImage && (
                    <div className="relative w-full aspect-square bg-gray-100 overflow-hidden">
                      <img
                        src={showcaseImage}
                        alt={collection.name}
                        className="w-full h-full object-contain p-4"
                      />
                    </div>
                  )}

                  <div className="p-6">
                    <h3
                      className="text-2xl font-bold mb-2"
                      style={{
                        color: design.colors.primary,
                        fontFamily: design.fonts.titleFont,
                      }}
                    >
                      {collection.name}
                    </h3>
                    <p
                      style={{
                        color: design.colors.textLight,
                        fontFamily: design.fonts.bodyFont,
                      }}
                    >
                      {collection.products.length}{' '}
                      {collection.products.length === 1 ? 'product' : 'products'}
                    </p>
                    <div className="mt-4">
                      <span
                        className="text-sm font-semibold"
                        style={{
                          color: design.colors.secondary,
                          fontFamily: design.fonts.bodyFont,
                        }}
                      >
                        View Collection →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
