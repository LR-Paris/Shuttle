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

export interface FAQEntry {
  question: string;
  answer: string;
}

export interface DesignData {
  colors: Colors;
  companyName: string;
  descriptions: Descriptions;
  logoPath: string | null;
  logoWhitePath: string | null;
  faviconPath: string | null;
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

function getLogoPath(baseName: string): string | null {
  try {
    // Check for multiple image formats
    const formats = ['.png', '.jpg', '.jpeg'];

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
    logoPath: getLogoPath('logo'),
    logoWhitePath: getLogoPath('logo-white'),
    faviconPath: getLogoPath('favicon.ico'),
  };
}
