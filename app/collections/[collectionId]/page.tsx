'use client';

import { apiFetch } from '@/lib/api';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import FadeImage from '@/components/FadeImage';
import { dedupeVariantGroups } from '@/lib/variants';

type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'units-asc' | 'units-desc' | 'total-asc' | 'total-desc';

interface ProductVariant {
  id: string;
  name: string;
  values: string[];
}

interface Product {
  id: string;
  name: string;
  sku: string;
  itemCost: number;
  boxCost: number;
  unitsPerBox: number;
  images: string[];
  variantGroup?: string;
  variantDimensions?: string[];
  variantValues?: string[];
  variants?: ProductVariant[];
}

export default function CollectionPage({ params }: { params: Promise<{ collectionId: string }> }) {
  const [collectionId, setCollectionId] = useState<string | null>(null);
  const [design, setDesign] = useState<any>(null);
  const [collection, setCollection] = useState<any>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [collectionImages, setCollectionImages] = useState<string[]>([]);
  const [hasShowcaseImage, setHasShowcaseImage] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [stockMap, setStockMap] = useState<Record<string, number>>({});

  useEffect(() => {
    async function loadData() {
      const resolvedParams = await params;
      setCollectionId(resolvedParams.collectionId);

      const [designResponse, collectionResponse, inventoryResponse] = await Promise.all([
        apiFetch('design'),
        apiFetch(`collections/${resolvedParams.collectionId}`),
        apiFetch('inventory').catch(() => null),
      ]);

      const designData = await designResponse.json();
      setDesign(designData);

      if (inventoryResponse?.ok) {
        const inventoryData = await inventoryResponse.json();
        const map: Record<string, number> = {};
        inventoryData.forEach((item: any) => { map[item.productId] = item.stock; });
        setStockMap(map);
      }

      if (!collectionResponse.ok) {
        notFound();
      }

      const coll = await collectionResponse.json();
      setCollection(coll);
      document.title = `${designData.companyName} - ${coll.name}`;

      const showcaseImage = designData.collectionShowcaseImages?.[resolvedParams.collectionId];
      if (showcaseImage) {
        setCollectionImages([showcaseImage]);
        setHasShowcaseImage(true);
      } else {
        const images: string[] = [];
        coll.products.forEach((product: any) => {
          if (product.images && product.images.length > 0) {
            images.push(product.images[0]);
          }
        });
        setCollectionImages(images);
      }
    }
    loadData();
  }, [params]);

  useEffect(() => {
    if (collectionImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % collectionImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [collectionImages]);

  if (!design || !collection) {
    return <div className="container mx-auto px-4 py-12">Loading...</div>;
  }

  // Sort — use variantGroup as the sort key for grouped products so siblings stay together
  const sortedProducts = [...collection.products].sort((a: Product, b: Product) => {
    const aKey = a.variantGroup || a.name;
    const bKey = b.variantGroup || b.name;
    switch (sortBy) {
      case 'name-asc':  return aKey.localeCompare(bKey);
      case 'name-desc': return bKey.localeCompare(aKey);
      case 'price-asc':  return a.itemCost - b.itemCost;
      case 'price-desc': return b.itemCost - a.itemCost;
      case 'units-asc':  return a.unitsPerBox - b.unitsPerBox;
      case 'units-desc': return b.unitsPerBox - a.unitsPerBox;
      case 'total-asc':  return a.boxCost - b.boxCost;
      case 'total-desc': return b.boxCost - a.boxCost;
      default: return 0;
    }
  });

  // One card per variant group (shared helper — see lib/variants.ts)
  const displayProducts = dedupeVariantGroups(sortedProducts);

  return (
    <div>
      {/* Collection Hero */}
      {collectionImages.length > 0 && hasShowcaseImage ? (
        <div className="relative w-full mb-8 overflow-hidden bg-gray-100">
          <FadeImage
            src={collectionImages[0]}
            alt={collection.name}
            className="w-full h-auto object-cover"
            style={{ maxHeight: '600px' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-8">
            <h1 className="text-5xl font-bold text-white px-4 text-center" style={{ fontFamily: design.fonts.titleFont }}>
              {collection.name}
            </h1>
          </div>
        </div>
      ) : collectionImages.length > 0 ? (
        <div className="relative w-full h-[400px] mb-8 overflow-hidden bg-gray-100">
          {collectionImages.map((image: string, index: number) => (
            <div
              key={`${image}-${index}`}
              className="absolute inset-0 transition-opacity duration-1000"
              style={{ opacity: index === currentImageIndex ? 1 : 0 }}
            >
              <FadeImage src={image} alt={`Collection item ${index + 1}`} className="w-full h-full object-contain" />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-8">
            <h1 className="text-5xl font-bold text-white px-4 text-center" style={{ fontFamily: design.fonts.titleFont }}>
              {collection.name}
            </h1>
          </div>
        </div>
      ) : null}

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            href="/collections"
            className="inline-flex items-center mb-4 hover:opacity-80"
            style={{ color: design.colors.secondary, fontFamily: design.fonts.bodyFont }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Collections
          </Link>
          {collectionImages.length === 0 && (
            <h1 className="text-4xl font-bold" style={{ color: design.colors.primary, fontFamily: design.fonts.titleFont }}>
              {collection.name}
            </h1>
          )}
        </div>

        {/* Sort Options */}
        <div className="mb-6 flex items-center justify-between">
          <p style={{ color: design.colors.textLight, fontFamily: design.fonts.bodyFont }}>
            {displayProducts.length} {displayProducts.length === 1 ? 'product' : 'products'}
          </p>
          <div className="flex items-center gap-3">
            <label htmlFor="sort" style={{ color: design.colors.text, fontFamily: design.fonts.bodyFont }}>Sort by:</label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2 border"
              style={{
                borderColor: design.colors.border,
                borderRadius: `${design.style.cornerRadius}px`,
                fontFamily: design.fonts.bodyFont,
                color: design.colors.text,
              }}
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="price-asc">Price per unit (Low to High)</option>
              <option value="price-desc">Price per unit (High to Low)</option>
              <option value="units-asc">Units per box (Low to High)</option>
              <option value="units-desc">Units per box (High to Low)</option>
              <option value="total-asc">Box price (Low to High)</option>
              <option value="total-desc">Box price (High to Low)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayProducts.map((product: Product) => {
            const stock = stockMap[product.id] ?? null;
            const isOutOfStock = stock !== null && stock <= 0;
            const displayName = product.variantGroup || product.name;

            return (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="border overflow-hidden hover:shadow-lg transition-shadow"
                style={{
                  borderColor: design.colors.border,
                  borderRadius: `${design.style.cornerRadius}px`,
                  opacity: isOutOfStock ? 0.6 : 1,
                }}
              >
                {product.images.length > 0 ? (
                  <div className="aspect-square bg-gray-100 relative border-b" style={{ borderColor: design.colors.border }}>
                    <FadeImage src={product.images[0]} alt={displayName} className="w-full h-full object-contain p-4" />
                  </div>
                ) : (
                  <div className="aspect-square bg-gray-100 flex items-center justify-center border-b relative" style={{ borderColor: design.colors.border }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1" style={{ color: design.colors.primary, fontFamily: design.fonts.titleFont }}>
                    {displayName}
                  </h3>

                  {/* Variant chips — deduplicated first-dimension values with stock awareness */}
                  {product.variants && product.variants.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs mb-1" style={{ color: design.colors.textLight, fontFamily: design.fonts.bodyFont }}>
                        {product.variantDimensions?.[0] ?? 'Options'}:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {(() => {
                          // Deduplicate first-dimension values
                          const seen = new Set<string>();
                          const uniqueValues = product.variants!
                            .map((v: ProductVariant) => v.values[0])
                            .filter((val: string) => val && !seen.has(val) && !!seen.add(val));

                          return uniqueValues.map((value: string) => {
                            // Find all variants with this first-dim value
                            const withValue = product.variants!.filter((v: ProductVariant) => v.values[0] === value);
                            // OOS if every variant with this value has known stock ≤ 0
                            const allOOS = withValue.length > 0 && withValue.every(
                              (v: ProductVariant) => stockMap[v.id] !== undefined && stockMap[v.id] <= 0
                            );
                            const isActive = product.variantValues?.[0] === value;

                            return (
                              <span
                                key={value}
                                className="px-2 py-0.5 text-xs border rounded-full"
                                style={{
                                  borderColor: isActive ? design.colors.secondary : design.colors.border,
                                  color: isActive ? design.colors.secondary : allOOS ? design.colors.border : design.colors.textLight,
                                  opacity: allOOS ? 0.45 : 1,
                                  textDecoration: allOOS ? 'line-through' : 'none',
                                  fontFamily: design.fonts.bodyFont,
                                }}
                              >
                                {value}
                              </span>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  )}

                  <p className="text-sm mb-2" style={{ color: design.colors.textLight, fontFamily: design.fonts.bodyFont }}>
                    SKU: {product.sku}
                  </p>
                  <div className="mb-2">
                    <p className="text-sm font-semibold" style={{ color: design.colors.text, fontFamily: design.fonts.bodyFont }}>
                      Box of {product.unitsPerBox} units
                    </p>
                    <p className="text-2xl font-bold" style={{ color: design.colors.secondary, fontFamily: design.fonts.titleFont }}>
                      ${product.boxCost.toFixed(2)}
                    </p>
                    <p className="text-sm" style={{ color: design.colors.textLight, fontFamily: design.fonts.bodyFont }}>
                      ${product.itemCost.toFixed(2)} per unit
                    </p>
                  </div>
                  {stock !== null && (
                    <p className="text-xs" style={{ color: isOutOfStock ? '#DC2626' : design.colors.success }}>
                      {isOutOfStock ? 'Out of Stock' : 'In Stock'}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
