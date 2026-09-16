# Design Details Folder

## Overview
This folder contains text files that define your company's branding, including the company name, color scheme, and key descriptions used throughout the website.

## Required Files

```
Details/
├── README.md           # This file
├── CompanyName.txt     # Your company name (REQUIRED)
├── Colors.txt          # Color scheme (REQUIRED)
└── Descriptions.txt    # Taglines and descriptions (REQUIRED)
```

## File Formats

### CompanyName.txt

**Format:** Single line of text
**Purpose:** Your company name appears in headers, page titles, and throughout the site

**Example:**
```
Whiskers & Co. B2B Supply
```

**Rules:**
- One line only
- No special formatting
- Can include letters, numbers, spaces, ampersands, periods
- Trailing whitespace will be removed automatically

**Where it appears:**
- Website header/navigation
- Browser tab title (e.g., "Product Name | Your Company")
- Homepage hero section
- Footer

---

### Colors.txt

**Format:** Key-value pairs (key: value)
**Purpose:** Define the color scheme used throughout the entire website

**Example:**
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

**Required Keys:**
- `primary` - Main brand color (headers, important elements)
- `secondary` - Secondary brand color (buttons, CTAs)
- `accent` - Accent color (highlights, links)
- `background` - Page background color
- `text` - Main text color
- `textLight` - Secondary text color (less important text)
- `border` - Border and divider color
- `success` - Success messages and indicators

**Format Rules:**
- Each color on its own line
- Format: `key: value`
- Key must match exactly (case-sensitive)
- Value must be a hex color code (#RRGGBB)
- Hex codes must start with #
- Use 6-digit hex codes (3-digit shorthand not supported)
- Lines starting with # are comments (ignored)
- Blank lines are ignored

**Valid hex color examples:**
```
#000000  (black)
#ffffff  (white)
#1a1a1a  (dark gray)
#ff6600  (orange)
#4a90e2  (blue)
```

**Where colors appear:**
- `primary`: H1, H2, H3 headings, collection names, product titles
- `secondary`: Buttons (Browse Collections, Add to Cart, Checkout)
- `accent`: Links, interactive elements
- `background`: Page backgrounds, card backgrounds
- `text`: Body text, descriptions, details
- `textLight`: Subtitles, secondary information, product counts
- `border`: Card borders, input borders, dividers
- `success`: Order success messages, confirmation indicators

---

### Descriptions.txt

**Format:** Key-value pairs (key: value)
**Purpose:** Define taglines, about text, and footer content

**Example:**
```
tagline: Purr-fect wholesale products for discerning businesses
about: Whiskers & Co. B2B Supply is your premier source for high-quality pet products and accessories. We specialize in providing wholesale solutions to retailers, boutiques, and e-commerce businesses. Our carefully curated selection combines style, functionality, and competitive pricing to help your business thrive.
footer: © 2026 Whiskers & Co. B2B Supply. All rights reserved.
```

**Required Keys:**
- `tagline` - Homepage hero subtitle (short, catchy phrase)
- `about` - About section content (longer description)
- `footer` - Footer copyright/legal text

**Format Rules:**
- Each description starts with key: (on the same line)
- Value follows the colon on the same line
- Multi-line values: Continue on same line or use proper escaping
- Lines starting with # are comments (ignored)
- Blank lines are ignored

**Content Guidelines:**

**tagline:**
- Keep it short (1-2 sentences, ~10-20 words)
- Catchy and memorable
- Describes your value proposition
- Example: "Premium wholesale products for modern retailers"

**about:**
- Longer description (2-4 sentences, ~50-100 words)
- Tells your company story
- Explains what makes you unique
- Describes your target customers
- Can mention product quality, service, values

**footer:**
- Copyright notice
- Current year
- Company name
- Legal text (optional)
- Keep it concise

**Where descriptions appear:**
- `tagline`: Homepage hero section (below company name)
- `about`: Homepage about section (dedicated section)
- `footer`: Bottom of every page

---

## How to Edit

### Changing Company Name
1. Open `CompanyName.txt` in a text editor
2. Replace the entire content with your company name
3. Save the file
4. Changes appear on next page load

### Updating Colors
1. Open `Colors.txt` in a text editor
2. Modify the hex color values (keep the # symbol)
3. Maintain the `key: value` format
4. Save the file
5. Restart development server to see changes

### Modifying Descriptions
1. Open `Descriptions.txt` in a text editor
2. Update the value after the colon
3. Keep each key: value on the same line
4. Save the file
5. Changes appear on next page load

## For AI Assistants

When modifying these files:

### Before Editing:
1. **Always read the existing file first** to understand current content
2. **Preserve the format** - Don't change file structure
3. **Validate hex colors** - Ensure they start with # and are 6 digits
4. **Check for typos** - Key names must match exactly

### Colors.txt Parsing:
```typescript
// The system parses Colors.txt like this:
const line = "primary: #1a1a1a"
const colonIndex = line.indexOf(':')
const key = line.substring(0, colonIndex).trim()  // "primary"
const value = line.substring(colonIndex + 1).trim()  // "#1a1a1a"
```

### Descriptions.txt Parsing:
```typescript
// Same parsing logic as Colors.txt
const line = "tagline: Your tagline here"
const colonIndex = line.indexOf(':')
const key = line.substring(0, colonIndex).trim()  // "tagline"
const value = line.substring(colonIndex + 1).trim()  // "Your tagline here"
```

### Common Mistakes to Avoid:
- ❌ Using `=` instead of `:` (wrong: `primary= #1a1a1a`)
- ❌ Forgetting `#` in hex codes (wrong: `primary: 1a1a1a`)
- ❌ Using 3-digit hex codes (wrong: `primary: #fff`)
- ❌ Wrong key names (wrong: `primaryColor:` instead of `primary:`)
- ❌ Putting value on next line (must be on same line as key)

### Validation Checklist:
- [ ] File names match exactly (case-sensitive)
- [ ] Key names match required keys
- [ ] Hex colors have # prefix
- [ ] Hex colors are 6 digits (lowercase or uppercase OK)
- [ ] Format is `key: value` with colon and space
- [ ] CompanyName.txt has only one line
- [ ] All required keys present in Colors.txt
- [ ] All required keys present in Descriptions.txt

## Default Values

If files are missing or invalid, these defaults are used:

**CompanyName.txt default:**
```
B2B Storefront
```

**Colors.txt defaults:**
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

**Descriptions.txt defaults:**
```
tagline: Quality products for your business
about: We provide quality products for businesses.
footer: © 2026 All rights reserved.
```

## Troubleshooting

**Colors not applying?**
- Check that hex codes start with #
- Verify 6-digit format (not 3-digit)
- Ensure key: value format with colon
- Restart development server

**Company name not showing?**
- Check file is named exactly `CompanyName.txt`
- Ensure file is not empty
- Verify no extra characters/formatting

**Descriptions not appearing?**
- Check key names match exactly (tagline, about, footer)
- Ensure format is `key: value` on same line
- Verify file is named exactly `Descriptions.txt`

## Testing Changes

After editing:
1. Save all files
2. Restart development server (if running)
3. Visit homepage to verify changes
4. Check multiple pages to ensure consistent branding
5. Verify colors appear correctly throughout site
