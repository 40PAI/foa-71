# Design System Documentation

## Overview
This document describes the comprehensive design system implemented across the application, ensuring consistency, accessibility, and maintainability.

## Design Principles

### 1. Consistency
- All components use semantic tokens from the design system
- Colors, spacing, and typography follow a unified scale
- Components have predictable behavior across themes

### 2. Accessibility
- WCAG 2.1 AA compliance as minimum standard
- Proper focus states and keyboard navigation
- High contrast support for better readability
- Screen reader friendly markup

### 3. Performance
- Optimized animations and transitions
- Responsive images and lazy loading
- Minimal CSS bloat through utility-first approach

### 4. Responsiveness
- Mobile-first approach
- Fluid typography and spacing
- Adaptive layouts for all screen sizes

## Color System

### Semantic Colors (HSL)
All colors are defined in HSL format for consistency and easy theming:

```css
/* Primary Colors */
--primary: 213 47% 34%           /* Main brand color */
--primary-foreground: 210 40% 98% /* Text on primary */

/* Functional Colors */
--success: 142 76% 36%           /* Success states */
--warning: 38 92% 50%            /* Warning states */
--destructive: 0 84.2% 60.2%     /* Error/destructive states */
--info: 221 83% 53%              /* Informational states */

/* Surface Colors */
--background: 0 0% 100%          /* Page background */
--card: 0 0% 100%                /* Card background */
--surface: 0 0% 98%              /* Alternative surface */
--elevated: 0 0% 100%            /* Elevated surfaces */
```

### Chart Colors
Contextual colors for data visualization:
- `--chart-1`: Blue - Planned/Budgeted
- `--chart-2`: Orange - Actual/Spent
- `--chart-3`: Green - Completed/Approved
- `--chart-4`: Yellow - In Progress
- `--chart-5`: Red - Delayed/Critical
- `--chart-6`: Purple - Premium/Special

### Status Colors
Colors mapped to specific business states:
- Financial: Orange (`--color-financeiro`)
- Materials: Blue (`--color-material`)
- Labor: Green (`--color-mao-obra`)
- Assets: Purple (`--color-patrimonio`)
- Indirect: Yellow (`--color-indiretos`)

## Typography

### Font Scale
Responsive typography using `clamp()` for fluid sizing:

```css
.text-responsive-h1: clamp(1.875rem, 2vw + 1rem, 3rem)
.text-responsive-h2: clamp(1.5rem, 1.5vw + 0.75rem, 2.25rem)
.text-responsive-h3: clamp(1.25rem, 1vw + 0.5rem, 1.875rem)
.text-responsive-body: clamp(0.875rem, 0.5vw + 0.5rem, 1rem)
.text-responsive-small: clamp(0.75rem, 0.25vw + 0.5rem, 0.875rem)
```

### Usage
```tsx
<h1 className="text-responsive-h1">Main Heading</h1>
<h2 className="text-responsive-h2">Section Heading</h2>
<p className="text-responsive-body">Body text</p>
```

## Spacing System

### Scale
```css
--spacing-xs: 0.25rem   /* 4px */
--spacing-sm: 0.5rem    /* 8px */
--spacing-md: 1rem      /* 16px */
--spacing-lg: 1.5rem    /* 24px */
--spacing-xl: 2rem      /* 32px */
--spacing-2xl: 3rem     /* 48px */
--spacing-3xl: 4rem     /* 64px */
```

### Utilities
- `.space-y-responsive`: Responsive vertical spacing
- `.space-x-responsive`: Responsive horizontal spacing
- `.gap-responsive`: Responsive gap for flex/grid
- `.section-padding`: Standard section padding

## Component Variants

### Button Variants
```tsx
// Standard variants
<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Extended variants
<Button variant="success">Success</Button>
<Button variant="warning">Warning</Button>
<Button variant="info">Info</Button>
<Button variant="gradient">Gradient</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra Large</Button>
<Button size="icon">Icon</Button>
```

### Badge Variants
```tsx
<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="info">Info</Badge>
```

### Alert Variants
```tsx
<Alert variant="default">Default Alert</Alert>
<Alert variant="destructive">Error Alert</Alert>
<Alert variant="success">Success Alert</Alert>
<Alert variant="warning">Warning Alert</Alert>
<Alert variant="info">Info Alert</Alert>
```

### Card Variants
Custom card variants via utility classes:
```tsx
<Card className="card-elevated">Elevated Card</Card>
<Card className="card-surface">Surface Card</Card>
<Card className="card-outlined">Outlined Card</Card>
<Card className="card-hover">Hover Effect Card</Card>
```

## Animation System

### Timing Functions
```css
--transition-fast: 150ms    /* Quick interactions */
--transition-base: 200ms    /* Standard transitions */
--transition-slow: 300ms    /* Deliberate animations */
--transition-slower: 500ms  /* Emphasis animations */
```

