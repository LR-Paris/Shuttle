import fs from 'fs';
import path from 'path';
import { getAllProducts } from './catalog';

const DATABASE_PATH = path.join(process.cwd(), 'DATABASE');
const INVENTORY_DIR = path.join(DATABASE_PATH, 'Inventory');
const INVENTORY_CSV = path.join(INVENTORY_DIR, 'inventory.csv');

const CSV_HEADER = 'SKU,Product ID,Product Name,Collection,Stock,Last Updated,Notes';

export interface InventoryRecord {
  sku: string;
  productId: string;
  productName: string;
  collection: string;
  stock: number;
  lastUpdated: string;
  notes: string;
}

function escapeCSVField(field: string): string {
  if (!field) return '';
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        fields.push(current);
        current = '';
      } else {
        current += char;
      }
    }
  }
  fields.push(current);
  return fields;
}

function ensureInventoryCSV(): void {
  if (!fs.existsSync(INVENTORY_DIR)) {
    fs.mkdirSync(INVENTORY_DIR, { recursive: true });
  }
  if (!fs.existsSync(INVENTORY_CSV)) {
    fs.writeFileSync(INVENTORY_CSV, CSV_HEADER + '\n', 'utf-8');
  }
}

function serializeInventory(records: InventoryRecord[]): string {
  const lines = [CSV_HEADER];
  for (const r of records) {
    lines.push([
      escapeCSVField(r.sku),
      escapeCSVField(r.productId),
      escapeCSVField(r.productName),
      escapeCSVField(r.collection),
      String(r.stock),
      escapeCSVField(r.lastUpdated),
      escapeCSVField(r.notes),
    ].join(','));
  }
  return lines.join('\n') + '\n';
}

/**
 * Read and parse the full inventory CSV.
 */
export function getInventory(): InventoryRecord[] {
  ensureInventoryCSV();

  const content = fs.readFileSync(INVENTORY_CSV, 'utf-8');
  const lines = content.split('\n');
  const records: InventoryRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const fields = parseCSVLine(line);
    if (fields.length < 5) continue;

    records.push({
      sku: fields[0] || '',
      productId: fields[1] || '',
      productName: fields[2] || '',
      collection: fields[3] || '',
      stock: parseInt(fields[4] || '0', 10),
      lastUpdated: fields[5] || '',
      notes: fields[6] || '',
    });
  }

  return records;
}

/**
 * Get stock level for a single product by productId.
 * Returns null if product not found in inventory.
 */
export function getStockByProductId(productId: string): number | null {
  const records = getInventory();
  const record = records.find(r => r.productId === productId);
  return record ? record.stock : null;
}

/**
 * Get a map of all productIds to their stock levels.
 * Useful for batch lookups on collection/shop-all pages.
 */
export function getStockMap(): Map<string, number> {
  const records = getInventory();
  const map = new Map<string, number>();
  for (const r of records) {
    map.set(r.productId, r.stock);
  }
  return map;
}

/**
 * Deduct stock for ordered items. Updates Last Updated timestamp.
 * Non-blocking: if a product is not found, it's skipped with a warning.
 * Stock will not go below 0.
 */
export function deductStock(items: { productId: string; quantity: number }[]): void {
  const records = getInventory();
  const now = new Date().toISOString();

  for (const item of items) {
    const record = records.find(r => r.productId === item.productId);
    if (!record) {
      console.warn(`Inventory: product ${item.productId} not found, skipping deduction`);
      continue;
    }
    record.stock = Math.max(0, record.stock - item.quantity);
    record.lastUpdated = now;
  }

  fs.writeFileSync(INVENTORY_CSV, serializeInventory(records), 'utf-8');
}

/**
 * Seed inventory CSV from the product catalog.
 * Only adds products that are not already in the inventory.
 * Existing rows are preserved.
 */
export function seedInventory(): void {
  ensureInventoryCSV();

  const existingRecords = getInventory();
  const existingIds = new Set(existingRecords.map(r => r.productId));
  const allProducts = getAllProducts();
  const now = new Date().toISOString();

  let added = 0;
  for (const product of allProducts) {
    if (existingIds.has(product.id)) continue;

    existingRecords.push({
      sku: product.sku,
      productId: product.id,
      productName: product.name,
      collection: product.collectionName,
      stock: 0,
      lastUpdated: now,
      notes: '',
    });
    added++;
  }

  if (added > 0) {
    fs.writeFileSync(INVENTORY_CSV, serializeInventory(existingRecords), 'utf-8');
  }
}
