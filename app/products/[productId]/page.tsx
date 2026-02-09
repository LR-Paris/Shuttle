'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { addToCart } from '@/lib/cart';

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
    // Fetch product and design data
    Promise.all([
      fetch(`/api/products/${productId}`).then(r => r.json()),
      fetch('/api/design').then(r => r.json()),
    ])
      .then(([productData, designData]) => {
        setProduct(productData);
        setDesign(designData);
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
    addToCart(
      product.id,
      product.name,
      product.sku,
      product.boxCost,
      product.unitsPerBox,
      quantity
    );

    // Dispatch custom event for cart update
    window.dispatchEvent(new Event('cartUpdated'));

    setShowSuccess(true);
    setIsAdding(false);

    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  if (!product || !design) {
    return (
      <div className="container mx-auto px-4 py-12">
        <p>Loading...</p>
      </div>
    );
  }

  const totalPrice = product.boxCost * quantity;

  return (
    <div className="container mx-auto px-4 py-12">
      <Link
        href={fromShopAll ? '/shop-all' : `/collections/${product.collectionId}`}
        className="inline-flex items-center mb-6 hover:opacity-80"
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
        {fromShopAll ? 'Back to Shop All' : `Back to ${product.collectionName}`}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div>
          {product.images.length > 0 ? (
            <>
              <div className="aspect-square bg-white rounded-lg overflow-hidden mb-4">
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
                      className="aspect-square bg-white rounded-lg overflow-hidden border-2 hover:opacity-80"
                      style={{
                        borderColor: index === selectedImage ? design.colors.secondary : design.colors.border,
                      }}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-contain p-1"
                      />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-24 w-24 text-gray-300"
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
        </div>

        {/* Product Details */}
        <div>
          <h1 className="text-4xl font-bold mb-4" style={{ color: design.colors.primary }}>
            {product.name}
          </h1>

          <p className="text-lg mb-6" style={{ color: design.colors.text }}>
            {product.description}
          </p>

          <div className="border-t border-b py-4 mb-6" style={{ borderColor: design.colors.border }}>
            <p className="text-sm mb-2" style={{ color: design.colors.textLight }}>
              SKU: {product.sku}
            </p>
            <p className="text-lg font-semibold mb-2" style={{ color: design.colors.text }}>
              Box of {product.unitsPerBox} units
            </p>
            <p className="text-4xl font-bold mb-1" style={{ color: design.colors.secondary }}>
              ${product.boxCost.toFixed(2)}
            </p>
            <p style={{ color: design.colors.textLight }}>
              ${product.itemCost.toFixed(2)} per unit
            </p>
          </div>

          {/* Quantity Selector */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2" style={{ color: design.colors.text }}>
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
            <p className="text-sm" style={{ color: design.colors.textLight }}>
              Total ({quantity} {quantity === 1 ? 'box' : 'boxes'}):
            </p>
            <p className="text-3xl font-bold" style={{ color: design.colors.primary }}>
              ${totalPrice.toFixed(2)}
            </p>
            <p className="text-sm" style={{ color: design.colors.textLight }}>
              {quantity * product.unitsPerBox} total units
            </p>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="w-full py-4 rounded-lg text-white text-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            style={{ backgroundColor: design.colors.secondary }}
          >
            {isAdding ? 'Adding...' : 'Add to Cart'}
          </button>

          {/* Success Message */}
          {showSuccess && (
            <div
              className="mt-4 p-4 rounded-lg text-white"
              style={{ backgroundColor: design.colors.success }}
            >
              Added to cart successfully!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
