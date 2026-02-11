'use client';

import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';

interface CollectionCardProps {
  collection: {
    id: string;
    name: string;
    products: any[];
  };
  design: any;
  tick: number;
}

export default function CollectionCard({ collection, design, tick }: CollectionCardProps) {
  // Use showcase photo if available, otherwise fall back to product images
  const images = useMemo(() => {
    // Check if there's a showcase image for this collection
    const showcaseImage = design.collectionShowcaseImages?.[collection.id];
    if (showcaseImage) {
      return [showcaseImage];
    }

    // Fall back to product images
    const mainImages: string[] = [];
    collection.products.forEach((product: any) => {
      if (product.images && product.images.length > 0) {
        mainImages.push(product.images[0]);
      }
    });
    return mainImages;
  }, [collection, design]);

  const currentImageIndex = images.length > 0 ? tick % images.length : 0;

  return (
    <Link
      href={`/collections/${collection.id}`}
      className="border hover:shadow-lg transition-shadow overflow-hidden group"
      style={{
        borderColor: design.colors.border,
        borderRadius: `${design.style.cornerRadius}px`,
      }}
    >
      {/* Image Carousel */}
      {images.length > 0 && (
        <div className="relative w-full aspect-square bg-gray-100 overflow-hidden">
          {images.map((image: string, index: number) => (
            <div
              key={`${image}-${index}`}
              className="absolute inset-0 transition-opacity duration-1000"
              style={{
                opacity: index === currentImageIndex ? 1 : 0,
              }}
            >
              <img
                src={image}
                alt={`${collection.name} product ${index + 1}`}
                className="w-full h-full object-contain p-4"
              />
            </div>
          ))}
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
  );
}
