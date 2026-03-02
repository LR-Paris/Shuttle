# Shuttle — Claude Code Launchpad

## Project Overview

Shuttle is a file-based B2B e-commerce storefront built with Next.js 15, TypeScript, and Tailwind CSS. All data lives in a `DATABASE/` folder — no external database. Current version: **STS-2.04**.

## Architecture Quick Reference

- **Products**: `DATABASE/ShopCollections/[Collection]/[Product]/Details/` (Name.txt, SKU.txt, etc.)
- **Orders**: `DATABASE/Orders/orders.csv` — CSV with 18 columns
- **Inventory**: `DATABASE/Inventory/inventory.csv` — CSV with 7 columns (SKU, Product ID, Product Name, Collection, Stock, Last Updated, Notes)
- **Design/Branding**: `DATABASE/Design/Details/` — Colors, fonts, company name
- **Presets**: `DATABASE/Presets/` — Shop type (free/po/stripe), data toggles

Key libraries: `lib/catalog.ts`, `lib/inventory.ts`, `lib/cart.ts`, `lib/design.ts`, `lib/presets.ts`, `lib/version.ts`

## Important: SKUs Are NOT Unique

Multiple products share the same SKU (e.g. `7117190000` is shared by 4 products). Always use `productId` (from `lib/catalog.ts`) as the unique identifier, not SKU.

---

## Next Task: Admin Inventory Management Page

### Goal

Build an admin inventory management page at `/inventory` (accessible by direct URL, not in main nav) that allows viewing and editing stock levels through the browser instead of manually editing the CSV file.

### What Already Exists

- `lib/inventory.ts` — Core inventory library with `getInventory()`, `getStockByProductId()`, `getStockMap()`, `deductStock()`, `seedInventory()`
- `app/api/inventory/route.ts` — GET (list all / by productId) and POST (seed from catalog)
- `DATABASE/Inventory/inventory.csv` — Seeded with all 15 products, stock starts at 0
- Stock badges already show on product cards (collection, shop-all pages)
- Stock display + add-to-cart gating on product detail pages

### What Needs to Be Built

#### 1. New API Endpoints

**`app/api/inventory/[productId]/route.ts`** — PATCH for single product update:
```
PATCH /api/inventory/{productId}
Body: { stock?: number, notes?: string }
Response: { success: true, item: InventoryRecord }
```

**`app/api/inventory/bulk/route.ts`** — PATCH for bulk update:
```
PATCH /api/inventory/bulk
Body: { updates: [{ productId: string, stock: number, notes?: string }] }
Response: { success: true, items: InventoryRecord[] }
```

You'll need to add `updateInventoryItem()` and `bulkUpdateInventory()` functions to `lib/inventory.ts`.

#### 2. Admin Inventory Page — `app/inventory/page.tsx`

A `'use client'` page following the exact same patterns as `app/checkout/page.tsx`:
- Fetch design data from `/api/design` for theming
- Fetch inventory data from `/api/inventory`
- All styles use inline `style={{ }}` with `design.colors.*`, `design.fonts.*`, `design.style.cornerRadius`

**UI Layout:**
```
+------------------------------------------------------------------+
|  Inventory Management                          [Seed from Catalog]|
+------------------------------------------------------------------+
|  Summary: 15 products | 10 In Stock | 3 Low Stock | 2 Out of Stock|
+------------------------------------------------------------------+
|  Filter: [All Collections v]     Search: [____________]           |
+------------------------------------------------------------------+
|  Product    | Collection | SKU        | Stock | Status | Notes    |
|------------|------------|------------|-------|--------|----------|
|  Mini Metal | Diwali     | 7117190000 | [50]  | In Stock | [   ]  |
|  Oil Lamp   | Diwali     | 7117190000 | [ 0]  | Out of.. | [   ]  |
+------------------------------------------------------------------+
|  [Save Changes]    Unsaved changes: 3                            |
+------------------------------------------------------------------+
```

**Key behaviors:**
- Inline editing of Stock (number input) and Notes (text input)
- Status is auto-calculated: stock > 5 = "In Stock", 1-5 = "Low Stock", 0 = "Out of Stock"
- Track dirty/edited rows with visual indicator (highlight background)
- "Save Changes" button sends all dirty rows via PATCH to `/api/inventory/bulk`
- "Seed from Catalog" button POSTs to `/api/inventory` with `{ action: 'seed' }` (adds new products from catalog that aren't in inventory yet)
- Collection filter dropdown (client-side filter)
- Search by product name or SKU (client-side filter)
- Responsive: table on desktop, card layout on mobile

**Status badge styling** (matches existing pattern in collection/shop-all pages):
- In Stock: `backgroundColor: design.colors.success`, white text
- Low Stock: `backgroundColor: design.colors.secondary`, white text
- Out of Stock: `backgroundColor: '#DC2626'`, white text

#### 3. Version Bump

Bump to `STS-2.05` in `lib/version.ts` with entry: "Admin inventory management page"

### Patterns to Follow

- **Checkout page** (`app/checkout/page.tsx`) — best reference for form inputs, design system usage, responsive layout
- **Collection page** (`app/collections/[collectionId]/page.tsx`) — reference for table/grid layouts with dynamic data
- **Orders API** (`app/api/orders/route.ts`) — reference for CSV escaping pattern (`escapeCSVField`)
- **Inventory API** (`app/api/inventory/route.ts`) — existing endpoint to extend

### Testing

1. Visit `/inventory` — should load all 15 products with their current stock levels
2. Edit stock values inline, verify dirty indicator appears
3. Click "Save Changes", verify CSV is updated
4. Filter by collection, search by name/SKU — verify client-side filtering works
5. Click "Seed from Catalog" — verify new products (if any added to ShopCollections) get added
6. `npm run build` passes with no errors
