import fs from 'fs';
import path from 'path';

const DATABASE_PATH = path.join(process.cwd(), 'DATABASE');
const PRESETS_PATH = path.join(DATABASE_PATH, 'Presets');
const DESIGN_PATH = path.join(DATABASE_PATH, 'Design');

export type ShopType = 'free' | 'po' | 'stripe';

export interface DataRequired {
  address: boolean;
  details: boolean;
  extra_notes: boolean;
  shipping_handler: boolean;
  hotel_list: boolean;
}

export interface PresetsData {
  shopType: ShopType;
  dataRequired: DataRequired;
  hotelList: string[];
}

function parseKeyValueFile(content: string): Record<string, string> {
  const result: Record<string, string> = {};
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) continue;

    const colonIndex = trimmedLine.indexOf(':');
    if (colonIndex === -1) continue;

    const key = trimmedLine.substring(0, colonIndex).trim();
    const value = trimmedLine.substring(colonIndex + 1).trim();
    result[key] = value;
  }

  return result;
}

/**
 * Get the shop type from DATABASE/Presets/ShopType.txt
 * Defaults to 'free' if the Presets folder or file doesn't exist.
 */
export function getShopType(): ShopType {
  try {
    const shopTypePath = path.join(PRESETS_PATH, 'ShopType.txt');
    if (!fs.existsSync(PRESETS_PATH) || !fs.existsSync(shopTypePath)) {
      return 'free';
    }
    const content = fs.readFileSync(shopTypePath, 'utf-8');
    const parsed = parseKeyValueFile(content);
    const type = (parsed.type || 'free').toLowerCase();

    if (type === 'po' || type === 'stripe' || type === 'free') {
      return type;
    }
    return 'free';
  } catch (error) {
    console.error('Error reading shop type:', error);
    return 'free';
  }
}

/**
 * Get data required toggles from DATABASE/Presets/DataRequired.txt
 * Defaults to all true (except hotel_list) if the Presets folder or file doesn't exist.
 */
export function getDataRequired(): DataRequired {
  const defaults: DataRequired = {
    address: true,
    details: true,
    extra_notes: true,
    shipping_handler: true,
    hotel_list: false,
  };

  try {
    const dataRequiredPath = path.join(PRESETS_PATH, 'DataRequired.txt');
    if (!fs.existsSync(PRESETS_PATH) || !fs.existsSync(dataRequiredPath)) {
      return defaults;
    }
    const content = fs.readFileSync(dataRequiredPath, 'utf-8');
    const parsed = parseKeyValueFile(content);

    return {
      address: parsed.address !== 'false',
      details: parsed.details !== 'false',
      extra_notes: parsed.extra_notes !== 'false',
      shipping_handler: parsed.shipping_handler !== 'false',
      hotel_list: parsed.hotel_list === 'true',
    };
  } catch (error) {
    console.error('Error reading data required:', error);
    return defaults;
  }
}

/**
 * Get hotel list from DATABASE/Design/Details/Hotels.txt
 * Returns empty array if file doesn't exist or has no entries.
 */
export function getHotelList(): string[] {
  try {
    const hotelsPath = path.join(DESIGN_PATH, 'Details', 'Hotels.txt');
    if (!fs.existsSync(hotelsPath)) {
      return [];
    }
    const content = fs.readFileSync(hotelsPath, 'utf-8');
    const hotels: string[] = [];

    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      hotels.push(trimmed);
    }

    return hotels;
  } catch (error) {
    console.error('Error reading hotel list:', error);
    return [];
  }
}

/**
 * Get all presets data combined.
 */
export function getPresetsData(): PresetsData {
  return {
    shopType: getShopType(),
    dataRequired: getDataRequired(),
    hotelList: getHotelList(),
  };
}
