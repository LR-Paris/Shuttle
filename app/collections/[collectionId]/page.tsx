'use client';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CollectionPage({ params }: { params: Promise<{ collectionId: string }> }) {
  const [collectionId, setCollectionId] = useState<string | null>(null);
  const [design, setDesign] = useState<any>(null);
  const [collection, setCollection] = useState<any>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [collectionImages, setCollectionImages] = useState<string[]>([]);

  useEffect(() => {
    async function loadData() {
      const resolvedParams = await params;
      setCollectionId(resolvedParams.collectionId);

      const [designResponse, collectionResponse] = await Promise.all([
        fetch('/api/design'),
        fetch(`/api/collections/${resolvedParams.collectionId}`)
      ]);

      const designData = await designResponse.json();
      setDesign(designData);

      if (!collectionResponse.ok) {
        notFound();
      }

      const coll = await collectionResponse.json();
      setCollection(coll);

      // Collect all product images for the carousel
      const images: string[] = [];
      coll.products.forEach((product: any) => {
        if (product.images && product.images.length > 0) {
          images.push(...product.images);
        }
      });
      setCollectionImages(images);
    }
    loadData();
  }, [params]);

  useEffect(() => {
    if (collectionImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % collectionImages.length);
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, [collectionImages]);

  if (!design || !collection) {
    return <div className="container mx-auto px-4 py-12">Loading...</div>;
  }

  return (
    <div>
      {/* Collection Hero Carousel */}
      {collectionImages.length > 0 && (
        <div className="relative w-full h-[400px] mb-8 overflow-hidden bg-gray-100">
          {collectionImages.map((image: string, index: number) => (
            <div
              key={`${image}-${index}`}
              className="absolute inset-0 transition-opacity duration-1000"
              style={{
                opacity: index === currentImageIndex ? 1 : 0,
              }}
            >
              <img
                src={image}
                alt={`Collection item ${index + 1}`}
                className="w-full h-full object-contain"
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-8">
            <h1
              className="text-5xl font-bold text-white px-4 text-center"
              style={{ fontFamily: design.fonts.titleFont }}
            >
              {collection.name}
            </h1>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            href="/collections"
            className="inline-flex items-center mb-4 hover:opacity-80"
            style={{
              color: design.colors.secondary,
              fontFamily: design.fonts.bodyFont,
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Collections
          </Link>
          {collectionImages.length === 0 && (
            <h1
              className="text-4xl font-bold"
              style={{
                color: design.colors.primary,
                fontFamily: design.fonts.titleFont,
              }}
            >
              {collection.name}
            </h1>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {collection.products.map((product: any) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="border overflow-hidden hover:shadow-lg transition-shadow"
              style={{
                borderColor: design.colors.border,
                borderRadius: `${design.style.cornerRadius}px`,
              }}
            >
              {product.images.length > 0 ? (
                <div className="aspect-square bg-gray-100 relative">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-square bg-gray-100 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 text-gray-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
              <div className="p-4">
                <h3
                  className="font-bold text-lg mb-1"
                  style={{
                    color: design.colors.primary,
                    fontFamily: design.fonts.titleFont,
                  }}
                >
                  {product.name}
                </h3>
                <p
                  className="text-sm mb-2"
                  style={{
                    color: design.colors.textLight,
                    fontFamily: design.fonts.bodyFont,
                  }}
                >
                  SKU: {product.sku}
                </p>
                <div className="mb-2">
                  <p
                    className="text-sm font-semibold"
                    style={{
                      color: design.colors.text,
                      fontFamily: design.fonts.bodyFont,
                    }}
                  >
                    Box of {product.unitsPerBox}
                  </p>
                  <p
                    className="text-2xl font-bold"
                    style={{
                      color: design.colors.secondary,
                      fontFamily: design.fonts.titleFont,
                    }}
                  >
                    ${product.boxCost.toFixed(2)}
                  </p>
                  <p
                    className="text-sm"
                    style={{
                      color: design.colors.textLight,
                      fontFamily: design.fonts.bodyFont,
                    }}
                  >
                    ${product.itemCost.toFixed(2)} per unit
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
