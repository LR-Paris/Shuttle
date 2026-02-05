'use client';

import { useEffect, useState } from 'react';
import CollectionCard from './CollectionCard';

export default function CollectionsPage() {
  const [design, setDesign] = useState<any>(null);
  const [collections, setCollections] = useState<any[]>([]);

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
    }
    loadData();
  }, []);

  if (!design) {
    return <div className="container mx-auto px-4 py-12">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1
        className="text-4xl font-bold mb-8"
        style={{
          color: design.colors.primary,
          fontFamily: design.fonts.titleFont,
        }}
      >
        All Collections
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {collections.map((collection) => (
          <CollectionCard
            key={collection.id}
            collection={collection}
            design={design}
          />
        ))}
      </div>
    </div>
  );
}
