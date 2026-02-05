# Logos Folder

## Overview
This folder contains your company logos and favicon (browser tab icon) used throughout the website.

## File Structure

```
Logos/
├── README.md                          # This file
├── logo.png or logo.jpg               # Main logo (REQUIRED)
├── logo-white.png or logo-white.jpg   # White/light logo variant (OPTIONAL)
└── favicon.ico                        # Browser tab icon (OPTIONAL)
```

## Required Files

### logo.png OR logo.jpg (REQUIRED)

**Purpose:** Main company logo displayed in the website header

**Specifications:**
- **Filename:** Exactly `logo.png` or `logo.jpg` (lowercase)
- **Format:** PNG (recommended) or JPG
- **Recommended Size:** 200-400px width, height proportional
- **Aspect Ratio:** Typically wide/horizontal (e.g., 300x80px)
- **Background:** Transparent (PNG) or white (JPG)
- **Color:** Full color or dark color (displays on light backgrounds)
- **File Size:** Keep under 500KB for fast loading

**PNG vs JPG:**
- **PNG (recommended):** Supports transparency, sharp edges, perfect for logos
- **JPG:** Smaller file size, but no transparency, best if logo has no transparent areas

**Design Guidelines:**
- Clear and legible at small sizes
- Works well on light/white backgrounds
- Professional appearance
- Avoid very thin lines that may not display well

**Where it appears:**
- Website header (top-left on every page)
- Scales automatically based on viewport
- Links to homepage when clicked

---

## Optional Files

### logo-white.png OR logo-white.jpg (OPTIONAL)

**Purpose:** White or light-colored logo variant for dark backgrounds

**Specifications:**
- **Filename:** Exactly `logo-white.png` or `logo-white.jpg` (lowercase)
- **Format:** PNG (recommended) or JPG
- **Size:** Match dimensions of main logo
- **Background:** Transparent (PNG) or dark (JPG)
- **Color:** White, light gray, or light colored version of your logo

**When to use:**
- If you have sections with dark backgrounds
- For email templates with dark themes
- For future dark mode support

**Not currently implemented but prepared for:**
- Dark navigation bars
- Footer logos on dark backgrounds
- Dark mode toggle (future feature)

---

### favicon.ico (OPTIONAL)

**Purpose:** Small icon displayed in browser tabs, bookmarks, and history

**Specifications:**
- **Filename:** Exactly `favicon.ico` (lowercase)
- **Format:** ICO (icon format)
- **Size:** 16x16px and 32x32px (multi-size ICO recommended)
- **Design:** Simplified version of logo, recognizable at tiny sizes

**How to create a favicon:**
1. Start with your logo
2. Simplify to work at 16x16px (remove fine details)
3. Use solid colors (avoid gradients at tiny size)
4. Convert to ICO format using online tool or image editor
5. Create multi-size ICO with 16x16 and 32x32 versions

**Recommended Tools:**
- favicon.io (online generator)
- RealFaviconGenerator.net
- GIMP (save as ICO)
- Photoshop (with ICO plugin)

**Where it appears:**
- Browser tab
- Bookmarks bar
- Browser history
- Mobile home screen (some browsers)

---

## Supported Image Formats

The system automatically detects and supports:
- `.png` - Portable Network Graphics (recommended for logos)
- `.jpg` / `.jpeg` - JPEG (alternative option)

**PNG vs JPG for Logos:**

| Feature | PNG | JPG |
|---------|-----|-----|
| Transparency | ✅ Yes | ❌ No |
| Sharp edges | ✅ Perfect | ⚠️ Slight blur |
| File size | Larger | Smaller |
| Best for | Logos, graphics, icons | Photographs |
| Recommendation | ✅ **Use PNG** | ⚠️ Only if no transparency needed |

---

## How to Add/Replace Logos

### Adding Main Logo:
1. Prepare your logo file (PNG recommended)
2. Resize to approximately 300px wide (maintain aspect ratio)
3. Name the file exactly `logo.png` or `logo.jpg`
4. Place in this folder (`DATABASE/Design/Logos/`)
5. If replacing existing logo, delete or rename old file
6. Refresh website to see changes

### Adding White Logo Variant:
1. Create white/light version of your logo
2. Resize to match main logo dimensions
3. Name the file exactly `logo-white.png` or `logo-white.jpg`
4. Place in this folder
5. Currently optional for future use

### Adding Favicon:
1. Create or generate favicon.ico file
2. Name it exactly `favicon.ico`
3. Place in this folder
4. Restart development server
5. Clear browser cache to see changes
6. Check browser tab for new icon

---

## File Name Requirements

**CRITICAL:** File names are case-sensitive and must match exactly:

✅ **Correct:**
- `logo.png`
- `logo.jpg`
- `logo-white.png`
- `logo-white.jpg`
- `favicon.ico`

