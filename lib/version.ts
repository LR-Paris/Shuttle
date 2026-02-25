/**
 * Shop Template System Version
 *
 * Version Format: STS-X.YY
 * - STS = Shop Template System prefix
 * - X = Major version number (0 for initial development)
 * - YY = Minor version number (increments by 01 for each update)
 *
 * Version History:
 * - STS-0.10 - Initial version with folder-driven storefront
 * - STS-0.11 - Added cart and checkout functionality
 * - STS-0.12 - Improved product display and pricing
 * - STS-0.13 - Added order management system
 * - STS-0.14 - Comprehensive README documentation and PNG/JPG support
 * - STS-0.15 - Restored customization features (fonts, styles, corner radius), showcase photos, and collection carousels
 * - STS-0.16 - Password protection, collections dropdown, easter egg, and UI refinements
 * - STS-0.21 - Fix all issues: title fallback, back navigation, photo display, synced carousels, favicon, logo dark bg, white item backgrounds
 * - STS-0.22 - Use logo as favicon, dynamic page titles, capitalize From label
 * - STS-0.23 - Showcase photos integration: collections use showcase photos, main page uses any images from root, all image formats supported (jpg, png, jpeg, webp, gif)
 * - STS-0.24 - PDF receipt download on order success page, removed false email confirmation promise
 * - STS-2.00 - Shop type system (free/po/stripe), DATABASE/Presets config, DataRequired toggles, Hotel list feature, PO upload support, backward-compatible CSV migration
 * - STS-2.01 - PO uploads accept HTML/TXT/Word files, hotel selection fix, name and email always required
 * - STS-2.02 - Image fade-in loading with placeholder color blocks across all pages
 *
 * To increment version:
 * 1. Update VERSION constant below
 * 2. Add entry to version history above
 * 3. Update CHANGELOG.md (if exists)
 * 4. Commit with version number in commit message
 */

export const VERSION = 'STS-2.02';

export const VERSION_INFO = {
  name: 'Shop Template System',
  version: VERSION,
  codename: 'Presets',
  releaseDate: '2026-02-26',
  description: 'Folder-driven B2B storefront system with configurable shop types',
  attribution: 'Built with LR Paris Shuttle',
};

/**
 * Get current version string
 */
export function getVersion(): string {
  return VERSION;
}

/**
 * Get full version info
 */
export function getVersionInfo() {
  return VERSION_INFO;
}

/**
 * Get major version number
 */
export function getMajorVersion(): number {
  const match = VERSION.match(/STS-(\d+)\./);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Get minor version number
 */
export function getMinorVersion(): number {
  const match = VERSION.match(/STS-\d+\.(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Get next version string (increments minor version)
 */
export function getNextVersion(): string {
  const major = getMajorVersion();
  const minor = getMinorVersion();
  const nextMinor = (minor + 1).toString().padStart(2, '0');
  return `STS-${major}.${nextMinor}`;
}
