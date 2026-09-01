'use client';

import { useShopPresets } from '@/lib/useShopPresets';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import FadeImage from '@/components/FadeImage';

type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'units-asc' | 'units-desc' | 'total-asc' | 'total-desc';

export default function ShopAllPage() {
  const [design, setDesign] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [stockMap, setStockMap] = useState<Record<string, number>>({});
  const { showPrices } = useShopPresets();
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const PER_PAGE = 20;

  useEffect(() => {
    async function loadData() {
      const [designResponse, collectionsResponse, inventoryResponse] = await Promise.all([
        fetch('/api/design'),
        fetch('/api/collections'),
        fetch('/api/inventory').catch(() => null),
      ]);

      const designData = await designResponse.json();
      const collectionsData = await collectionsResponse.json();

      setDesign(designData);
      document.title = `${designData.companyName} - Shop All`;

      // Build stock map from inventory
      if (inventoryResponse?.ok) {
        const inventoryData = await inventoryResponse.json();
        const map: Record<string, number> = {};
        inventoryData.forEach((item: any) => { map[item.productId] = item.stock; });
        setStockMap(map);
      }

      // Flatten all products from all collections
      const allProducts: any[] = [];
      collectionsData.forEach((collection: any) => {
        collection.products.forEach((product: any) => {
          allProducts.push(product);
        });
      });

      setProducts(allProducts);
    }
    loadData();
  }, []);

  if (!design) {
    return <div className="container mx-auto px-4 py-12">Loading...</div>;
  }

  // Search across the fields a requestor would actually recall: the product
  // name, its ELC item number via the SKU, and the spec lines in the
  // description. Every term must match somewhere, so "pouch AF105" narrows
  // rather than widening.
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const matched = terms.length === 0 ? products : products.filter((p: any) => {
    const haystack = [p.name, p.sku, p.description, p.collectionName]
      .filter(Boolean).join(' ').toLowerCase();
    return terms.every(t => haystack.includes(t));
  });

  const totalPages = Math.max(1, Math.ceil(matched.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PER_PAGE;
  const pageEnd = Math.min(pageStart + PER_PAGE, matched.length);

  // Sort products based on selected option
  const sortedProducts = [...matched].sort((a, b) => {
    switch (sortBy) {
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'price-asc':
        return a.itemCost - b.itemCost;
      case 'price-desc':
        return b.itemCost - a.itemCost;
      case 'units-asc':
        return a.unitsPerBox - b.unitsPerBox;
      case 'units-desc':
        return b.unitsPerBox - a.unitsPerBox;
      case 'total-asc':
        return a.boxCost - b.boxCost;
      case 'total-desc':
        return b.boxCost - a.boxCost;
      default:
        return 0;
    }
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <h1
        className="text-4xl font-bold mb-8"
        style={{
          color: design.colors.primary,
          fontFamily: design.fonts.titleFont,
        }}
      >
        Shop All Products
      </h1>

      {/* Sort Options */}
      <div className="mb-6 flex items-center justify-between">
        <p
          style={{
            color: design.colors.textLight,
            fontFamily: design.fonts.bodyFont,
          }}
        >
          {matched.length === 0
            ? (terms.length ? `No products match "${query}"` : 'No products')
            : terms.length
              ? `Showing ${pageStart + 1}-${pageEnd} of ${matched.length} matching products`
              : `Showing ${pageStart + 1}-${pageEnd} of ${matched.length} products`}
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <input
              id="product-search"
              type="search"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              placeholder="Search by name, item number or material"
              aria-label="Search products"
              className="pl-9 pr-3 py-2 border focus:outline-none focus:ring-2"
              style={{
                borderColor: design.colors.border,
                borderRadius: `${design.style.cornerRadius}px`,
                fontFamily: design.fonts.bodyFont,
                color: design.colors.text,
                minWidth: '19rem',
              }}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
              style={{ color: design.colors.textLight }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
            </svg>
          </div>
          <label
            htmlFor="sort"
            style={{
              color: design.colors.text,
              fontFamily: design.fonts.bodyFont,
            }}
          >
            Sort by:
          </label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value as SortOption); setPage(1); }}
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
            {showPrices && (
              <>
                <option value="price-asc">Price per unit (Low to High)</option>
                <option value="price-desc">Price per unit (High to Low)</option>
              </>
            )}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedProducts.slice(pageStart, pageEnd).map((product: any) => {
          const stock = stockMap[product.id] ?? null;
          const isOutOfStock = stock !== null && stock <= 0;

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
                </div>
              ) : (
                <div className="aspect-square bg-gray-100 flex items-center justify-center border-b relative" style={{ borderColor: design.colors.border }}>
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
                  className="text-xs mb-2 italic"
                  style={{
                    color: design.colors.secondary,
                    fontFamily: design.fonts.bodyFont,
                  }}
                >
                  From {product.collectionName}
                </p>
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
                    Sold individually
                  </p>
                  {showPrices && (
                    <>
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
                    </>
                  )}
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

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12 flex-wrap">
          <button
            onClick={() => { setPage(currentPage - 1); window.scrollTo({ top: 0 }); }}
            disabled={currentPage === 1}
            className="px-4 py-2 border disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-80"
            style={{
              borderColor: design.colors.border,
              borderRadius: `${design.style.cornerRadius}px`,
              color: design.colors.text,
              fontFamily: design.fonts.bodyFont,
            }}
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => { setPage(n); window.scrollTo({ top: 0 }); }}
              aria-current={n === currentPage ? 'page' : undefined}
              className="px-4 py-2 border hover:opacity-80"
              style={{
                borderColor: n === currentPage ? design.colors.primary : design.colors.border,
                backgroundColor: n === currentPage ? design.colors.primary : 'transparent',
                color: n === currentPage ? '#FFFFFF' : design.colors.text,
                borderRadius: `${design.style.cornerRadius}px`,
                fontFamily: design.fonts.bodyFont,
                fontWeight: n === currentPage ? 600 : 400,
              }}
            >
              {n}
            </button>
          ))}

          <button
            onClick={() => { setPage(currentPage + 1); window.scrollTo({ top: 0 }); }}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-80"
            style={{
              borderColor: design.colors.border,
              borderRadius: `${design.style.cornerRadius}px`,
              color: design.colors.text,
              fontFamily: design.fonts.bodyFont,
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
