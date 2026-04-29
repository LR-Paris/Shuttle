'use client';

import { apiFetch } from '@/lib/api';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { addToCart } from '@/lib/cart';

interface ProductVariant {
  id: string;
  name: string;
  values: string[];
}

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
  variantGroup?: string;
  variantDimensions?: string[];
  variantValues?: string[];
  variants?: ProductVariant[];
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
  fonts: {
    titleFont: string;
    bodyFont: string;
  };
  style: {
    cornerRadius: number;
  };
  companyName: string;
  descriptions: {
    tagline: string;
    about: string;
    footer: string;
  };
}

export default function ProductPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromShopAll = searchParams.get('from') === 'shop-all';
  const [product, setProduct] = useState<Product | null>(null);
  const [design, setDesign] = useState<DesignData | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    Promise.all([
      apiFetch(`/products/${productId}`).then(r => r.json()),
      apiFetch('/design').then(r => r.json()),
    ])
      .then(([productData, designData]) => {
        setProduct(productData);
        setDesign(designData);
        setSelectedImage(0); // reset image when product changes
        if (productData && designData) {
          document.title = `${designData.companyName} - ${productData.name}`;
        }
      })
      .catch(error => {
        console.error('Error loading product:', error);
      });
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;
    setIsAdding(true);
    addToCart(product.id, product.name, product.sku, product.boxCost, product.unitsPerBox, quantity);
    window.dispatchEvent(new Event('cartUpdated'));
    setShowSuccess(true);
    setIsAdding(false);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  /**
   * Navigate to the variant that matches the given selection for a specific dimension.
   * For a 2D variant (Color, Size):
   *   - Changing Color: find variant with new color + current size (fall back to first with new color)
   *   - Changing Size: find variant with current color + new size (fall back to first with new size)
   */
  const handleVariantSelect = (dimensionIndex: number, newValue: string) => {
    if (!product?.variants || !product.variantValues) return;

    const currentValues = product.variantValues;

    // Build the target values array: same as current except for the changed dimension
    const targetValues = [...currentValues];
    targetValues[dimensionIndex] = newValue;

    // Find exact match first
    let target = product.variants.find(v =>
      v.values.every((val, i) => val === targetValues[i])
    );

    // Fall back to any variant with the new value at the changed dimension
    if (!target) {
      target = product.variants.find(v => v.values[dimensionIndex] === newValue);
    }

    if (target && target.id !== product.id) {
      router.push(`/products/${target.id}`);
    }
  };

  if (!product || !design) {
    return <div className="container mx-auto px-4 py-12"><p>Loading...</p></div>;
  }

  const totalPrice = product.boxCost * quantity;
  const cornerRadius = design.style?.cornerRadius ?? 8;
  const hasVariants = product.variants && product.variants.length > 1 && product.variantDimensions && product.variantValues;

  // For 2-level selector: build unique values per dimension, and for dim[1] filter by current dim[0] selection
  const getDimensionValues = (dimIndex: number): string[] => {
    if (!product.variants || !product.variantValues) return [];

    if (dimIndex === 0) {
      // All unique values for first dimension
      const seen = new Set<string>();
      return product.variants
        .map(v => v.values[0])
        .filter(v => v && !seen.has(v) && seen.add(v) as unknown as boolean);
    } else {
      // For second dimension: only values available for the currently-selected first dimension value
      const currentDim0 = product.variantValues[0];
      const seen = new Set<string>();
      return product.variants
        .filter(v => v.values[0] === currentDim0)
        .map(v => v.values[dimIndex])
        .filter(v => v && !seen.has(v) && seen.add(v) as unknown as boolean);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <Link
        href={fromShopAll ? '/shop-all' : `/collections/${product.collectionId}`}
        className="inline-flex items-center mb-6 hover:opacity-80"
        style={{ color: design.colors.secondary }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {fromShopAll ? 'Back to Shop All' : `Back to ${product.collectionName}`}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div>
          {product.images.length > 0 ? (
            <>
              <div
                className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4 border"
                style={{ borderColor: design.colors.border }}
              >
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-contain p-4"
                />
              </div>
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 hover:opacity-80"
                      style={{ borderColor: index === selectedImage ? design.colors.secondary : design.colors.border }}
                    >
                      <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-full object-contain p-1" />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div>
          {/* Product name — show base name for variants, full name for standalone */}
          <h1 className="text-4xl font-bold mb-4" style={{ color: design.colors.primary, fontFamily: design.fonts.titleFont }}>
            {product.variantGroup || product.name}
          </h1>

          {/* 2-Level Variant Selector */}
          {hasVariants && (
            <div className="mb-6 space-y-4">
              {product.variantDimensions!.map((dimLabel, dimIndex) => {
                const values = getDimensionValues(dimIndex);
                const currentValue = product.variantValues![dimIndex];

                return (
                  <div key={dimLabel}>
                    <p className="text-sm font-semibold mb-2" style={{ color: design.colors.text, fontFamily: design.fonts.bodyFont }}>
                      {dimLabel}:{' '}
                      <span style={{ color: design.colors.secondary }}>{currentValue}</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {values.map(value => {
                        const isSelected = value === currentValue;
                        return (
                          <button
                            key={value}
                            onClick={() => handleVariantSelect(dimIndex, value)}
                            className="px-4 py-1.5 text-sm border transition-colors rounded-full"
                            style={{
                              borderRadius: `${cornerRadius}px`,
                              backgroundColor: isSelected ? design.colors.secondary : 'transparent',
                              borderColor: isSelected ? design.colors.secondary : design.colors.border,
                              color: isSelected ? '#ffffff' : design.colors.text,
                              fontFamily: design.fonts.bodyFont,
                              cursor: isSelected ? 'default' : 'pointer',
                            }}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <p className="text-lg mb-6 whitespace-pre-line" style={{ color: design.colors.text, fontFamily: design.fonts.bodyFont }}>
            {product.description}
          </p>

          <div className="border-t border-b py-4 mb-6" style={{ borderColor: design.colors.border }}>
            <p className="text-sm mb-2" style={{ color: design.colors.textLight, fontFamily: design.fonts.bodyFont }}>
              SKU: {product.sku}
            </p>
            <p className="text-lg font-semibold mb-2" style={{ color: design.colors.text, fontFamily: design.fonts.bodyFont }}>
              Box of {product.unitsPerBox} units
            </p>
            <p className="text-4xl font-bold mb-1" style={{ color: design.colors.secondary, fontFamily: design.fonts.titleFont }}>
              ${product.boxCost.toFixed(2)}
            </p>
            <p style={{ color: design.colors.textLight, fontFamily: design.fonts.bodyFont }}>
              ${product.itemCost.toFixed(2)} per unit
            </p>
            <p className="text-xs mt-2 italic" style={{ color: design.colors.textLight, fontFamily: design.fonts.bodyFont }}>
              Pricing does not include shipping and taxes
            </p>
          </div>

          {/* Quantity Selector */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2" style={{ color: design.colors.text, fontFamily: design.fonts.bodyFont }}>
              Quantity (boxes):
            </label>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 border rounded-lg flex items-center justify-center hover:bg-gray-100"
                style={{ borderColor: design.colors.border }}
              >
                -
              </button>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 h-10 border rounded-lg text-center"
                style={{ borderColor: design.colors.border }}
              />
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 border rounded-lg flex items-center justify-center hover:bg-gray-100"
                style={{ borderColor: design.colors.border }}
              >
                +
              </button>
            </div>
          </div>

          {/* Total */}
          <div className="mb-6">
            <p className="text-sm" style={{ color: design.colors.textLight, fontFamily: design.fonts.bodyFont }}>
              Total ({quantity} {quantity === 1 ? 'box' : 'boxes'}):
            </p>
            <p className="text-3xl font-bold" style={{ color: design.colors.primary, fontFamily: design.fonts.titleFont }}>
              ${totalPrice.toFixed(2)}
            </p>
            <p className="text-sm" style={{ color: design.colors.textLight, fontFamily: design.fonts.bodyFont }}>
              {quantity * product.unitsPerBox} total units
            </p>
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="w-full py-4 rounded-lg text-white text-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            style={{ backgroundColor: design.colors.secondary, borderRadius: `${cornerRadius}px` }}
          >
            {isAdding ? 'Adding...' : 'Add to Cart'}
          </button>

          {showSuccess && (
            <div className="mt-4 p-4 rounded-lg text-white" style={{ backgroundColor: design.colors.success }}>
              Added to cart successfully!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