### Utilities
- `.interactive`: Scale effect on hover/active
- `.interactive-subtle`: Subtle background change
- `.skeleton`: Loading skeleton animation
- `.shimmer`: Shimmer loading effect

## Shadow System
```css
--shadow-sm: Subtle shadow for small elements
--shadow-base: Standard card shadow
--shadow-md: Medium elevation
--shadow-lg: High elevation
--shadow-xl: Very high elevation
--shadow-2xl: Maximum elevation
--shadow-inner: Inset shadow
```

## Layout Utilities

### Containers
```tsx
<div className="container-responsive">Responsive Container</div>
<div className="section-padding">Section with padding</div>
```

### Grids
```tsx
<div className="grid-responsive">Auto-responsive grid</div>
<div className="grid-adaptive">Adaptive grid</div>
```

### Flex Utilities
```tsx
<div className="flex-center">Centered content</div>
<div className="flex-between">Space between</div>
<div className="stack-mobile">Stack on mobile</div>
```

## Theming

### Light & Dark Mode
The design system fully supports light and dark modes through CSS variables. All components automatically adapt to the current theme.

```tsx
import { useTheme } from "@/contexts/ThemeContext";

function MyComponent() {
  const { theme, setTheme, isDark, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      Toggle Theme
    </button>
  );
}
```

### Theme Toggle Component
```tsx
import { ThemeToggle } from "@/components/ui/theme-toggle";

<ThemeToggle />
```

## Accessibility

### Focus States
All interactive elements have visible focus states:
- `.focus-ring`: Standard focus ring
- `.focus-ring-inset`: Inset focus ring

### Screen Readers
- Use semantic HTML elements
- Include `sr-only` classes for screen reader-only content
- Proper ARIA labels and roles

### Keyboard Navigation
- All interactive elements are keyboard accessible
- Logical tab order
- Escape key closes modals and popovers

## Responsive Design

### Breakpoints
```
Mobile: < 768px
Tablet: 768px - 1023px
Desktop: 1024px - 1535px
Large Desktop: ≥ 1536px
```

### Mobile-First Utilities
```tsx
<div className="mobile-only">Mobile Only</div>
<div className="desktop-only">Desktop Only</div>
<div className="tablet-only">Tablet Only</div>
```

## Best Practices

### ✅ DO
- Use semantic tokens (e.g., `bg-primary`) instead of direct colors
- Use responsive utilities for spacing and typography
- Test components in both light and dark modes
- Ensure proper contrast ratios (WCAG AA minimum)
- Use appropriate variants for semantic meaning

### ❌ DON'T
- Use hardcoded colors like `text-white` or `bg-blue-500`
- Mix different spacing scales arbitrarily
- Forget to test keyboard navigation
- Override component styles with `!important`
- Create custom colors outside the design system

## File Structure
```
src/
├── index.css              # Base styles and responsive typography
├── styles/
│   ├── design-system.css  # Design tokens and component variants
│   └── status-theme.css   # Status-specific theming
├── components/ui/         # UI component library
└── contexts/
    └── ThemeContext.tsx   # Theme management
```

## Usage Examples

### Complete Button Example
```tsx
import { Button } from "@/components/ui/button";

<div className="flex-center gap-responsive">
  <Button variant="default" size="lg">
    Primary Action
  </Button>
  <Button variant="success" size="default">
    Confirm
  </Button>
  <Button variant="outline" size="sm">
    Cancel
  </Button>
</div>
```

### Complete Card Example
```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

<Card className="card-hover">
  <CardHeader>
    <div className="flex-between">
      <CardTitle className="text-responsive-h3">Project Name</CardTitle>
      <Badge variant="success">Active</Badge>
    </div>
  </CardHeader>
  <CardContent className="space-y-responsive">
    <p className="text-responsive-body">Project description...</p>
  </CardContent>
</Card>
```

### Responsive Layout Example
```tsx
<section className="section-padding">
  <div className="container-responsive">
    <h2 className="text-responsive-h2 mb-6">Section Title</h2>
    <div className="grid-responsive">
      {/* Grid items auto-adapt to screen size */}
    </div>
  </div>
</section>
```

## Maintenance

### Adding New Colors
1. Define HSL values in `index.css` `:root` and `.dark`
2. Add to `tailwind.config.ts` colors extend
3. Document in this file
4. Create utility classes if needed

### Adding New Components
1. Use existing components as templates
2. Implement all variants using `cva`
3. Ensure light/dark mode support
4. Add proper TypeScript types
5. Document usage examples

### Updating Existing Components
1. Test changes in both themes
2. Verify responsive behavior
3. Check accessibility
4. Update documentation
5. Test across browsers

## Resources
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/docs/primitives)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [HSL Color Picker](https://hslpicker.com/)
