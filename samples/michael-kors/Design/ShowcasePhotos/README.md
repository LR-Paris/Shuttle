# ShowcasePhotos Folder

## Overview
This folder contains hero images and banners displayed on the homepage. These are large, eye-catching images that showcase your brand and products to visitors.

## Purpose
Showcase photos are different from product photos:
- **Product photos** - Individual product images for product pages (stored in `ShopCollections/`)
- **Showcase photos** - Hero/banner images for the homepage (stored here)

## File Structure

```
ShowcasePhotos/
├── README.md                # This file
├── hero.png or hero.jpg     # Main homepage hero image (OPTIONAL)
├── banner-1.png             # Additional banners (OPTIONAL)
├── banner-2.jpg             # Additional banners (OPTIONAL)
└── ...                      # More banners as needed
```

## Supported Image Files

### hero.png OR hero.jpg (Main Hero Image)

**Purpose:** Large hero image displayed prominently on the homepage

**Specifications:**
- **Filename:** Exactly `hero.png` or `hero.jpg` (lowercase)
- **Format:** PNG or JPG
- **Recommended Size:** 1920x600px to 2400x800px
- **Aspect Ratio:** Wide (approximately 3:1 or 16:9)
- **File Size:** Keep under 1MB (optimize for web)
- **Content:** High-quality lifestyle or product photography

**Design Guidelines:**
- Professional, high-resolution photography
- On-brand colors and styling
- Clear focal point or subject
- Avoid too much text in image (text overlays done in code)
- Ensure important content is centered (safe zone)
- Should work on both desktop and mobile (edges may be cropped)

**Example Use Cases:**
- Lifestyle shot of products in use
- Brand/mood photography
- Product arrangements
- Workspace/office scenes
- Pet products in action

**Where it appears:**
- Top of homepage (hero section)
- Full-width display
- Text and CTAs overlay on top of image
- Most prominent visual on the site

---

### banner-*.png OR banner-*.jpg (Additional Banners)

**Purpose:** Additional promotional or category banners

**Specifications:**
- **Filename Pattern:** `banner-1.png`, `banner-2.jpg`, `banner-3.png`, etc.
- **Format:** PNG or JPG
- **Recommended Size:** 1200x400px to 1920x600px
- **Aspect Ratio:** Wide banner format (3:1)
- **File Size:** Keep under 800KB each

**Naming Convention:**
- Use `banner-` prefix
- Followed by number or descriptive name
- Examples: `banner-1.jpg`, `banner-2.png`, `banner-holiday.jpg`

**Use Cases:**
- Seasonal promotions
- Category highlights
- Special offers
- Brand storytelling
- Collection showcases

**Current Status:**
- File structure prepared
- Not yet implemented in frontend
- Ready for future homepage enhancements

---

## Supported Formats

All formats work interchangeably:
- **PNG** - Best for graphics, transparent backgrounds, sharp edges
- **JPG/JPEG** - Best for photographs, smaller file sizes
- **GIF** - Animated banners (optional)
- **WEBP** - Modern format, excellent compression

**Format Recommendations:**
- **hero.jpg** - Recommended for photographic hero images (smaller file size)
- **hero.png** - Use if you need transparency or have graphics/text
- **banner-*.jpg** - For photographic banners
- **banner-*.png** - For banners with graphics or transparency

---

## Image Specifications in Detail

### Dimensions

**Desktop:**
- Width: 1920px (full HD) to 2400px (high-res displays)
- Height: 600px to 800px
- Aspect ratio: ~3:1 (wider is better)

**Mobile Considerations:**
- Images will be cropped/scaled on mobile
- Keep important content in center 50% of image
- Avoid placing critical elements near edges

### File Size Guidelines

**Optimization is crucial:**
- Hero image: Target 300-600KB (max 1MB)
- Banners: Target 200-500KB (max 800KB)
- Use compression tools: TinyPNG, Squoosh.app, ImageOptim

