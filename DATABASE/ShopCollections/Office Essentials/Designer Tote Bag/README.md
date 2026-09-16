# Designer Tote Bag - Product

## Product Structure

```
Designer Tote Bag/
├── README.md           # This file - product documentation
├── Details/            # Product information (REQUIRED)
│   ├── Name.txt       # Display name on website
│   ├── Description.txt # Full product description
│   ├── SKU.txt        # Stock keeping unit code
│   ├── ItemCost.txt   # Price per single item
│   ├── BoxCost.txt    # Price per box/case
│   └── UnitsPerBox.txt # Items included per box
└── Photos/             # Product images
    ├── main.png       # Primary image (shown first)
    └── ...            # Additional images
```

## Editing Product Information

### To Change Product Details:
Edit the corresponding .txt file in the `Details/` folder:
- **Name** - Edit `Details/Name.txt`
- **Description** - Edit `Details/Description.txt`
- **SKU** - Edit `Details/SKU.txt`
- **Pricing** - Edit `Details/ItemCost.txt` or `Details/BoxCost.txt`
- **Box Quantity** - Edit `Details/UnitsPerBox.txt`

### To Change Product Images:
1. Add images to the `Photos/` folder
2. Supported formats: .png, .jpg, .jpeg, .gif, .webp
3. Name the primary image `main.png` or `main.jpg`
4. Other images will display in alphabetical order

### Image Guidelines:
- Square format recommended (800x800px minimum)
- Clean background (white or transparent)
- High quality, clear product view
- Keep file size under 2MB each

## File Format Requirements

**Name.txt**
- Single line with product name
- Example: `Designer Tote Bag`

**Description.txt**
- Multi-line description
- Plain text, no HTML
- Be detailed and informative

**SKU.txt**
- Unique product code
- Example: `TOTE-001`

**ItemCost.txt**
- Decimal number only (no $ symbol)
- Example: `24.99`

**BoxCost.txt**
- Decimal number only (no $ symbol)
- Example: `249.00`

**UnitsPerBox.txt**
- Integer number only
- Example: `12`

## For AI Assistants

When modifying this product:
1. Read existing file contents before editing
2. Maintain exact file name casing (e.g., `Name.txt` not `name.txt`)
3. Ensure numeric values are properly formatted
4. Preserve the folder structure
5. Validate that all required files exist

### Quick Checklist:
- [ ] Details folder exists
- [ ] All 6 required .txt files present
- [ ] Files contain valid data
- [ ] Photos folder exists
- [ ] At least one image present (main.png or main.jpg)

## Testing Changes

After making changes:
1. Restart the development server if running locally
2. Navigate to the product page: `/products/office-essentials-designer-tote-bag`
3. Verify changes appear correctly
4. Check that images load properly
