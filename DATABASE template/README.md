# DATABASE Folder

## Overview
This is the core data storage folder for the entire B2B storefront system. All product data, design settings, and orders are stored here in a file-based structure that requires NO database setup.

## Folder Structure

```
DATABASE/
├── ShopCollections/     # All product collections and individual products
├── Design/              # Visual design, branding, and assets
└── Orders/              # Customer orders (generated automatically)
```

## How It Works

The system reads from this folder structure at runtime to:
1. **Display products** - Reads from `ShopCollections/`
2. **Apply branding** - Reads from `Design/`
3. **Store orders** - Writes to `Orders/`

## File Format Support

All image files can be in the following formats:
- `.png` (Portable Network Graphics)
- `.jpg` / `.jpeg` (JPEG)
- `.gif` (Graphics Interchange Format)
- `.webp` (WebP)

The system automatically detects and serves images in any of these formats.

## Adding New Content

### To add a new product collection:
1. Create a folder in `ShopCollections/` with your collection name
2. Follow the structure documented in `ShopCollections/README.md`

### To modify branding:
1. Update files in `Design/Details/`
2. Replace logos in `Design/Logos/`
3. Follow the structure documented in `Design/README.md`

### To add homepage showcase images:
1. Add images to `Design/ShowcasePhotos/`
2. Follow the naming convention in `Design/ShowcasePhotos/README.md`

## Important Rules

1. **Folder names become IDs** - Collection and product folder names are converted to URL-safe slugs
2. **Case matters** - File names must match exactly (see individual folder READMEs)
3. **No special characters** - Use letters, numbers, spaces, hyphens, and ampersands in folder names
4. **One source of truth** - All data comes from files in this folder, no database required

## For AI Assistants

When working with this system:
1. Always read the README in each subfolder before making changes
2. Follow the exact file naming conventions documented
3. The system auto-detects `.png` and `.jpg` files interchangeably
4. Create necessary folders if they don't exist
5. Never hardcode data - always use the file-based structure

## Next Steps

Read the README files in each subfolder:
- `ShopCollections/README.md` - Product catalog structure
- `Design/README.md` - Branding and visual design
- `Orders/README.md` - Order storage format
