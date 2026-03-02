'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import FadeImage from '@/components/FadeImage';

export default function Home() {
  const [design, setDesign] = useState<any>(null);
  const [collections, setCollections] = useState<any[]>([]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [stockMap, setStockMap] = useState<Record<string, number>>({});

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

      // If single collection, flatten products and fetch inventory for stock badges
      if (collectionsData.length >= 1 && collectionsData.length <= 1) {
        const products: any[] = [];
        collectionsData.forEach((collection: any) => {
          collection.products.forEach((product: any) => {
            products.push(product);
          });
        });
        setAllProducts(products);

        try {
          const inventoryResponse = await fetch('/api/inventory');
          if (inventoryResponse.ok) {
            const inventoryData = await inventoryResponse.json();
            const map: Record<string, number> = {};
            inventoryData.forEach((item: any) => { map[item.productId] = item.stock; });
            setStockMap(map);
          }
        } catch {
          // Inventory is optional
        }
      }
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
  const isSingleCollection = collections.length === 1;

  return (
    <div>
      {/* Hero Section with Showcase Images */}
      {hasHeroImages ? (
        <div className="relative w-full h-[500px] mb-16 overflow-hidden bg-gray-200">
          {design.heroImages.map((image: string, index: number) => (
            <div
              key={image}
              className="absolute inset-0 transition-opacity duration-1000"
              style={{
                opacity: index === currentHeroIndex ? 1 : 0,
              }}
            >
              <FadeImage
                src={image}
                alt={`Hero ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="text-center text-white px-4">
              {design.logoWhitePath ? (
                <img
                  src={design.logoWhitePath}
                  alt={design.companyName}
                  className="w-auto mx-auto mb-4"
                  style={{ height: '4.5rem', objectFit: 'contain' }}
                />
              ) : (
                <h1
                  className="text-6xl font-bold mb-4"
                  style={{ fontFamily: design.fonts.titleFont }}
                >
                  {design.companyName}
                </h1>
              )}
              <p className="text-2xl mb-8" style={{ fontFamily: design.fonts.bodyFont }}>
                {design.descriptions.tagline}
              </p>
              <Link
                href={isSingleCollection ? "/shop-all" : "/collections"}
                className="inline-block px-8 py-3 text-white font-semibold hover:opacity-90 transition-opacity"
                style={{
                  backgroundColor: design.colors.secondary,
                  borderRadius: `${design.style.cornerRadius}px`,
                  fontFamily: design.fonts.bodyFont,
                }}
              >
                {isSingleCollection ? 'Shop All' : 'Browse Collections'}
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
              href={isSingleCollection ? "/shop-all" : "/collections"}
              className="inline-block px-8 py-3 text-white text-lg font-semibold hover:opacity-90 transition-opacity"
              style={{
                backgroundColor: design.colors.secondary,
                borderRadius: `${design.style.cornerRadius}px`,
                fontFamily: design.fonts.bodyFont,
              }}
            >
              {isSingleCollection ? 'Shop All' : 'Browse Collections'}
            </Link>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-12">
        {/* About Section */}
        <div className="mb-16 max-w-3xl mx-auto text-center">
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

        {/* Collections Preview or Product Grid */}
        <div>
          <h2
            className="text-3xl font-bold mb-8 text-center"
            style={{
              color: design.colors.primary,
              fontFamily: design.fonts.titleFont,
            }}
          >
            {isSingleCollection ? 'Our Products' : 'Our Collections'}
          </h2>

          {isSingleCollection ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {allProducts.map((product: any) => {
                const stock = stockMap[product.id] ?? null;
                const isOutOfStock = stock !== null && stock <= 0;
                const isLowStock = stock !== null && stock > 0 && stock <= 5;

                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}?from=shop-all`}
                    className="border overflow-hidden hover:shadow-lg transition-shadow"
                    style={{
                      borderColor: design.colors.border,
                      borderRadius: `${design.style.cornerRadius}px`,
                      opacity: isOutOfStock ? 0.6 : 1,
                    }}
                  >
                    {product.images.length > 0 ? (
                      <div className="aspect-square bg-gray-100 relative border-b" style={{ borderColor: design.colors.border }}>
                        <FadeImage
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-contain p-4"
                        />
                        {stock !== null && (
                          <span
                            className="absolute top-2 right-2 text-xs font-semibold px-2 py-1 rounded"
                            style={{
                              backgroundColor: isOutOfStock ? '#DC2626' : isLowStock ? design.colors.secondary : design.colors.success,
                              color: '#FFFFFF',
                            }}
                          >
                            {isOutOfStock ? 'Out of Stock' : isLowStock ? `Only ${stock} left` : `${stock} boxes left`}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="aspect-square bg-gray-100 flex items-center justify-center border-b relative" style={{ borderColor: design.colors.border }}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {stock !== null && (
                          <span
                            className="absolute top-2 right-2 text-xs font-semibold px-2 py-1 rounded"
                            style={{
                              backgroundColor: isOutOfStock ? '#DC2626' : isLowStock ? design.colors.secondary : design.colors.success,
                              color: '#FFFFFF',
                            }}
                          >
                            {isOutOfStock ? 'Out of Stock' : isLowStock ? `Only ${stock} left` : `${stock} boxes left`}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="p-4">
                      <h3
                        className="font-bold text-lg mb-1"
                        style={{ color: design.colors.primary, fontFamily: design.fonts.titleFont }}
                      >
                        {product.name}
                      </h3>
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
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
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
                      <div className="relative w-full bg-gray-100 overflow-hidden border-b" style={{ borderColor: design.colors.border }}>
                        <FadeImage
                          src={showcaseImage}
                          alt={collection.name}
                          className="w-full h-auto object-cover"
                          style={{ maxHeight: '400px' }}
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
          )}
        </div>
      </div>
    </div>
  );
}
