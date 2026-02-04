'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import ShowcaseBanner from '@/components/ShowcaseBanner';

interface Product {
  id: string;
  name: string;
  images: string[];
}

interface Collection {
  id: string;
  name: string;
  products: Product[];
}

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
  companyName: string;
  descriptions: {
    tagline: string;
    about: string;
    footer: string;
  };
  cornerStyle: 'rounded' | 'square';
  showcaseImages: string[];
}

export default function CollectionsPage() {
  const [design, setDesign] = useState<DesignData | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [rotatingImages, setRotatingImages] = useState<Record<string, number>>({});

  useEffect(() => {
    Promise.all([
      fetch('/api/design').then(r => r.json()),
      fetch('/api/collections').then(r => r.json()),
    ])
      .then(([designData, collectionsData]) => {
        setDesign(designData);
        setCollections(collectionsData);

        // Initialize rotating image indices
        const initialIndices: Record<string, number> = {};
        collectionsData.forEach((collection: Collection) => {
          initialIndices[collection.id] = 0;
        });
        setRotatingImages(initialIndices);
      })
      .catch(error => {
        console.error('Error loading data:', error);
      });
  }, []);

  useEffect(() => {
    // Rotate through product images for each collection
    const interval = setInterval(() => {
      setRotatingImages(prev => {
        const newIndices = { ...prev };
        collections.forEach(collection => {
          if (collection.products.length > 0) {
            const productsWithImages = collection.products.filter(p => p.images.length > 0);
            if (productsWithImages.length > 0) {
              newIndices[collection.id] = (prev[collection.id] + 1) % productsWithImages.length;
            }
          }
        });
        return newIndices;
      });
    }, 3000); // Rotate every 3 seconds

    return () => clearInterval(interval);
  }, [collections]);

  if (!design) {
    return (
      <div className="container mx-auto px-4 py-12">
        <p>Loading...</p>
      </div>
    );
  }

  const borderRadius = design.cornerStyle === 'rounded' ? '0.5rem' : '0';

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Showcase Banner */}
      {design.showcaseImages.length > 0 && (
        <ShowcaseBanner images={design.showcaseImages} cornerStyle={design.cornerStyle} />
      )}

      <h1 className="text-4xl font-bold mb-8" style={{ color: design.colors.primary }}>
        All Collections
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {collections.map((collection) => {
          const productsWithImages = collection.products.filter(p => p.images.length > 0);
          const currentImageIndex = rotatingImages[collection.id] || 0;
          const currentProduct = productsWithImages[currentImageIndex];

          return (
            <Link
              key={collection.id}
              href={`/collections/${collection.id}`}
              className="border overflow-hidden hover:shadow-lg transition-shadow"
              style={{ borderColor: design.colors.border, borderRadius }}
            >
              {/* Rotating Product Images */}
              {currentProduct && (
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  {productsWithImages.map((product, index) => (
                    <div
                      key={product.id}
                      className="absolute inset-0 transition-opacity duration-1000"
                      style={{
                        opacity: index === currentImageIndex ? 1 : 0,
                      }}
                    >
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="p-6">
                <h2 className="text-2xl font-bold mb-2" style={{ color: design.colors.primary }}>
                  {collection.name}
                </h2>
                <p className="mb-4" style={{ color: design.colors.textLight }}>
                  {collection.products.length} {collection.products.length === 1 ? 'product' : 'products'}
                </p>
                <div className="mt-4">
                  <span
                    className="text-sm font-semibold"
                    style={{ color: design.colors.secondary }}
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
  );
}
