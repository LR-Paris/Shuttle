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
  // STS-4.1.0 request-shop fields
  billing_address: boolean;
  in_hand_date: boolean;
  estimated_budget: boolean;
  po_number: boolean;
  brand_list: boolean;
  art_link: boolean;
}

export interface Display {
  /** When false, every price, per-unit figure and total is hidden site-wide. */
  show_prices: boolean;
  /** When true, cart and checkout copy reads "request" instead of "order". */
  request_language: boolean;
}

export interface PresetsData {
  shopType: ShopType;
  dataRequired: DataRequired;
  hotelList: string[];
  brandList: string[];
  display: Display;
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
 * Read a newline-delimited list file, skipping blanks and # comments.
 */
function readListFile(filePath: string): string[] {
  try {
    if (!fs.existsSync(filePath)) return [];
    const content = fs.readFileSync(filePath, 'utf-8');
    const out: string[] = [];
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      out.push(trimmed);
    }
    return out;
  } catch (error) {
    console.error(`Error reading list file ${filePath}:`, error);
    return [];
  }
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
 *
 * The five original toggles default to true (except hotel_list) so older
 * DATABASE folders keep behaving exactly as before. The STS-4.1.0 request
 * fields default to FALSE for the same reason: a shop that predates them
 * must not sprout new checkout fields on upgrade.
 */
export function getDataRequired(): DataRequired {
  const defaults: DataRequired = {
    address: true,
    details: true,
    extra_notes: true,
    shipping_handler: true,
    hotel_list: false,
    billing_address: false,
    in_hand_date: false,
    estimated_budget: false,
    po_number: false,
    brand_list: false,
    art_link: false,
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
      billing_address: parsed.billing_address === 'true',
      in_hand_date: parsed.in_hand_date === 'true',
      estimated_budget: parsed.estimated_budget === 'true',
      po_number: parsed.po_number === 'true',
      brand_list: parsed.brand_list === 'true',
      art_link: parsed.art_link === 'true',
    };
  } catch (error) {
    console.error('Error reading data required:', error);
    return defaults;
  }
}

/**
 * Get display toggles from DATABASE/Presets/Display.txt
 *
 * Defaults keep the pre-STS-4.1.0 behavior: prices visible, order language.
 */
export function getDisplay(): Display {
  const defaults: Display = {
    show_prices: true,
    request_language: false,
  };

  try {
    const displayPath = path.join(PRESETS_PATH, 'Display.txt');
    if (!fs.existsSync(PRESETS_PATH) || !fs.existsSync(displayPath)) {
      return defaults;
    }
    const content = fs.readFileSync(displayPath, 'utf-8');
    const parsed = parseKeyValueFile(content);

    return {
      show_prices: parsed.show_prices !== 'false',
      request_language: parsed.request_language === 'true',
    };
  } catch (error) {
    console.error('Error reading display presets:', error);
    return defaults;
  }
}

/**
 * Get hotel list from DATABASE/Design/Details/Hotels.txt
 * Returns empty array if file doesn't exist or has no entries.
 */
export function getHotelList(): string[] {
  return readListFile(path.join(DESIGN_PATH, 'Details', 'Hotels.txt'));
}

/**
 * Get brand list from DATABASE/Design/Details/Brands.txt
 *
 * Populates the "which brand are you from" dropdown at checkout when
 * brand_list is enabled. If the file is empty the checkout falls back to a
 * free-text input, so an unpopulated list never blocks a submission.
 */
export function getBrandList(): string[] {
  return readListFile(path.join(DESIGN_PATH, 'Details', 'Brands.txt'));
}

/**
 * Get all presets data combined.
 */
export function getPresetsData(): PresetsData {
  return {
    shopType: getShopType(),
    dataRequired: getDataRequired(),
    hotelList: getHotelList(),
    brandList: getBrandList(),
    display: getDisplay(),
  };
}