**Why optimize:**
- Faster page load times
- Better SEO
- Improved user experience
- Reduced bandwidth costs

### Quality Settings

**JPG Quality:**
- 80-85% quality is usually optimal
- 70-75% for very large images
- Don't go below 70% (visible artifacts)

**PNG Optimization:**
- Use PNG-8 if image has limited colors
- PNG-24 for full color with transparency
- Run through compression tools

---

## How to Add Images

### Adding Hero Image:

1. **Prepare your image:**
   - Choose high-quality photograph or graphic
   - Resize to 1920x600px (or similar wide ratio)
   - Optimize file size (compress to under 1MB)

2. **Name the file:**
   - Exactly `hero.png` or `hero.jpg` (lowercase)

3. **Place in folder:**
   - Move file to `DATABASE/Design/ShowcasePhotos/`
   - Delete or rename any existing hero image

4. **Verify:**
   - Restart development server
   - Visit homepage
   - Hero image should display in hero section

### Adding Banner Images:

1. **Prepare images:**
   - Create banner graphics (1200x400px or similar)
   - Optimize file sizes

2. **Name files:**
   - Use pattern: `banner-1.jpg`, `banner-2.png`, etc.
   - Or descriptive: `banner-holiday.jpg`, `banner-sale.png`

3. **Place in folder:**
   - Add to `DATABASE/Design/ShowcasePhotos/`

4. **Implementation:**
   - Currently prepared for future use
   - Will require homepage updates to display

---

## Current Implementation Status

### ✅ Implemented:
- Folder structure created
- File naming convention defined
- Documentation complete

### ⏳ Coming Soon:
- Homepage hero section with image display
- API route to serve showcase images
- Image optimization and responsive handling
- Banner carousel/grid implementation

### 🔧 To Implement:

When implementing showcase photos, you'll need:

1. **API Route** (`app/api/images/showcase/[filename]/route.ts`):
   ```typescript
   // Serve images from ShowcasePhotos folder
   // Support both PNG and JPG
   // Handle file not found gracefully
   ```

2. **Homepage Update** (`app/page.tsx`):
   ```typescript
   // Add hero section with background image
   // Overlay company name and tagline
   // Add CTA button
   // Responsive design (mobile/desktop)
   ```

3. **Design Function** (`lib/design.ts`):
   ```typescript
   // Add function to get showcase images
   // Check for hero.png or hero.jpg
   // Return image path or null
   ```

---

## For AI Assistants

When working with showcase photos:

### Implementation Checklist:

**1. Create API Route:**
- [ ] Create `app/api/images/showcase/[filename]/route.ts`
- [ ] Read from `DATABASE/Design/ShowcasePhotos/`
- [ ] Support PNG, JPG, GIF, WEBP formats
- [ ] Return proper content-type headers
- [ ] Handle file not found (404)

**2. Update Design Library:**
- [ ] Add to `lib/design.ts`: `getShowcaseImages()` function
- [ ] Check for `hero.png` or `hero.jpg`
- [ ] Return array of showcase image paths
- [ ] Include in `DesignData` interface

**3. Update Homepage:**
- [ ] Modify `app/page.tsx`
- [ ] Add hero section with image background
- [ ] Overlay text (company name, tagline)
- [ ] Add semi-transparent overlay for text readability
- [ ] Responsive design (full-width on desktop, appropriate on mobile)
- [ ] Fallback if no hero image exists

**4. Add Types:**
```typescript
// In lib/design.ts
export interface DesignData {
  // ... existing fields
  heroImagePath: string | null;
  bannerImages: string[];
}
```

### Code Examples:

**Check for hero image (both formats):**
```typescript
function getHeroImage(): string | null {
  const formats = ['hero.png', 'hero.jpg', 'hero.jpeg'];
  for (const format of formats) {
    const imagePath = path.join(SHOWCASE_PATH, format);
    if (fs.existsSync(imagePath)) {
      return `/api/images/showcase/${format}`;
    }
  }
  return null;
}
```

