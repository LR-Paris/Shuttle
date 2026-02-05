'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface CollectionCardProps {
  collection: {
    id: string;
    name: string;
    products: any[];
  };
  design: any;
}

export default function CollectionCard({ collection, design }: CollectionCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    // Gather all images from products
    const productImages: string[] = [];
    collection.products.forEach((product: any) => {
      if (product.images && product.images.length > 0) {
        productImages.push(...product.images);
      }
    });

    setImages(productImages);

    // Start at random image
    if (productImages.length > 0) {
      setCurrentImageIndex(Math.floor(Math.random() * productImages.length));
    }
  }, [collection]);

  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, [images.length]);

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
          {/* Image counter overlay */}
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
            {currentImageIndex + 1} / {images.length}
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
  );
}
