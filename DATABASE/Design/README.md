# Design Folder

## Overview
This folder controls all visual branding and design elements for your B2B storefront, including colors, logos, company information, and showcase images.

## Folder Structure

```
Design/
├── README.md              # This file
├── Details/               # Company info and color scheme
│   ├── README.md         # Details folder documentation
│   ├── CompanyName.txt   # Your company name
│   ├── Colors.txt        # Color scheme (key: value format)
│   └── Descriptions.txt  # Tagline, about, footer text
├── FAQ/                   # Frequently Asked Questions
│   ├── README.md         # FAQ folder documentation
│   └── FAQ.txt           # Questions and answers (Q: / A: format)
├── Logos/                 # Company logos and favicon
│   ├── README.md         # Logos folder documentation
│   ├── logo.png or logo.jpg           # Main logo (dark backgrounds)
│   ├── logo-white.png or logo-white.jpg  # White logo (dark backgrounds)
│   └── favicon.ico       # Browser tab icon
└── ShowcasePhotos/        # Homepage hero/banner images
    ├── README.md         # ShowcasePhotos folder documentation
    ├── hero.png or hero.jpg           # Main homepage hero image
    └── banner-*.png or banner-*.jpg   # Additional banners
```

## Quick Start Guide

### 1. Set Your Company Name
Edit `Details/CompanyName.txt`:
```
Your Company Name
```

### 2. Configure Colors
Edit `Details/Colors.txt` using key: value format:
```
primary: #1a1a1a
secondary: #ff6600
accent: #4a90e2
background: #ffffff
text: #333333
textLight: #666666
border: #e5e5e5
success: #10b981
```

### 3. Add Your Logos
Place these files in `Logos/`:
- `logo.png` or `logo.jpg` - Main logo
- `logo-white.png` or `logo-white.jpg` - White version (optional)
- `favicon.ico` - Browser tab icon (optional)

### 4. Add Homepage Images
Place these files in `ShowcasePhotos/`:
- `hero.png` or `hero.jpg` - Main hero image
- `banner-1.png`, `banner-2.jpg`, etc. - Additional banners

## Detailed Documentation

Each subfolder has its own README with complete specifications:
- **Details/** - See `Details/README.md` for text content format
- **FAQ/** - See `FAQ/README.md` for FAQ format and customization
- **Logos/** - See `Logos/README.md` for logo specifications
- **ShowcasePhotos/** - See `ShowcasePhotos/README.md` for image requirements

## Image Format Support

All image folders support multiple formats interchangeably:
- `.png` - Best for logos, graphics with transparency
- `.jpg` / `.jpeg` - Best for photographs
- `.gif` - Animated images
- `.webp` - Modern efficient format

The system automatically detects which format you use.

## How Changes Appear on Website

### Company Name
- Appears in page titles and navigation header
- Used in browser tab title
- Source: `Details/CompanyName.txt`

### Colors
- Applied throughout entire site
- Buttons, links, headers use these colors
- Maintains consistent branding
- Source: `Details/Colors.txt`

### Logos
- Main logo appears in header navigation
- Favicon appears in browser tab
- Source: `Logos/logo.png` or `Logos/logo.jpg`

### Showcase Images
- Hero image displayed on homepage
- Banners can be used for promotions
- Source: `ShowcasePhotos/hero.png` or `ShowcasePhotos/hero.jpg`

## For AI Assistants

When working with design files:

1. **Read existing content first** - Check what's already configured
2. **Follow exact file names** - Case-sensitive: `CompanyName.txt` not `companyname.txt`
3. **Respect format requirements** - Each file has specific format (see subfolder READMEs)
4. **Support both PNG and JPG** - Check for either format when reading images
5. **Validate color codes** - Ensure hex colors start with # and are valid
6. **Test after changes** - Verify changes appear on the website

### Quick Modification Checklist:
- [ ] Read existing file before editing
- [ ] Maintain proper file format (txt, png/jpg, ico)
- [ ] Follow key: value format for Colors.txt and Descriptions.txt
- [ ] Keep file names exactly as specified
- [ ] Verify changes on website after editing

## Common Tasks

### Change Color Scheme
1. Edit `Details/Colors.txt`
2. Modify hex color values (keep # prefix)
3. Restart dev server to see changes

### Update Company Name
1. Edit `Details/CompanyName.txt`
2. Replace content with new name
3. Changes appear immediately on next page load

### Replace Logo
1. Add new logo to `Logos/` folder
2. Name it `logo.png` or `logo.jpg`
3. Old logo can be deleted or renamed
4. System automatically uses new file

### Add Homepage Hero Image
1. Add image to `ShowcasePhotos/` folder
2. Name it `hero.png` or `hero.jpg`
3. Recommended size: 1920x600px or larger
4. Image will display on homepage

## Troubleshooting

**Colors not updating?**
- Check Colors.txt format (key: value with colon)
- Ensure hex codes are valid (#RRGGBB)
- Restart development server

**Logo not showing?**
- Verify file is named exactly `logo.png` or `logo.jpg`
- Check file is in Logos/ folder
- Ensure image file is not corrupted

**Showcase images not appearing?**
- Check file naming: `hero.png` or `hero.jpg`
- Verify file is in ShowcasePhotos/ folder
- Ensure homepage implementation is complete

## Next Steps

For detailed instructions on each subsection:
1. Read `Details/README.md` - Company information format
2. Read `Logos/README.md` - Logo specifications
3. Read `ShowcasePhotos/README.md` - Homepage image requirements
