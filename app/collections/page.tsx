import Link from 'next/link';
import { getDesignData } from '@/lib/design';
import { getAllCollections } from '@/lib/catalog';

export default function CollectionsPage() {
  const design = getDesignData();
  const collections = getAllCollections();

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8" style={{ color: design.colors.primary, fontFamily: design.fonts.titleFont }}>
        All Collections
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {collections.map((collection) => (
          <Link
            key={collection.id}
            href={`/collections/${collection.id}`}
            className="border p-6 hover:shadow-lg transition-shadow"
            style={{ borderColor: design.colors.border, borderRadius: `${design.style.cornerRadius}px` }}
          >
            <h2 className="text-2xl font-bold mb-2" style={{ color: design.colors.primary, fontFamily: design.fonts.titleFont }}>
              {collection.name}
            </h2>
            <p className="mb-4" style={{ color: design.colors.textLight, fontFamily: design.fonts.bodyFont }}>
              {collection.products.length} {collection.products.length === 1 ? 'product' : 'products'}
            </p>
            <div className="mt-4">
              <span
                className="text-sm font-semibold"
                style={{ color: design.colors.secondary, fontFamily: design.fonts.bodyFont }}
              >
                View Collection →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