**Get all banner images:**
```typescript
function getBannerImages(): string[] {
  const files = fs.readdirSync(SHOWCASE_PATH);
  return files
    .filter(file => file.startsWith('banner-'))
    .filter(file => /\.(png|jpg|jpeg|gif|webp)$/i.test(file))
    .map(file => `/api/images/showcase/${file}`);
}
```

---

## Design Considerations

### Hero Section Layout:

```
┌─────────────────────────────────────────┐
│                                         │
│         [HERO IMAGE BACKGROUND]         │
│                                         │
│    ┌──────────────────────────┐        │
│    │  [Dark Overlay Layer]    │        │
│    │                           │        │
│    │  Company Name (Large)     │        │
│    │  Tagline (Medium)         │        │
│    │  [Browse Collections CTA] │        │
│    │                           │        │
│    └──────────────────────────┘        │
│                                         │
└─────────────────────────────────────────┘
```

### Color Overlay:
- Add semi-transparent dark overlay (rgba(0,0,0,0.4))
- Ensures text is readable over any image
- Adjust opacity based on image brightness

### Text Placement:
- Center horizontally
- Centered or slightly above center vertically
- White or light-colored text for contrast
- Clear, large typography

### Responsive Behavior:
- Desktop: Full hero height (600px)
- Tablet: Medium height (400px)
- Mobile: Reduced height (300px), may hide image on some designs

---

## Examples

### Example 1: Photo hero
```
ShowcasePhotos/
└── hero.jpg        (1920x600px, lifestyle photo, 450KB)
```

### Example 2: Complete showcase setup
```
ShowcasePhotos/
├── hero.jpg           (Main hero image)
├── banner-1.jpg       (Seasonal promotion)
├── banner-2.png       (Collection highlight)
└── banner-holiday.jpg (Holiday special)
```

### Example 3: Mixed formats
```
ShowcasePhotos/
├── hero.png           (PNG with transparency overlay)
├── banner-1.jpg       (Photo banner)
└── banner-2.png       (Graphic banner)
```

---

## Troubleshooting

**Hero image not appearing?**
- Ensure file is named exactly `hero.png` or `hero.jpg`
- Verify file is in `ShowcasePhotos/` folder
- Check that API route is implemented
- Verify homepage has hero section implementation
- Clear browser cache and restart server

**Image looks blurry?**
- Use higher resolution source (min 1920px wide)
- Check image quality settings (JPG 80-85%)
- Verify image isn't being scaled up excessively

**Page loads slowly?**
- Compress images (use TinyPNG, Squoosh)
- Target under 500KB for hero image
- Consider using JPG instead of PNG
- Implement lazy loading for banners

**Image doesn't look good on mobile?**
- Keep important content in center of image
- Test on various screen sizes
- Consider using art direction (different image for mobile)
- Adjust CSS background-position for mobile

---

## Best Practices

1. **Always optimize images** - Use compression tools before uploading
2. **Use descriptive filenames** - `banner-holiday-sale.jpg` not `image1.jpg`
3. **Test on multiple devices** - Desktop, tablet, mobile
4. **Keep backups** - Save original high-res versions elsewhere
5. **Update seasonally** - Refresh hero image to keep site current
6. **Brand consistency** - Use on-brand colors and style
7. **Professional quality** - Invest in good photography or graphics
8. **Accessibility** - Ensure sufficient text contrast with overlays

---

## Next Steps

**For Developers/AI:**
1. Implement API route for serving showcase images
2. Update homepage with hero section
3. Add getShowcaseImages() to lib/design.ts
4. Style hero section responsively
5. Add banner display functionality (future)
6. Test on multiple devices and browsers

**For Content Managers:**
1. Prepare high-quality hero image
2. Optimize image file size
3. Name as `hero.jpg` or `hero.png`
4. Place in this folder
5. Test on live site
6. Update seasonally as needed
