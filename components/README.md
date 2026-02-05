# Components Folder

## Overview
This folder contains reusable React components used throughout the B2B storefront. These components are shared across multiple pages and maintain consistent UI/UX.

## Current Components

```
components/
├── README.md    # This file
├── Header.tsx   # Site header with navigation and cart
└── Footer.tsx   # Site footer with copyright
```

## Header.tsx

**Purpose:** Site-wide header with logo, navigation, and shopping cart indicator

### Props:

```typescript
interface HeaderProps {
  companyName: string;     // Company name (fallback if no logo)
  logoPath: string | null; // Path to logo image or null
  primaryColor: string;    // Background color (hex)
  secondaryColor: string;  // Cart button color (hex)
}
```

### Features:

1. **Logo Display:**
   - Shows company logo if `logoPath` provided
   - Falls back to company name text if no logo
   - Logo links to homepage
   - Auto-sized to 40px height

2. **Navigation Links:**
   - Home (/)
   - Collections (/collections)
   - White text with hover opacity effect

3. **Shopping Cart Button:**
   - Displays cart icon
   - Shows item count (number of boxes)
   - Links to /cart
   - Styled with secondary color
   - Updates in real-time when cart changes

4. **Cart Count Updates:**
   - Listens for 'cartUpdated' events
   - Automatically refreshes count
   - Works across page navigation

5. **Sticky Header:**
   - Stays at top when scrolling
   - Z-index: 50 (above most content)
   - Drop shadow for visual separation

### Usage:

```typescript
import Header from '@/components/Header';
import { getDesignData } from '@/lib/design';

export default function Layout() {
  const design = getDesignData();

  return (
    <>
      <Header
        companyName={design.companyName}
        logoPath={design.logoPath}
        primaryColor={design.colors.primary}
        secondaryColor={design.colors.secondary}
      />
      {/* Page content */}
    </>
  );
}
```

### Styling:

- **Container:** max-width with padding, centered
- **Background:** Primary color from design
- **Text:** White for visibility on dark background
- **Hover Effects:** 80% opacity on links, 90% on cart button
- **Responsive:** Flexbox layout, works on mobile

### Client Component:

- Uses `'use client'` directive
- Requires client-side for cart state
- Uses React hooks (useState, useEffect)
- Accesses localStorage via getCart()

### Event Handling:

Dispatch cart update event after cart modifications:
```typescript
// In your cart modification code
import { addToCart } from '@/lib/cart';

const cart = addToCart(...);
window.dispatchEvent(new Event('cartUpdated'));
```

---

## Footer.tsx

**Purpose:** Site-wide footer with copyright/legal text

### Props:

```typescript
interface FooterProps {
  footerText: string;    // Copyright/legal text
  primaryColor: string;  // Background color (hex)
}
```

### Features:

1. **Copyright Text:**
   - Centered display
   - White text for visibility
   - Small text size (text-sm)

2. **Styling:**
   - Primary color background
   - Padding for spacing
   - Full-width container
   - Margin-top auto (pushes to bottom)

### Usage:

```typescript
import Footer from '@/components/Footer';
import { getDesignData } from '@/lib/design';

export default function Layout() {
  const design = getDesignData();

  return (
    <>
      {/* Page content */}
      <Footer
        footerText={design.descriptions.footer}
        primaryColor={design.colors.primary}
      />
    </>
  );
}
```

### Styling:

- **Background:** Primary color from design
- **Text:** White, centered, small size
- **Layout:** Full-width, auto-pushed to bottom
- **Padding:** py-8 (vertical padding)

### Server Component:

- No 'use client' directive
- Pure presentational component
- No client-side state or effects
- Can be rendered server-side

---

## Creating New Components

### Component Template:

```typescript
// components/MyComponent.tsx

interface MyComponentProps {
  title: string;
  description: string;
  color?: string;
}

export default function MyComponent({
  title,
  description,
  color = '#000000'
}: MyComponentProps) {
  return (
    <div className="p-4" style={{ backgroundColor: color }}>
      <h2 className="text-2xl font-bold">{title}</h2>
      <p>{description}</p>
    </div>
  );
}
```

### Client Component Template:

```typescript
// components/InteractiveComponent.tsx
'use client';

import { useState } from 'react';

interface InteractiveComponentProps {
  initialValue: number;
}

export default function InteractiveComponent({
  initialValue
}: InteractiveComponentProps) {
  const [count, setCount] = useState(initialValue);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
```

---

## Component Best Practices

### 1. Props Interface
Always define TypeScript interface for props:
```typescript
interface MyComponentProps {
  required: string;
  optional?: number;
}
```

### 2. Default Props
Use default parameters for optional props:
```typescript
function MyComponent({
  required,
  optional = 10
}: MyComponentProps) {
  // ...
}
```

### 3. Client vs Server Components

**Use Server Component (default) when:**
- No interactivity needed
- No browser APIs (localStorage, window)
- No React hooks (useState, useEffect)
- Pure rendering

**Use Client Component ('use client') when:**
- Interactive features (buttons, forms)
- Using React hooks
- Accessing browser APIs
- Managing client state

### 4. Styling

**Use Tailwind classes:**
```typescript
<div className="container mx-auto px-4 py-8">
```

