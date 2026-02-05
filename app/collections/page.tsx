'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface CollectionWithCarousel {
  id: string;
  name: string;
  products: any[];
  currentImageIndex: number;
  images: string[];
}

export default function CollectionsPage() {
  const [design, setDesign] = useState<any>(null);
  const [collections, setCollections] = useState<CollectionWithCarousel[]>([]);

  useEffect(() => {
    async function loadData() {
      const [designResponse, collectionsResponse] = await Promise.all([
        fetch('/api/design'),
        fetch('/api/collections')
      ]);

      const designData = await designResponse.json();
      const collectionsData = await collectionsResponse.json();

      setDesign(designData);

      // Initialize collections with image data
      const collectionsWithImages = collectionsData.map((collection: any) => {
        const images: string[] = [];
        collection.products.forEach((product: any) => {
          if (product.images && product.images.length > 0) {
            images.push(...product.images);
          }
        });

        return {
          ...collection,
          currentImageIndex: 0,
          images,
        };
      });

      setCollections(collectionsWithImages);
    }
    loadData();
  }, []);

  useEffect(() => {
    if (collections.length === 0) return;

    const interval = setInterval(() => {
      setCollections((prevCollections) =>
        prevCollections.map((collection) => ({
          ...collection,
          currentImageIndex:
            collection.images.length > 0
              ? (collection.currentImageIndex + 1) % collection.images.length
              : 0,
        }))
      );
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, [collections.length]);

  if (!design) {
    return <div className="container mx-auto px-4 py-12">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1
        className="text-4xl font-bold mb-8"
        style={{
          color: design.colors.primary,
          fontFamily: design.fonts.titleFont,
        }}
      >
        All Collections
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {collections.map((collection) => (
          <Link
            key={collection.id}
            href={`/collections/${collection.id}`}
            className="border hover:shadow-lg transition-shadow overflow-hidden group"
            style={{
              borderColor: design.colors.border,
              borderRadius: `${design.style.cornerRadius}px`,
            }}
          >
            {/* Image Carousel */}
            {collection.images.length > 0 && (
              <div className="relative w-full aspect-square bg-gray-100 overflow-hidden">
                {collection.images.map((image: string, index: number) => (
                  <div
                    key={`${image}-${index}`}
                    className="absolute inset-0 transition-opacity duration-1000"
                    style={{
                      opacity: index === collection.currentImageIndex ? 1 : 0,
                    }}
                  >
                    <img
                      src={image}
                      alt={`${collection.name} product ${index + 1}`}
                      className="w-full h-full object-contain p-4"
                    />
                  </div>
                ))}
                {/* Image counter overlay */}
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                  {collection.currentImageIndex + 1} / {collection.images.length}
                </div>
              </div>
            )}

            {/* Collection Info */}
            <div className="p-6">
              <h2
                className="text-2xl font-bold mb-2"
                style={{
                  color: design.colors.primary,
                  fontFamily: design.fonts.titleFont,
                }}
              >
                {collection.name}
              </h2>
              <p
                className="mb-4"
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
                  className="text-sm font-semibold group-hover:underline"
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
        ))}
      </div>
    </div>
  );
}
