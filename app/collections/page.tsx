'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CollectionCard from './CollectionCard';

export default function CollectionsPage() {
  const [design, setDesign] = useState<any>(null);
  const [collections, setCollections] = useState<any[]>([]);
  const [tick, setTick] = useState(0);
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      const [designResponse, collectionsResponse] = await Promise.all([
        fetch('/api/design'),
        fetch('/api/collections')
      ]);

      const designData = await designResponse.json();
      const collectionsData = await collectionsResponse.json();

      // Redirect to shop-all if only one collection
      if (collectionsData.length <= 1) {
        router.replace('/shop-all');
        return;
      }

      setDesign(designData);
      setCollections(collectionsData);
      document.title = `${designData.companyName} - Collections`;
    }
    loadData();
  }, [router]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 3000);

    return () => clearInterval(interval);
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
            tick={tick}
          />
        ))}
      </div>
    </div>
  );
}