**Use inline styles for dynamic colors:**
```typescript
<div style={{ backgroundColor: design.colors.primary }}>
```

**Combine both:**
```typescript
<button
  className="px-6 py-2 text-white rounded"
  style={{ backgroundColor: design.colors.secondary }}
>
```

### 5. Accessibility

**Use semantic HTML:**
```typescript
<header>...</header>
<nav>...</nav>
<main>...</main>
<footer>...</footer>
```

**Add ARIA labels when needed:**
```typescript
<button aria-label="Add to cart">
  <ShoppingCartIcon />
</button>
```

**Ensure keyboard navigation:**
```typescript
<Link href="/page">Accessible Link</Link>
```

### 6. Reusability

**Make components flexible:**
```typescript
// Bad: Hardcoded values
function Button() {
  return <button className="bg-blue-500">Click</button>;
}

// Good: Configurable
function Button({ color, children, onClick }: ButtonProps) {
  return (
    <button
      className="px-4 py-2 rounded"
      style={{ backgroundColor: color }}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

### 7. Performance

**Optimize images:**
```typescript
import Image from 'next/image';

<Image
  src="/path/to/image.png"
  alt="Description"
  width={500}
  height={300}
/>
```

**Memoize expensive operations:**
```typescript
import { useMemo } from 'react';

const expensiveValue = useMemo(() => {
  return complexCalculation(data);
}, [data]);
```

---

## Suggested New Components

### ProductCard
**Purpose:** Reusable product display card

```typescript
interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => void;
}
```

**Features:**
- Product image
- Name, SKU, price
- Add to cart button
- Link to product page

---

### LoadingSpinner
**Purpose:** Loading state indicator

```typescript
interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}
```

**Features:**
- Animated spinner
- Configurable size and color
- Centered display

---

### Modal
**Purpose:** Popup/overlay for confirmations, forms

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}
```

**Features:**
- Overlay background
- Close button
- Trap focus inside modal
- ESC key to close

---

### Breadcrumb
**Purpose:** Navigation breadcrumb trail

```typescript
interface BreadcrumbProps {
  items: Array<{
    label: string;
    href: string;
  }>;
}
```

**Features:**
- Shows navigation path
- Links to parent pages
- Current page highlighted

---

### SearchBar
**Purpose:** Product search functionality

```typescript
interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}
```

**Features:**
- Input field
- Search icon
- Debounced search
- Clear button

---

## For AI Assistants

### Creating Components Checklist:

- [ ] Define Props interface with TypeScript
- [ ] Use 'use client' only if needed
- [ ] Apply Tailwind classes for styling
- [ ] Use design colors from props/context
- [ ] Make component reusable and flexible
- [ ] Add proper TypeScript types
- [ ] Consider accessibility (ARIA, semantic HTML)
- [ ] Optimize performance (memoization if needed)
- [ ] Test on different screen sizes
- [ ] Document props and usage

### Common Patterns:

**Conditional Rendering:**
```typescript
{logoPath ? (
  <img src={logoPath} alt="Logo" />
) : (
  <span>{companyName}</span>
)}
```

**Mapping Arrays:**
```typescript
{items.map(item => (
  <div key={item.id}>
    {item.name}
  </div>
))}
```

**Event Handlers:**
```typescript
const handleClick = () => {
  // Do something
};

<button onClick={handleClick}>Click</button>
```

**Conditional Classes:**
```typescript
<div className={`base-class ${isActive ? 'active' : 'inactive'}`}>
```

---

## Integration with Design System

All components should use design data from `getDesignData()`:

```typescript
import { getDesignData } from '@/lib/design';

export default function MyComponent() {
  const design = getDesignData();

  return (
    <div style={{ backgroundColor: design.colors.background }}>
      <h1 style={{ color: design.colors.primary }}>
        {design.companyName}
      </h1>
    </div>
  );
}
```

**Available Colors:**
- `design.colors.primary` - Headers, main elements
- `design.colors.secondary` - Buttons, CTAs
- `design.colors.accent` - Links, highlights
- `design.colors.background` - Backgrounds
- `design.colors.text` - Body text
- `design.colors.textLight` - Secondary text
- `design.colors.border` - Borders, dividers
- `design.colors.success` - Success messages

---

## Testing Components

### Manual Testing:
1. Test on different screen sizes (mobile, tablet, desktop)
2. Test with different data (long text, no data, etc.)
3. Test interactions (clicks, hovers, keyboard)
4. Test accessibility (screen reader, keyboard navigation)
5. Test performance (large datasets, rapid interactions)

### Browser Testing:
- Chrome
- Firefox
- Safari
- Edge
- Mobile browsers

---

## Next Steps

### Immediate:
1. Use existing Header and Footer components
2. Ensure consistent styling across pages
3. Test cart count updates

### Future Enhancements:
1. Create ProductCard component
2. Add LoadingSpinner for async operations
3. Implement Modal for confirmations
4. Add Breadcrumb navigation
5. Create SearchBar component
6. Build form components (Input, Select, etc.)
7. Add Toast/Notification component
8. Create Layout wrapper component
9. Build admin components (if admin panel needed)
10. Add dark mode support (toggle component)

### Documentation:
- Document each new component in this README
- Add usage examples
- Include props table
- Show screenshots (optional)
- Link to related components
