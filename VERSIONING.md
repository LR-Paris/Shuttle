# Version System Documentation

## Overview
The Shop Template System uses a custom versioning scheme to track updates and changes to the platform.

## Version Format

**Pattern:** `STS-X.YY`

Where:
- **STS** = Shop Template System (fixed prefix)
- **X** = Major version number (0 for initial development, 1 for first stable release)
- **YY** = Minor version number (two digits, increments by 1 for each update)

## Examples

- `STS-0.10` - Initial version
- `STS-0.11` - First update
- `STS-0.14` - Fourth update (current version)
- `STS-0.15` - Next update
- `STS-1.00` - First stable release

## Version History

| Version | Release Date | Description |
|---------|--------------|-------------|
| STS-0.10 | 2026-01-15 | Initial version with folder-driven storefront |
| STS-0.11 | 2026-01-20 | Added cart and checkout functionality |
| STS-0.12 | 2026-01-25 | Improved product display and pricing |
| STS-0.13 | 2026-02-01 | Added order management system |
| STS-0.14 | 2026-02-05 | Comprehensive README documentation and PNG/JPG support |
| STS-0.15 | 2026-02-05 | Restored customization features, showcase photos, collection carousels |
| STS-0.16 | 2026-02-05 | Password protection, collections dropdown, easter egg, UI refinements |
| STS-0.21 | 2026-02-09 | Fix all issues: title fallback, back navigation, photo display, synced carousels, favicon, logo dark bg, white item backgrounds |
| STS-0.22 | 2026-02-09 | Use logo as favicon, dynamic page titles, capitalize From label |
| STS-0.23 | 2026-02-11 | Showcase photos integration: collections use showcase photos, main page uses any images from root, all image formats supported (jpg, png, jpeg, webp, gif) |

## How to Increment Version

When making updates to the system, follow these steps:

### 1. Update Version in Code

Edit `lib/version.ts`:

```typescript
export const VERSION = 'STS-0.15'; // Increment minor version
```

Update the VERSION_INFO object:

```typescript
export const VERSION_INFO = {
  name: 'Shop Template System',
  version: VERSION,
  codename: 'Alpha',
  releaseDate: '2026-02-XX', // Update date
  description: 'Folder-driven B2B storefront system',
  attribution: 'Built with LR Paris Shuttle',
};
```

Add entry to version history comment:

```typescript
/**
 * Version History:
 * - STS-0.10 - Initial version
 * ...
 * - STS-0.15 - Your new update description
 */
```

### 2. Update VERSIONING.md

Add new entry to the Version History table:

```markdown
| STS-0.15 | 2026-02-XX | Your update description |
```

### 3. Commit Changes

Use version number in commit message:

```bash
git add lib/version.ts VERSIONING.md
git commit -m "Bump version to STS-0.15: Your update description"
```

### 4. Tag Release (Optional)

Create a git tag for the release:

```bash
git tag -a STS-0.15 -m "Version STS-0.15: Your update description"
git push origin STS-0.15
```

## Version Display

The version number is displayed in:

1. **Footer** - All pages show version number with "Built with LR Paris Shuttle"
2. **About Page** - System Information section shows full version details
3. **API Response** - Can be exposed via `/api/version` endpoint (future)

## When to Increment

### Minor Version (X.YY → X.YY+1)

Increment the minor version for:
- New features added
- Bug fixes
- Documentation updates
- UI/UX improvements
- Performance optimizations
- Dependency updates

**Examples:**
- Added About page → STS-0.14 to STS-0.15
- Fixed cart bug → STS-0.15 to STS-0.16
- Updated styling → STS-0.16 to STS-0.17

### Major Version (X.YY → X+1.00)

Increment the major version for:
- Major platform updates
- Breaking changes
- Complete redesigns
- First stable release (0.XX → 1.00)

**Examples:**
- First stable release → STS-0.99 to STS-1.00
- Complete redesign → STS-1.50 to STS-2.00
- Breaking API changes → STS-2.30 to STS-3.00

## Version Retrieval

### In React Components

```typescript
import { getVersion, getVersionInfo } from '@/lib/version';

export default function MyComponent() {
  const version = getVersion(); // "STS-0.14"
  const info = getVersionInfo(); // Full version object

  return <div>Version: {version}</div>;
}
```

### In API Routes

```typescript
import { getVersionInfo } from '@/lib/version';
import { NextResponse } from 'next/server';

export async function GET() {
  const versionInfo = getVersionInfo();
  return NextResponse.json(versionInfo);
}
```

### Helper Functions

```typescript
import {
  getVersion,        // Get version string
  getVersionInfo,    // Get full version object
  getMajorVersion,   // Get major version number
  getMinorVersion,   // Get minor version number
  getNextVersion,    // Get next version string
} from '@/lib/version';

// Examples:
getVersion()        // "STS-0.14"
getMajorVersion()   // 0
getMinorVersion()   // 14
getNextVersion()    // "STS-0.15"
```

## Best Practices

1. **Always update version** when making changes
2. **Document changes** in version history
3. **Use descriptive messages** in commits
4. **Keep VERSIONING.md up to date**
5. **Test thoroughly** before incrementing version
6. **Tag releases** for important milestones
7. **Communicate updates** to users/stakeholders

## Attribution

This system was built with **LR Paris Shuttle** and is proudly displayed in:
- Footer on all pages
- About page system information section
- Version info object

## Future Enhancements

Potential future additions to version system:

- [ ] Automatic version bumping via npm scripts
- [ ] Changelog auto-generation from git commits
- [ ] Version API endpoint (`/api/version`)
- [ ] Release notes system
- [ ] Semantic versioning migration (optional)
- [ ] Version comparison utilities
- [ ] Deprecation warnings for old versions
- [ ] Update notification system

## Questions?

For questions about the versioning system, see the About page or contact via the FAQ section.
