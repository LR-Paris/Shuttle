import Link from 'next/link';
import { getDesignData } from '@/lib/design';
import { getAllCollections } from '@/lib/catalog';
import Carousel from '@/components/Carousel';

export default function Home() {
  const design = getDesignData();
  const collections = getAllCollections();

  return (
    <div>
      {/* Showcase Carousel */}
      {design.showcasePhotos.length > 0 && (
        <div className="container mx-auto px-4 pt-8">
          <Carousel
            images={design.showcasePhotos}
            cornerRadius={`${design.styleSettings.cornerRadius}px`}
          />
        </div>
      )}

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4" style={{ color: design.colors.primary }}>
            {design.companyName}
          </h1>
          <p className="text-2xl mb-8" style={{ color: design.colors.textLight }}>
            {design.descriptions.tagline}
          </p>
          <Link
            href="/collections"
            className="inline-block px-8 py-3 text-white rounded-lg text-lg font-semibold hover:opacity-90 transition-opacity"
            style={{ backgroundColor: design.colors.secondary, borderRadius: `${design.styleSettings.cornerRadius}px` }}
          >
            Browse Collections
          </Link>
        </div>

      {/* About Section */}
      <div className="mb-16 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mb-4" style={{ color: design.colors.primary }}>
          About Us
        </h2>
        <p className="text-lg leading-relaxed" style={{ color: design.colors.text }}>
          {design.descriptions.about}
        </p>
      </div>

      {/* Collections Preview */}
      <div>
        <h2 className="text-3xl font-bold mb-8 text-center" style={{ color: design.colors.primary }}>
          Our Collections
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/collections/${collection.id}`}
              className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
              style={{ borderColor: design.colors.border }}
            >
              <h3 className="text-2xl font-bold mb-2" style={{ color: design.colors.primary }}>
                {collection.name}
              </h3>
              <p style={{ color: design.colors.textLight }}>
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
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
