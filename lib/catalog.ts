import fs from 'fs';
import path from 'path';

const DATABASE_PATH = path.join(process.cwd(), 'DATABASE');
const COLLECTIONS_PATH = path.join(DATABASE_PATH, 'ShopCollections');

export interface ProductVariant {
  id: string;
  name: string;
  values: string[];  // e.g., ["Black"] or ["Camel", "Small"]
}

export interface Product {
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
  // Variant fields — only populated when 2+ siblings share the same base name
  variantGroup?: string;         // Base name, e.g., "Dopp Kit"
  variantDimensions?: string[];  // Labels from VariantType.txt, e.g., ["Color", "Size"]
  variantValues?: string[];      // This product's values, e.g., ["Black"]
  variants?: ProductVariant[];   // All variants in the group (sorted alphabetically)
}

export interface Collection {
  id: string;
  name: string;
  products: Product[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function readDetailsFile(detailsPath: string, filename: string): string {
  try {
    const filePath = path.join(detailsPath, filename);
    return fs.readFileSync(filePath, 'utf-8').trim();
  } catch (error) {
    return '';
  }
}

function getProductImages(photosPath: string, productId: string): string[] {
  try {
    if (!fs.existsSync(photosPath)) return [];

    const files = fs.readdirSync(photosPath);
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
    });

    return imageFiles.map(file => `/api/images/products/${productId}/${file}`);
  } catch (error) {
    return [];
  }
}

/**
 * Parse folder name into base name + variant values.
 *
 * "Dopp Kit (Black)"         -> { baseName: "Dopp Kit", values: ["Black"] }
 * "Dopp Kit (Camel, Small)"  -> { baseName: "Dopp Kit", values: ["Camel", "Small"] }
 * "Atomizer"                 -> { baseName: "Atomizer", values: [] }
 */
function parseVariantInfo(folderName: string): { baseName: string; values: string[] } {
  const match = folderName.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
  if (!match) {
    return { baseName: folderName, values: [] };
  }
  return {
    baseName: match[1].trim(),
    values: match[2].split(',').map(v => v.trim()).filter(Boolean),
  };
}

function parseProduct(
  collectionName: string,
  collectionId: string,
  itemName: string,
  itemPath: string
): Product | null {
  try {
    const detailsPath = path.join(itemPath, 'Details');
    const photosPath = path.join(itemPath, 'Photos');

    if (!fs.existsSync(detailsPath)) {
      return null;
    }

    const name = readDetailsFile(detailsPath, 'Name.txt');
    const description = readDetailsFile(detailsPath, 'Description.txt');
    const sku = readDetailsFile(detailsPath, 'SKU.txt');
    const itemCost = parseFloat(readDetailsFile(detailsPath, 'ItemCost.txt') || '0');
    const boxCost = parseFloat(readDetailsFile(detailsPath, 'BoxCost.txt') || '0');
    const unitsPerBox = parseInt(readDetailsFile(detailsPath, 'UnitsPerBox.txt') || '1', 10);

    if (!name || !sku) {
      return null;
    }

    const productId = `${collectionId}-${slugify(itemName)}`;
    const images = getProductImages(photosPath, productId);

    return {
      id: productId,
      name,
      description,
      sku,
      itemCost,
      boxCost,
      unitsPerBox,
      images,
      collectionId,
      collectionName,
    };
  } catch (error) {
    console.error(`Error parsing product ${itemName}:`, error);
    return null;
  }
}

function parseCollection(collectionName: string, collectionPath: string): Collection | null {
  try {
    const items = fs.readdirSync(collectionPath, { withFileTypes: true });
    const collectionId = slugify(collectionName);

    // Parse all products, keeping folder names for variant detection
    const productEntries: Array<{ folderName: string; product: Product }> = [];

    for (const item of items) {
      if (!item.isDirectory()) continue;

      const itemPath = path.join(collectionPath, item.name);
      const product = parseProduct(collectionName, collectionId, item.name, itemPath);

      if (product) {
        productEntries.push({ folderName: item.name, product });
      }
    }

    if (productEntries.length === 0) {
      return null;
    }

    // Group by base name — only products with parenthetical values qualify
    const groups = new Map<string, Array<{ folderName: string; product: Product }>>();

    for (const entry of productEntries) {
      const { baseName, values } = parseVariantInfo(entry.folderName);
      if (values.length > 0) {
        if (!groups.has(baseName)) groups.set(baseName, []);
        groups.get(baseName)!.push(entry);
      }
    }

    // Assign variant data to groups with 2+ members
    for (const [baseName, entries] of groups.entries()) {
      if (entries.length < 2) continue;

      // Read dimension labels from VariantType.txt (first file found wins)
      let dimensions: string[] = [];
      for (const entry of entries) {
        const vtPath = path.join(collectionPath, entry.folderName, 'Details', 'VariantType.txt');
        if (fs.existsSync(vtPath)) {
          const content = fs.readFileSync(vtPath, 'utf-8').trim();
          dimensions = content.split(',').map(d => d.trim()).filter(Boolean);
          break;
        }
      }

      // Auto-generate labels if VariantType.txt not present
      if (dimensions.length === 0) {
        const valueCount = parseVariantInfo(entries[0].folderName).values.length;
        dimensions = valueCount === 1
          ? ['Color']
          : valueCount === 2
            ? ['Color', 'Size']
            : Array.from({ length: valueCount }, (_, i) => `Option ${i + 1}`);
      }

      // Build sorted variant summaries
      const variantSummaries: ProductVariant[] = entries
        .map(entry => ({
          id: entry.product.id,
          name: entry.product.name,
          values: parseVariantInfo(entry.folderName).values,
        }))
        .sort((a, b) => a.values.join(', ').localeCompare(b.values.join(', ')));

      // Stamp each product in the group
      for (const entry of entries) {
        const values = parseVariantInfo(entry.folderName).values;
        entry.product.variantGroup = baseName;
        entry.product.variantDimensions = dimensions;
        entry.product.variantValues = values;
        entry.product.variants = variantSummaries;
      }
    }

    return {
      id: collectionId,
      name: collectionName,
      products: productEntries.map(e => e.product),
    };
  } catch (error) {
    console.error(`Error parsing collection ${collectionName}:`, error);
    return null;
  }
}

export function getAllCollections(): Collection[] {
  try {
    if (!fs.existsSync(COLLECTIONS_PATH)) {
      return [];
    }

    const collectionFolders = fs.readdirSync(COLLECTIONS_PATH, { withFileTypes: true });
    const collections: Collection[] = [];

    for (const folder of collectionFolders) {
      if (!folder.isDirectory()) continue;

      const collectionPath = path.join(COLLECTIONS_PATH, folder.name);
      const collection = parseCollection(folder.name, collectionPath);

      if (collection) {
        collections.push(collection);
      }
    }

    return collections;
  } catch (error) {
    console.error('Error reading collections:', error);
    return [];
  }
}

export function getCollection(collectionId: string): Collection | null {
  const collections = getAllCollections();
  return collections.find(c => c.id === collectionId) || null;
}

export function getProduct(productId: string): Product | null {
  const collections = getAllCollections();

  for (const collection of collections) {
    const product = collection.products.find(p => p.id === productId);
    if (product) {
      return product;
    }
  }

  return null;
}

export function getAllProducts(): Product[] {
  const collections = getAllCollections();
  return collections.flatMap(c => c.products);
}
