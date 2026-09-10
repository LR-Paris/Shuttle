import type { ReactElement } from 'react';

interface Variant { id: string; values: string[] }
interface ChipProduct {
  variants?: Variant[];
  variantDimensions?: string[];
  variantValues?: string[];
}

// Renders first-dimension variant values (e.g. sizes/colors) as chips beneath a
// product card, matching the collection detail page. Returns null for
// non-variant products. Shared so every listing renders variants identically.
export default function VariantChips({
  product,
  design,
  stockMap = {},
}: {
  product: ChipProduct;
  design: any;
  stockMap?: Record<string, number>;
}): ReactElement | null {
  if (!product.variants || product.variants.length === 0) return null;
  const seen = new Set<string>();
  const uniqueValues = product.variants
    .map((v) => v.values[0])
    .filter((val) => val && !seen.has(val) && !!seen.add(val));

  return (
    <div className="mb-2">
      <p className="text-xs mb-1" style={{ color: design.colors.textLight, fontFamily: design.fonts.bodyFont }}>
        {product.variantDimensions?.[0] ?? 'Options'}:
      </p>
      <div className="flex flex-wrap gap-1">
        {uniqueValues.map((value) => {
          const withValue = product.variants!.filter((v) => v.values[0] === value);
          const allOOS = withValue.length > 0 && withValue.every(
            (v) => stockMap[v.id] !== undefined && stockMap[v.id] <= 0
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
        })}
      </div>
    </div>
  );
}