❌ **Wrong (will not work):**
- `Logo.png` (capital L)
- `LOGO.PNG` (all caps)
- `logo.PNG` (extension capitalized)
- `company-logo.png` (wrong name)
- `logo_white.png` (underscore instead of hyphen)
- `favicon.png` (wrong format)

---

## Implementation Details

### Code Implementation:
```typescript
// From lib/design.ts
function getLogoPath(filename: string): string | null {
  const logoPath = path.join(DESIGN_PATH, 'Logos', filename);
  if (fs.existsSync(logoPath)) {
    return `/api/images/logos/${filename}`;
  }
  return null;
}

// Logo paths returned in design data:
logoPath: getLogoPath('logo.png')           // Main logo
logoWhitePath: getLogoPath('logo-white.png')  // White logo variant
faviconPath: getLogoPath('favicon.ico')       // Favicon
```

### API Endpoint:
- Route: `/api/images/logos/[filename]`
- Serves files from this folder
- Handles PNG and JPG automatically
- Location: `app/api/images/logos/[filename]/route.ts`

---

## For AI Assistants

When working with logos:

### Before Adding/Modifying:
1. **Check existing files:**
   ```bash
   ls -la DATABASE/Design/Logos/
   ```

2. **Verify format support:**
   - Look for either `.png` or `.jpg` extension
   - Both formats work interchangeably
   - PNG preferred for transparency

3. **Follow exact naming:**
   - `logo.png` OR `logo.jpg` (not both, choose one)
   - `logo-white.png` OR `logo-white.jpg` (optional)
   - `favicon.ico` (optional)

### When Creating Logo API Route:
```typescript
// Should support both PNG and JPG
const logoFiles = ['logo.png', 'logo.jpg', 'logo-white.png', 'logo-white.jpg'];
// Check for whichever exists
```

### Validation Checklist:
- [ ] File name exactly matches (case-sensitive)
- [ ] File is in correct folder (Logos/)
- [ ] File extension is lowercase
- [ ] Image file is not corrupted
- [ ] PNG files have proper transparency (if needed)
- [ ] Logo dimensions are reasonable (not too small/large)
- [ ] File size is under 500KB

### Common Tasks:

**Replace existing logo:**
```typescript
// 1. Read existing file
const files = fs.readdirSync('DATABASE/Design/Logos/');
// 2. Find logo.png or logo.jpg
// 3. Delete or rename old file
// 4. Add new file with correct name
```

**Check which format exists:**
```typescript
const hasPNG = fs.existsSync('DATABASE/Design/Logos/logo.png');
const hasJPG = fs.existsSync('DATABASE/Design/Logos/logo.jpg');
```

---

## Troubleshooting

**Logo not appearing on website?**
- Check file is named exactly `logo.png` or `logo.jpg` (lowercase)
- Verify file is in `DATABASE/Design/Logos/` folder
- Ensure image file is not corrupted (try opening in image viewer)
- Check file permissions (should be readable)
- Restart development server

**Favicon not showing in browser tab?**
- Must be named exactly `favicon.ico`
- ICO format required (not PNG or JPG)
- Clear browser cache after adding
- Restart development server
- May take a few minutes to update

**Logo appears distorted/pixelated?**
- Use larger source image (at least 300px wide)
- Use PNG format for sharp edges
- Avoid very small images (minimum 200px wide)
- Check original image quality

**Logo has white background (should be transparent)?**
- Convert to PNG format
- Use image editor to remove background
- Save with transparency enabled
- Replace JPG with PNG version

**File size too large?**
- Optimize image using online tool (TinyPNG, Squoosh.app)
- Reduce dimensions if very large
- For logos, aim for under 100KB
- PNG can be compressed without quality loss

---

## Examples

### Good Logo Setup:
```
Logos/
├── logo.png              (300x80px, transparent, 45KB)
├── logo-white.png        (300x80px, transparent, 48KB)
└── favicon.ico           (16x16, 32x32 multi-size, 5KB)
```

### Minimal Setup (Main logo only):
```
Logos/
└── logo.png              (300x80px, transparent, 45KB)
```

### Alternative with JPG:
```
Logos/
├── logo.jpg              (300x80px, white background, 32KB)
└── favicon.ico           (16x16, 32x32, 5KB)
```

---

## Testing Changes

After adding or replacing logos:

1. **Check file exists:**
   ```bash
   ls -la DATABASE/Design/Logos/logo.png
   ```

2. **Verify API endpoint:**
   - Visit: `http://localhost:3000/api/images/logos/logo.png`
   - Should display your logo

3. **Check website header:**
   - Visit homepage
   - Logo should appear in top-left corner
   - Should be clickable (links to homepage)
   - Should scale properly on mobile

4. **Test favicon:**
   - Look at browser tab
   - Should show custom icon
   - May need to clear cache

5. **Test all pages:**
   - Logo should appear on all pages
   - Should maintain aspect ratio
   - Should link back to homepage
