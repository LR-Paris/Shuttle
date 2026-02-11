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

export interface Fonts {
  titleFont: string;
  bodyFont: string;
  titleFontUrl: string;
  bodyFontUrl: string;
}

export interface Style {
  cornerRadius: number;
  style: string;
}

export interface FAQEntry {
  question: string;
  answer: string;
}

export interface DesignData {
  colors: Colors;
  companyName: string;
  descriptions: Descriptions;
  fonts: Fonts;
  style: Style;
  password: string;
  logoPath: string | null;
  logoWhitePath: string | null;
  faviconPath: string | null;
  heroImages: string[];
  collectionShowcaseImages: Record<string, string | null>;
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
    return 'Shuttle';
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

export function getFonts(): Fonts {
  try {
    const fontsPath = path.join(DESIGN_PATH, 'Details', 'Fonts.txt');
    const content = fs.readFileSync(fontsPath, 'utf-8');
    const parsed = parseKeyValueFile(content);

    // Add generic fallback to font names
    const titleFont = parsed.titleFont || 'Inter';
    const bodyFont = parsed.bodyFont || 'Inter';

    return {
      titleFont: `${titleFont}, sans-serif`,
      bodyFont: `${bodyFont}, sans-serif`,
      titleFontUrl: parsed.titleFontUrl || '',
      bodyFontUrl: parsed.bodyFontUrl || '',
    };
  } catch (error) {
    console.error('Error reading fonts:', error);
    return {
      titleFont: 'Inter, sans-serif',
      bodyFont: 'Inter, sans-serif',
      titleFontUrl: '',
      bodyFontUrl: '',
    };
  }
}

export function getStyle(): Style {
  try {
    const stylePath = path.join(DESIGN_PATH, 'Details', 'Style.txt');
    const content = fs.readFileSync(stylePath, 'utf-8');
    const parsed = parseKeyValueFile(content);

    return {
      cornerRadius: parseInt(parsed.cornerRadius || '12', 10),
      style: parsed.style || 'rounded',
    };
  } catch (error) {
    console.error('Error reading style:', error);
    return {
      cornerRadius: 12,
      style: 'rounded',
    };
  }
}

export function getPassword(): string {
  try {
    const passwordPath = path.join(DESIGN_PATH, 'Details', 'Password.txt');
    return fs.readFileSync(passwordPath, 'utf-8').trim();
  } catch (error) {
    console.error('Error reading password:', error);
    return 'admin';
  }
}

function getLogoPath(baseName: string): string | null {
  try {
    // Check for multiple image formats
    const formats = ['.png', '.jpg', '.jpeg', '.svg'];

    for (const ext of formats) {
      const filename = baseName + ext;
      const logoPath = path.join(DESIGN_PATH, 'Logos', filename);
      if (fs.existsSync(logoPath)) {
        return `/api/images/logos/${filename}`;
      }
    }
    return null;
  } catch (error) {
    return null;
  }
}

export function getHeroImages(): string[] {
  try {
    const showcasePath = path.join(DESIGN_PATH, 'ShowcasePhotos');
    if (!fs.existsSync(showcasePath)) {
      return [];
    }

    const heroImages: string[] = [];
    const formats = /\.(png|jpg|jpeg|webp|gif)$/i;

    // Read all files in the ShowcasePhotos root directory
    const files = fs.readdirSync(showcasePath);

    for (const file of files) {
      const filePath = path.join(showcasePath, file);
      const stats = fs.statSync(filePath);

      // Only include files (not directories) that match image formats
      if (stats.isFile() && formats.test(file)) {
        heroImages.push(`/api/images/showcase/${file}`);
      }
    }

    // Sort to ensure consistent order
    heroImages.sort();

    return heroImages;
  } catch (error) {
    console.error('Error reading hero images:', error);
    return [];
  }
}

export function getCollectionShowcaseImages(): Record<string, string | null> {
  try {
    const showcasePath = path.join(DESIGN_PATH, 'ShowcasePhotos', 'Collections');
    if (!fs.existsSync(showcasePath)) {
      return {};
    }

    const files = fs.readdirSync(showcasePath);
    const showcaseImages: Record<string, string | null> = {};

    for (const file of files) {
      if (/\.(png|jpg|jpeg|webp|gif)$/i.test(file)) {
        const collectionId = file.replace(/\.(png|jpg|jpeg|webp|gif)$/i, '');
        showcaseImages[collectionId] = `/api/images/showcase/Collections/${file}`;
      }
    }

    return showcaseImages;
  } catch (error) {
    console.error('Error reading collection showcase images:', error);
    return {};
  }
}

export function getFAQData(): FAQEntry[] {
  try {
    const faqPath = path.join(DESIGN_PATH, 'FAQ', 'FAQ.txt');
    const content = fs.readFileSync(faqPath, 'utf-8');

    const entries: FAQEntry[] = [];
    const lines = content.split('\n');
    let currentQuestion = '';
    let currentAnswer = '';
    let inAnswer = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith('Q: ')) {
        // Save previous entry if exists
        if (currentQuestion && currentAnswer) {
          entries.push({
            question: currentQuestion,
            answer: currentAnswer.trim(),
          });
        }
        currentQuestion = line.substring(3).trim();
        currentAnswer = '';
        inAnswer = false;
      } else if (line.startsWith('A: ')) {
        currentAnswer = line.substring(3);
        inAnswer = true;
      } else if (inAnswer) {
        // Continue multi-line answer
        currentAnswer += '\n' + line;
      }
    }

    // Add last entry
    if (currentQuestion && currentAnswer) {
      entries.push({
        question: currentQuestion,
        answer: currentAnswer.trim(),
      });
    }

    return entries;
  } catch (error) {
    console.error('Error reading FAQ:', error);
    // Return default FAQ
    return [
      {
        question: 'How do I place an order?',
        answer: 'Browse our collections, add items to your cart, and proceed to checkout.',
      },
      {
        question: 'What payment methods do you accept?',
        answer: 'Please contact us for payment information.',
      },
    ];
  }
}

export function getDesignData(): DesignData {
  return {
    colors: getColors(),
    companyName: getCompanyName(),
    descriptions: getDescriptions(),
    fonts: getFonts(),
    style: getStyle(),
    password: getPassword(),
    logoPath: getLogoPath('logo'),
    logoWhitePath: getLogoPath('logo-white'),
    faviconPath: getLogoPath('favicon'),
    heroImages: getHeroImages(),
    collectionShowcaseImages: getCollectionShowcaseImages(),
  };
}
