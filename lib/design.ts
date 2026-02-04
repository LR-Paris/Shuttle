import fs from 'fs';
import path from 'path';

const DATABASE_PATH = path.join(process.cwd(), 'DATABASE');
const DESIGN_PATH = path.join(DATABASE_PATH, 'Design');

export interface Colors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  textLight: string;
  border: string;
  success: string;
}

export interface Descriptions {
  tagline: string;
  about: string;
  footer: string;
}

export interface DesignData {
  colors: Colors;
  companyName: string;
  descriptions: Descriptions;
  logoPath: string | null;
  logoWhitePath: string | null;
  faviconPath: string | null;
  cornerStyle: 'rounded' | 'square';
  showcaseImages: string[];
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

export function getColors(): Colors {
  try {
    const colorsPath = path.join(DESIGN_PATH, 'Details', 'Colors.txt');
    const content = fs.readFileSync(colorsPath, 'utf-8');
    const parsed = parseKeyValueFile(content);

    return {
      primary: parsed.primary || '#1a1a1a',
      secondary: parsed.secondary || '#ff6600',
      accent: parsed.accent || '#4a90e2',
      background: parsed.background || '#ffffff',
      text: parsed.text || '#333333',
      textLight: parsed.textLight || '#666666',
      border: parsed.border || '#e5e5e5',
      success: parsed.success || '#10b981',
    };
  } catch (error) {
    console.error('Error reading colors:', error);
    return {
      primary: '#1a1a1a',
      secondary: '#ff6600',
      accent: '#4a90e2',
      background: '#ffffff',
      text: '#333333',
      textLight: '#666666',
      border: '#e5e5e5',
      success: '#10b981',
    };
  }
}

export function getCompanyName(): string {
  try {
    const companyNamePath = path.join(DESIGN_PATH, 'Details', 'CompanyName.txt');
    return fs.readFileSync(companyNamePath, 'utf-8').trim();
  } catch (error) {
    console.error('Error reading company name:', error);
    return 'B2B Storefront';
  }
}

export function getDescriptions(): Descriptions {
  try {
    const descriptionsPath = path.join(DESIGN_PATH, 'Details', 'Descriptions.txt');
    const content = fs.readFileSync(descriptionsPath, 'utf-8');
    const parsed = parseKeyValueFile(content);

    return {
      tagline: parsed.tagline || 'Quality products for your business',
      about: parsed.about || 'We provide quality products for businesses.',
      footer: parsed.footer || '© 2026 All rights reserved.',
    };
  } catch (error) {
    console.error('Error reading descriptions:', error);
    return {
      tagline: 'Quality products for your business',
      about: 'We provide quality products for businesses.',
      footer: '© 2026 All rights reserved.',
    };
  }
}

function getLogoPath(filename: string): string | null {
  try {
    const logoPath = path.join(DESIGN_PATH, 'Logos', filename);
    if (fs.existsSync(logoPath)) {
      return `/api/images/logos/${filename}`;
    }
    return null;
  } catch (error) {
    return null;
  }
}

function getCornerStyle(): 'rounded' | 'square' {
  try {
    const cornerStylePath = path.join(DESIGN_PATH, 'Details', 'CornerStyle.txt');
    const content = fs.readFileSync(cornerStylePath, 'utf-8').trim().toLowerCase();
    return content === 'square' ? 'square' : 'rounded';
  } catch (error) {
    return 'rounded';
  }
}

function getShowcaseImages(): string[] {
  try {
    const showcasePath = path.join(DESIGN_PATH, 'Showcase');
    if (!fs.existsSync(showcasePath)) {
      return [];
    }

    const files = fs.readdirSync(showcasePath);
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
    });

    return imageFiles.map(file => `/api/images/showcase/${file}`);
  } catch (error) {
    return [];
  }
}

export function getDesignData(): DesignData {
  return {
    colors: getColors(),
    companyName: getCompanyName(),
    descriptions: getDescriptions(),
    logoPath: getLogoPath('logo.png'),
    logoWhitePath: getLogoPath('logo-white.png'),
    faviconPath: getLogoPath('favicon.ico'),
    cornerStyle: getCornerStyle(),
    showcaseImages: getShowcaseImages(),
  };
}
