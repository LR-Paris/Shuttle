# ShopCollections Folder

## Overview
This folder contains all product collections for your B2B storefront. Each collection is a folder that groups related products together.

## Structure

```
ShopCollections/
├── Collection Name 1/
│   ├── README.md              # This file
│   ├── Product Name 1/
│   │   ├── Details/           # Product details (required)
│   │   └── Photos/            # Product images
│   └── Product Name 2/
│       ├── Details/
│       └── Photos/
└── Collection Name 2/
    └── ...
```

## Creating a New Collection

### Step 1: Create Collection Folder
Create a folder with your collection name. Examples:
- `Pet Accessories`
- `Office Essentials`
- `Travel & Lifestyle`

**Important:**
- Use descriptive, user-friendly names
- Spaces and ampersands (&) are allowed
- The folder name becomes the collection display name
- The system converts it to a URL-safe ID (e.g., "Pet Accessories" → "pet-accessories")

### Step 2: Add Products
Inside your collection folder, create a folder for each product. See the Product Structure section below.

### Step 3: Add Collection README (Optional)
Place a `README.md` file in your collection folder to document the collection for other users/AI.

## Product Structure

Each product folder must contain:

```
Product Name/
├── Details/              # REQUIRED - Product information
│   ├── Name.txt         # REQUIRED - Display name
│   ├── Description.txt  # REQUIRED - Product description
│   ├── SKU.txt         # REQUIRED - Stock keeping unit
│   ├── ItemCost.txt    # REQUIRED - Cost per single item
│   ├── BoxCost.txt     # REQUIRED - Cost per box
│   └── UnitsPerBox.txt # REQUIRED - How many items in a box
└── Photos/              # OPTIONAL - Product images
    ├── main.png        # First image (primary)
    ├── detail-1.jpg    # Additional images
    ├── detail-2.png    # Mix of PNG/JPG supported
    └── ...
```

### Details Files Format

#### Name.txt
```
Product Display Name
```
Example: `Premium Dog Bowl`

#### Description.txt
```
Multi-line product description.
Can include multiple paragraphs.
Be descriptive and informative.
```
Example:
```
A premium stainless steel dog bowl with non-slip base.
Perfect for medium to large dogs.
Dishwasher safe and rust-resistant.
```

#### SKU.txt
```
YOUR-SKU-CODE
```
Example: `PET-BOWL-001`

#### ItemCost.txt
```
0.00
```
Format: Decimal number without currency symbol
Example: `12.50`

#### BoxCost.txt
```
0.00
```
Format: Decimal number without currency symbol
Example: `120.00`

#### UnitsPerBox.txt
```
0
```
Format: Integer number
Example: `12`

### Photos Folder

**Supported Formats:**
- `.png` (recommended for transparent backgrounds)
- `.jpg` / `.jpeg` (recommended for photographs)
- `.gif` (animated images)
- `.webp` (modern format)

**Naming Convention:**
- `main.png` or `main.jpg` - Primary product image (displayed first)
- Any other names - Additional images (displayed in alphabetical order)
- Use descriptive names: `detail-1.jpg`, `front-view.png`, `packaging.jpg`

**Image Guidelines:**
- Square aspect ratio recommended (e.g., 800x800px, 1000x1000px)
- High quality (at least 500x500px)
- Clean white or transparent background preferred
- File size: Keep under 2MB per image for fast loading

## Example: Complete Product Setup

```
ShopCollections/
└── Pet Accessories/
    └── Premium Dog Bowl/
        ├── Details/
        │   ├── Name.txt            (Content: "Premium Dog Bowl")
        │   ├── Description.txt     (Content: "A premium stainless steel...")
        │   ├── SKU.txt            (Content: "PET-BOWL-001")
        │   ├── ItemCost.txt       (Content: "12.50")
        │   ├── BoxCost.txt        (Content: "120.00")
        │   └── UnitsPerBox.txt    (Content: "12")
        └── Photos/
            ├── main.png           (Primary product image)
            ├── detail-1.jpg       (Side view)
            └── detail-2.jpg       (In-use photo)
```

## How Collections Appear on Website

### Collections Page (`/collections`)
- Lists all collections with product counts
- Uses collection folder name as display name
- Shows number of products in each collection

### Collection Detail Page (`/collections/[id]`)
- Displays all products in the collection
- Shows product images (from Photos folder)
- Shows product names and brief info
- Links to individual product pages

### Product Page (`/products/[id]`)
- Displays all product details from Details folder
- Shows all product images from Photos folder
- Includes pricing calculator (box vs item pricing)
- Add to cart functionality

## URL Generation

The system automatically generates URLs:
- Collection folder: `Pet Accessories` → URL: `/collections/pet-accessories`
- Product folder: `Premium Dog Bowl` → URL: `/products/pet-accessories-premium-dog-bowl`

## Validation Rules

A product will NOT appear if:
- Missing `Details` folder
- Missing required .txt files (Name.txt, SKU.txt at minimum)
- Name.txt or SKU.txt is empty
- Folder structure is incorrect

A collection will NOT appear if:
- Contains zero valid products

## For AI Assistants

When creating or modifying collections:

1. **Always check existing structure first** - Read folder contents before creating
2. **Follow exact file naming** - Case-sensitive: `Name.txt` not `name.txt`
3. **Validate numeric fields** - ItemCost, BoxCost must be valid decimals; UnitsPerBox must be integer
4. **Use appropriate image formats** - PNG for graphics/logos, JPG for photos
5. **Create all required files** - Products won't appear without complete Details
6. **Test the structure** - Verify files are in correct locations

### Quick Product Creation Checklist:
- [ ] Collection folder exists
- [ ] Product folder created inside collection
- [ ] `Details` subfolder created
- [ ] All 6 required .txt files created
- [ ] All .txt files have valid content
- [ ] `Photos` subfolder created (if images available)
- [ ] At least one image added (main.png or main.jpg)

## Common Issues

**Product not showing up?**
- Check that Details folder exists
- Verify Name.txt and SKU.txt are not empty
- Ensure proper folder hierarchy

**Images not loading?**
- Check that images are in Photos folder
- Verify file extensions are lowercase (.png not .PNG)
- Ensure image files are not corrupted

**Wrong pricing displayed?**
- Check that ItemCost.txt and BoxCost.txt contain only numbers and decimal point
- Verify UnitsPerBox.txt contains only an integer

## Next Steps

To create your first product:
1. Create or choose a collection folder
2. Create a product folder inside it
3. Follow the Product Structure section above
4. Test by visiting your storefront
