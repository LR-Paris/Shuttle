'use client';

import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ShowcaseBanner from '@/components/ShowcaseBanner';

interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  itemCost: number;
  boxCost: number;
  unitsPerBox: number;
  images: string[];
  collectionId: string;
  collectionName: string;
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

type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'units-asc' | 'units-desc';

export default function CollectionPage() {
  const params = useParams();
  const collectionId = params.collectionId as string;
  const [design, setDesign] = useState<DesignData | null>(null);
  const [collection, setCollection] = useState<Collection | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/design').then(r => r.json()),
      fetch(`/api/collections/${collectionId}`).then(r => r.json()),
    ])
      .then(([designData, collectionData]) => {
        setDesign(designData);
        setCollection(collectionData);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading data:', error);
        setLoading(false);
      });
  }, [collectionId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <p>Loading...</p>
      </div>
    );
  }

  if (!collection || !design) {
    notFound();
  }

  const sortedProducts = [...collection.products].sort((a, b) => {
    switch (sortBy) {
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'price-asc':
        return a.boxCost - b.boxCost;
      case 'price-desc':
        return b.boxCost - a.boxCost;
      case 'units-asc':
        return a.unitsPerBox - b.unitsPerBox;
      case 'units-desc':
        return b.unitsPerBox - a.unitsPerBox;
      default:
        return 0;
    }
  });

  const borderRadius = design.cornerStyle === 'rounded' ? '0.5rem' : '0';

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Showcase Banner */}
      {design.showcaseImages.length > 0 && (
        <ShowcaseBanner images={design.showcaseImages} cornerStyle={design.cornerStyle} />
      )}

      <div className="mb-8">
        <Link
          href="/collections"
          className="inline-flex items-center mb-4 hover:opacity-80"
          style={{ color: design.colors.secondary }}
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
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold" style={{ color: design.colors.primary }}>
            {collection.name}
          </h1>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-semibold" style={{ color: design.colors.text }}>
              Sort by:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="border px-3 py-2"
              style={{ borderColor: design.colors.border, borderRadius }}
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="price-asc">Price (Low to High)</option>
              <option value="price-desc">Price (High to Low)</option>
              <option value="units-asc"># in Box (Low to High)</option>
              <option value="units-desc"># in Box (High to Low)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedProducts.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="border overflow-hidden hover:shadow-lg transition-shadow"
            style={{ borderColor: design.colors.border, borderRadius }}
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
              <h3 className="font-bold text-lg mb-1" style={{ color: design.colors.primary }}>
                {product.name}
              </h3>
              <p className="text-sm mb-2" style={{ color: design.colors.textLight }}>
                SKU: {product.sku}
              </p>
              <div className="mb-2">
                <p className="text-sm font-semibold" style={{ color: design.colors.text }}>
                  Box of {product.unitsPerBox}
                </p>
                <p className="text-2xl font-bold" style={{ color: design.colors.secondary }}>
                  ${product.boxCost.toFixed(2)}
                </p>
                <p className="text-sm" style={{ color: design.colors.textLight }}>
                  ${product.itemCost.toFixed(2)} per unit
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
