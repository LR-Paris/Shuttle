import fs from 'fs';
import path from 'path';

const DATABASE_PATH = path.join(process.cwd(), 'DATABASE');
const COLLECTIONS_PATH = path.join(DATABASE_PATH, 'ShopCollections');

export interface ProductDetails {
  itemSize?: string;
  boxSize?: string;
  weight?: string;
  material?: string;
  capacity?: string;
  pages?: string;
  [key: string]: string | undefined;
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
  details?: ProductDetails;
}

export interface Collection {
  id: string;
  name: string;
  products: Product[];
  showcasePhoto?: string;
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

    // Sort images so main.* comes first
    imageFiles.sort((a, b) => {
      if (a.startsWith('main.')) return -1;
      if (b.startsWith('main.')) return 1;
      return a.localeCompare(b);
    });

    return imageFiles.map(file => `/api/images/products/${productId}/${file}`);
  } catch (error) {
    return [];
  }
}

function parseProductDetails(detailsPath: string): ProductDetails | undefined {
  try {
    const detailsFilePath = path.join(detailsPath, 'Details.txt');
    if (!fs.existsSync(detailsFilePath)) {
      return undefined;
    }

    const content = fs.readFileSync(detailsFilePath, 'utf-8');
    const details: ProductDetails = {};
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith('#')) continue;

      const colonIndex = trimmedLine.indexOf(':');
      if (colonIndex === -1) continue;

      const key = trimmedLine.substring(0, colonIndex).trim();
      const value = trimmedLine.substring(colonIndex + 1).trim();
      details[key] = value;
    }

    return Object.keys(details).length > 0 ? details : undefined;
  } catch (error) {
    return undefined;
  }
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
    const details = parseProductDetails(detailsPath);

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
      details,
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
    const products: Product[] = [];

    for (const item of items) {
      if (!item.isDirectory()) continue;

      const itemPath = path.join(collectionPath, item.name);
      const product = parseProduct(collectionName, collectionId, item.name, itemPath);

      if (product) {
        products.push(product);
      }
    }

    if (products.length === 0) {
      return null;
    }

    // Check for collection-specific showcase photo
    let showcasePhoto: string | undefined;
    try {
      const showcaseDir = path.join(DATABASE_PATH, 'Design', 'ShowcasePhotos', 'Collections');
      if (fs.existsSync(showcaseDir)) {
        const files = fs.readdirSync(showcaseDir);
        const matchingFile = files.find(file => {
          const nameWithoutExt = file.replace(/\.[^/.]+$/, '');
          return nameWithoutExt === collectionId;
        });
        if (matchingFile) {
          showcasePhoto = `/api/images/showcase/Collections/${matchingFile}`;
        }
      }
    } catch (error) {
      // Showcase photo is optional
    }

    return {
      id: collectionId,
      name: collectionName,
      products,
      showcasePhoto,
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
