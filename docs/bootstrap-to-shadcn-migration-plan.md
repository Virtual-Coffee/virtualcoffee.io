# Bootstrap to ShadCN/UI Migration Plan

**Version:** 1.0
**Date:** November 10, 2025
**Last Updated:** November 10, 2025
**Next Review:** After completion of each phase
**Status:** Planning phase

---

## Table of Contents

- [Overview](#overview)
- [Current State Analysis](#current-state-analysis)
- [Migration Strategy](#migration-strategy)
- [Phase 0: ShadCN Setup](#phase-0-shadcn-setup--configuration)
- [Phase 1: Utility Classes](#phase-1-utility-classes-migration)
- [Phase 2: Grid System](#phase-2-grid-system-migration)
- [Phase 3: Buttons & Badges](#phase-3-buttons--badges)
- [Phase 4: Forms](#phase-4-forms-migration)
- [Phase 5: Navigation](#phase-5-navigation-migration)
- [Phase 6: Cards](#phase-6-cards-migration)
- [Phase 7: Progress Bars](#phase-7-progress-bars)
- [Phase 8: Breadcrumbs & Misc](#phase-8-breadcrumbs--misc)
- [Phase 9: MDX Files](#phase-9-mdx-files)
- [Phase 10: SCSS Cleanup](#phase-10-scss-cleanup)
- [Testing Strategy](#testing-strategy)
- [Timeline](#timeline)
- [Risk Mitigation](#risk-mitigation)

---

## Overview

This document outlines the complete migration plan for converting the Virtual Coffee website from Bootstrap 4.6.2 to ShadCN/UI (Tailwind CSS + Radix UI).

### Goals

- Modernize UI component library
- Improve accessibility with Radix UI primitives
- Reduce bundle size by removing Bootstrap
- Gain type-safety with TypeScript components
- Enable easier customization and maintenance

### Technology Stack

**Current:**

- Bootstrap 4.6.2
- Custom SCSS with Bootstrap mixins
- Next.js 15 (App Router)
- Tailwind CSS (partial usage)

**Target:**

- ShadCN/UI components
- Tailwind CSS (full adoption)
- Radix UI primitives
- Next.js 15 (App Router)
- React Hook Form + Zod (for forms)

---

## Current State Analysis

### Bootstrap Usage Inventory

Based on comprehensive codebase analysis, Bootstrap is used in **80+ files** including:

#### Components Breakdown

| Component Type | Files Affected | Usage Level |
|---------------|----------------|-------------|
| Grid System | 30+ files | Heavy |
| Forms | 5 files | Heavy |
| Buttons | 10+ files | Heavy |
| Navigation | 1 file | Heavy |
| Cards | 5+ files | Moderate |
| Typography/Utilities | 50+ files | Heavy |
| Progress Bars | 7 files | Moderate |
| Badges | 2 files | Light |
| Breadcrumbs | 1 file | Light |
| Media Objects | 1 file | Light |

#### Key Files Using Bootstrap

**Navigation:**

- `src/components/Nav.tsx` - Main navbar with responsive collapse

**Layout:**

- `src/components/layouts/DefaultLayout.tsx` - Hero sections with grid
- `src/components/content/TextContainer.tsx` - Container wrapper

**Forms:**

- `src/app/volunteer-at-virtual-coffee/form.tsx`
- `src/app/report-coc-violation/form.tsx`
- `src/app/start-coffee-table-group/form.tsx`
- `src/app/lunch-and-learn-idea/form.tsx`
- `src/components/forms/index.tsx`

**Pages:**

- `src/app/page.tsx` - Homepage
- `src/app/events/page.tsx` - Event listings with cards
- `src/app/members/page.tsx` - Member directory
- `src/app/newsletter/page.tsx` - Newsletter archive
- `src/app/podcast/page.tsx` - Podcast episodes
- `src/app/monthlychallenges/page.tsx` - Challenge overview
- All challenge pages in `src/app/monthlychallenges/(challenges)/`

**Components:**

- `src/components/MemberCards.tsx` - Member profile cards with badges
- `src/app/resources/[[...slug]]/breadcrumbs.tsx` - Breadcrumb navigation

**SCSS:**

- `src/styles/_bootstrap.scss` - Bootstrap module imports
- `src/styles/_variables.scss` - Bootstrap variable overrides
- `src/styles/_nav.scss` - Uses Bootstrap mixins
- `src/styles/_members.scss` - Uses Bootstrap mixins

**Content:**

- 10+ MDX files in `src/content/` directories

---

## Migration Strategy

### Phased Approach

The migration will be executed in **10 phases** over **3-4 weeks**, with each phase building on the previous one. This approach allows for:

- Incremental testing and validation
- Easy rollback if issues arise
- Continuous deployment capability
- Minimal disruption to development

### Key Principles

1. **Backwards compatibility during migration** - Both systems will coexist temporarily
2. **Component-first approach** - Migrate reusable components before pages
3. **Test extensively** - Visual regression testing after each phase
4. **Document patterns** - Create reusable patterns for the team
5. **Commit frequently** - One commit per phase for easy rollback

---

## Phase 0: ShadCN Setup & Configuration

**Estimated Time:** 0.5-1 day
**Risk Level:** Low

### Step 0.1: Install Core Dependencies

```bash
pnpm add tailwindcss-animate class-variance-authority clsx tailwind-merge lucide-react
pnpm add @radix-ui/react-slot
```

**Dependencies Explained:**

- `tailwindcss-animate` - Tailwind animation utilities
- `class-variance-authority` - Type-safe component variants
- `clsx` - Conditional className utility
- `tailwind-merge` - Merge Tailwind classes without conflicts
- `lucide-react` - Icon library (modern, tree-shakeable)
- `@radix-ui/react-slot` - Radix composition primitive

### Step 0.2: Initialize ShadCN

```bash
npx shadcn@latest init
```

**Configuration Choices:**

- **TypeScript:** Yes
- **Style:** Default
- **Base color:** Slate (matches current design)
- **CSS variables:** Yes (for easy theming)
- **Import alias:** `@/components` (already configured)
- **React Server Components:** Yes (Next.js 15 App Router)

### Step 0.3: Create Configuration Files

#### `components.json`

Created automatically by `shadcn init`:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/styles/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

#### `src/lib/utils.ts`

```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merge Tailwind CSS classes without conflicts
 * Used throughout ShadCN components
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

#### Update `tailwind.config.js`

Add ShadCN theme configuration (auto-generated by `shadcn init`):

```javascript
const { fontFamily } = require("tailwindcss/defaultTheme")

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

#### Update `src/styles/globals.css`

Add ShadCN CSS variables:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

### Step 0.4: Install Required ShadCN Components

```bash
# Core components
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add badge

# Form components
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add form
npx shadcn@latest add checkbox
npx shadcn@latest add textarea

# Navigation components
npx shadcn@latest add navigation-menu
npx shadcn@latest add sheet  # For mobile menu

# Utility components
npx shadcn@latest add breadcrumb
npx shadcn@latest add progress
npx shadcn@latest add separator
```

**Note:** These will be installed in `src/components/ui/` directory.

### Step 0.5: Install Form Dependencies

```bash
pnpm add react-hook-form @hookform/resolvers zod
```

**For:** Enhanced form handling with validation in Phase 4.

---

## Phase 1: Utility Classes Migration

**Estimated Time:** 2-3 days
**Risk Level:** Low
**Files Affected:** 50+ files

### Overview

Convert Bootstrap utility classes to Tailwind equivalents. This is the safest migration phase as utilities are isolated and don't affect component structure.

### Utility Class Mappings

#### Typography

| Bootstrap | Tailwind | Usage |
|-----------|----------|-------|
| `display-1` | `text-6xl font-bold lg:text-7xl` | Extra large headings |
| `display-2` | `text-5xl font-bold lg:text-6xl` | Large headings |
| `display-3` | `text-4xl font-bold lg:text-5xl` | Medium large headings |
| `display-4` | `text-3xl font-bold lg:text-4xl` | Medium headings |
| `display-5` | `text-2xl font-bold lg:text-3xl` | Smaller display |
| `lead` | `text-xl text-muted-foreground` | Lead paragraphs |
| `text-muted` | `text-muted-foreground` | Muted text |
| `font-italic` | `italic` | Italic text |
| `font-weight-bold` | `font-bold` | Bold text |
| `text-uppercase` | `uppercase` | Uppercase text |

#### Spacing Utilities

**Direct equivalents** (Bootstrap → Tailwind):

- `mt-3` → `mt-3` ✓
- `mb-4` → `mb-4` ✓
- `py-5` → `py-5` ✓
- `px-2` → `px-2` ✓

**Custom Bootstrap spacers** (from `_variables.scss`):

- `mt-6` → `mt-12` (if 6 = 3rem)
- `mt-7` → `mt-16`
- `mt-8` → `mt-20`

#### Flexbox Utilities

| Bootstrap | Tailwind |
|-----------|----------|
| `d-flex` | `flex` |
| `d-inline-flex` | `inline-flex` |
| `flex-row` | `flex-row` |
| `flex-column` | `flex-col` |
| `flex-wrap` | `flex-wrap` |
| `justify-content-start` | `justify-start` |
| `justify-content-end` | `justify-end` |
| `justify-content-center` | `justify-center` |
| `justify-content-between` | `justify-between` |
| `justify-content-around` | `justify-around` |
| `align-items-start` | `items-start` |
| `align-items-end` | `items-end` |
| `align-items-center` | `items-center` |
| `align-items-stretch` | `items-stretch` |

#### Display Utilities

| Bootstrap | Tailwind |
|-----------|----------|
| `d-none` | `hidden` |
| `d-block` | `block` |
| `d-inline` | `inline` |
| `d-inline-block` | `inline-block` |

#### Text Utilities

| Bootstrap | Tailwind |
|-----------|----------|
| `text-left` | `text-left` |
| `text-center` | `text-center` |
| `text-right` | `text-right` |
| `text-truncate` | `truncate` |

#### Background Utilities

| Bootstrap | Tailwind | Notes |
|-----------|----------|-------|
| `bg-primary` | `bg-primary` | Use ShadCN color |
| `bg-secondary` | `bg-secondary` | Use ShadCN color |
| `bg-light` | `bg-muted` | Semantic color |
| `bg-dark` | `bg-slate-900` | Dark background |
| `bg-white` | `bg-background` | Default background |

### Migration Strategy

1. **Find & Replace (with caution)**
   - Use VS Code search/replace with regex
   - Test each page after replacement
   - Commit frequently

2. **Priority Order**
   - Start with most common utilities (spacing, display, flex)
   - Then typography
   - Finally backgrounds and misc

3. **Key Files to Update**

**High Priority:**

- `src/app/page.tsx` - Homepage (heavy utility usage)
- `src/app/events/page.tsx` - Events page
- `src/app/members/page.tsx` - Members page
- `src/components/layouts/DefaultLayout.tsx` - Layout component

**Medium Priority:**

- `src/app/newsletter/page.tsx`
- `src/app/podcast/page.tsx`
- `src/app/monthlychallenges/page.tsx`
- All challenge pages

**Lower Priority:**

- Individual challenge pages
- Content pages

### Example Migrations

#### Before (Bootstrap):

```tsx
<div className="container py-5">
  <h1 className="display-4 text-center mb-3">Welcome</h1>
  <p className="lead text-muted">Description text</p>
  <div className="d-flex justify-content-between align-items-center mt-4">
    <span className="text-muted">Left</span>
    <span>Right</span>
  </div>
</div>
```

#### After (Tailwind):

```tsx
<div className="container py-5">
  <h1 className="text-3xl font-bold lg:text-4xl text-center mb-3">Welcome</h1>
  <p className="text-xl text-muted-foreground">Description text</p>
  <div className="flex justify-between items-center mt-4">
    <span className="text-muted-foreground">Left</span>
    <span>Right</span>
  </div>
</div>
```

### Testing Checklist

- [ ] Homepage renders correctly
- [ ] Typography hierarchy preserved
- [ ] Spacing looks identical
- [ ] Responsive behavior maintained
- [ ] No layout shifts

---

## Phase 2: Grid System Migration

**Estimated Time:** 3-4 days
**Risk Level:** Medium
**Files Affected:** 30+ files

### Overview

Convert Bootstrap grid system (container/row/col) to Tailwind flexbox/grid. This requires more careful attention as it affects page layout structure.

### Container Migration

#### Bootstrap Container Variants

| Bootstrap | Tailwind Equivalent | Max Width |
|-----------|-------------------|-----------|
| `.container` | `container mx-auto px-4` | Responsive |
| `.container-sm` | `max-w-screen-sm mx-auto px-4` | 640px |
| `.container-md` | `max-w-screen-md mx-auto px-4` | 768px |
| `.container-lg` | `max-w-6xl mx-auto px-4` | 1024px |
| `.container-xl` | `max-w-7xl mx-auto px-4` | 1280px |

**Custom Container Classes** (add to `globals.css`):

```css
@layer components {
  .container {
    @apply mx-auto px-4;
    max-width: 100%;
  }

  .container-simple {
    @apply mx-auto px-4;
    max-width: 48rem; /* 768px */
  }

  @screen sm {
    .container { max-width: 640px; }
  }

  @screen md {
    .container { max-width: 768px; }
  }

  @screen lg {
    .container { max-width: 1024px; }
  }

  @screen xl {
    .container { max-width: 1280px; }
  }
}
```

### Row/Column Migration

#### Bootstrap Grid Approach:

```tsx
<div className="row">
  <div className="col-md-4">Sidebar</div>
  <div className="col-md-8">Main Content</div>
</div>
```

#### Tailwind Flex Approach:

```tsx
<div className="flex flex-wrap -mx-4">
  <div className="w-full md:w-1/3 px-4">Sidebar</div>
  <div className="w-full md:w-2/3 px-4">Main Content</div>
</div>
```

#### Tailwind Grid Approach (Alternative):

```tsx
<div className="grid grid-cols-1 md:grid-cols-12 gap-4">
  <div className="md:col-span-4">Sidebar</div>
  <div className="md:col-span-8">Main Content</div>
</div>
```

### Column Width Mappings

| Bootstrap | Tailwind (Flex) | Tailwind (Grid) |
|-----------|----------------|-----------------|
| `col-1` | `w-1/12` | `col-span-1` |
| `col-2` | `w-2/12` | `col-span-2` |
| `col-3` | `w-3/12` or `w-1/4` | `col-span-3` |
| `col-4` | `w-4/12` or `w-1/3` | `col-span-4` |
| `col-6` | `w-6/12` or `w-1/2` | `col-span-6` |
| `col-8` | `w-8/12` or `w-2/3` | `col-span-8` |
| `col-9` | `w-9/12` or `w-3/4` | `col-span-9` |
| `col-12` | `w-full` | `col-span-12` |

**Responsive prefixes:**

- `col-sm-*` → `sm:w-*`
- `col-md-*` → `md:w-*`
- `col-lg-*` → `lg:w-*`
- `col-xl-*` → `xl:w-*`

### Key Files to Migrate

#### 1. `src/components/layouts/DefaultLayout.tsx`

**Current:**

```tsx
<div className="container container-simple">
  <div className="row align-items-center">
    <div className="col-md-4">
      {/* Hero image */}
    </div>
    <div className="col-md-8">
      {/* Hero content */}
    </div>
  </div>
</div>
```

**After:**

```tsx
<div className="container-simple">
  <div className="flex flex-wrap items-center -mx-4">
    <div className="w-full md:w-1/3 px-4">
      {/* Hero image */}
    </div>
    <div className="w-full md:w-2/3 px-4">
      {/* Hero content */}
    </div>
  </div>
</div>
```

#### 2. `src/app/newsletter/page.tsx`

**Current:**

```tsx
<div className="row">
  <div className="col-sm">Newsletter content</div>
  <div className="col-sm">Sidebar</div>
</div>
```

**After:**

```tsx
<div className="flex flex-wrap -mx-4">
  <div className="w-full sm:w-1/2 px-4">Newsletter content</div>
  <div className="w-full sm:w-1/2 px-4">Sidebar</div>
</div>
```

### Other Files Using Grid

- `src/app/page.tsx` (multiple sections)
- `src/app/events/page.tsx`
- `src/app/members/page.tsx`
- `src/app/resources/[[...slug]]/breadcrumbs.tsx`
- All challenge pages
- MDX content files (10+ files)

### Testing Checklist

- [ ] All layouts maintain structure at all breakpoints
- [ ] No horizontal scroll introduced
- [ ] Column widths are correct on mobile
- [ ] Column widths are correct on tablet
- [ ] Column widths are correct on desktop
- [ ] Gutters (spacing) between columns preserved

---

## Phase 3: Buttons & Badges

**Estimated Time:** 1 day
**Risk Level:** Low
**Files Affected:** 10+ files

### Overview

Replace Bootstrap button and badge classes with ShadCN components. This is straightforward as ShadCN provides ready-made Button and Badge components.

### ShadCN Button Component

#### Button Variants

```tsx
import { Button } from "@/components/ui/button"

// Primary (default)
<Button>Click me</Button>

// Secondary
<Button variant="secondary">Secondary</Button>

// Destructive
<Button variant="destructive">Delete</Button>

// Outline
<Button variant="outline">Outline</Button>

// Ghost
<Button variant="ghost">Ghost</Button>

// Link style
<Button variant="link">Link Button</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">🔥</Button>
```

#### Bootstrap to ShadCN Mapping

| Bootstrap | ShadCN |
|-----------|--------|
| `btn btn-primary` | `<Button>` |
| `btn btn-secondary` | `<Button variant="secondary">` |
| `btn btn-danger` | `<Button variant="destructive">` |
| `btn btn-outline-primary` | `<Button variant="outline">` |
| `btn btn-sm` | `<Button size="sm">` |
| `btn btn-lg` | `<Button size="lg">` |

### ShadCN Badge Component

```tsx
import { Badge } from "@/components/ui/badge"

// Default
<Badge>Default</Badge>

// Secondary
<Badge variant="secondary">Secondary</Badge>

// Destructive
<Badge variant="destructive">Error</Badge>

// Outline
<Badge variant="outline">Outline</Badge>
```

### Files to Migrate

#### 1. Homepage CTA Button

**File:** `src/app/page.tsx:268`

**Before:**

```tsx
<button className="btn btn-primary btn-lg">
  Become a Sponsor
</button>
```

**After:**

```tsx
import { Button } from "@/components/ui/button"

<Button size="lg">
  Become a Sponsor
</Button>
```

#### 2. Join Page Button

**File:** `src/app/join/page.tsx:46`

**Before:**

```tsx
<button className="btn btn-primary btn-lg">
  Join the Waitlist
</button>
```

**After:**

```tsx
<Button size="lg">
  Join the Waitlist
</Button>
```

#### 3. Form Submit Buttons

**File:** `src/components/forms/index.tsx:9`

**Before:**

```tsx
<button type="submit" className="btn btn-primary btn-lg">
  Submit
</button>
```

**After:**

```tsx
<Button type="submit" size="lg">
  Submit
</Button>
```

**Also update in:**

- `src/app/volunteer-at-virtual-coffee/form.tsx`
- `src/app/report-coc-violation/form.tsx`
- `src/app/start-coffee-table-group/form.tsx`
- `src/app/lunch-and-learn-idea/form.tsx`

#### 4. Member Card Badges

**File:** `src/components/MemberCards.tsx:79-80`

**Before:**

```tsx
<span className="badge badge-secondary">
  Core Team
</span>
```

**After:**

```tsx
import { Badge } from "@/components/ui/badge"

<Badge variant="secondary">
  Core Team
</Badge>
```

### Testing Checklist

- [ ] All buttons render with correct styling
- [ ] Button hover states work
- [ ] Button focus states are accessible (keyboard navigation)
- [ ] Button sizes are correct
- [ ] Badges display correctly
- [ ] Badge colors match design intent

---

## Phase 4: Forms Migration

**Estimated Time:** 2-3 days
**Risk Level:** High
**Files Affected:** 5 form files

### Overview

Migrate Bootstrap form components to ShadCN Form components with React Hook Form and Zod validation. This is a high-risk phase due to form functionality criticality.

### ShadCN Form Architecture

**Stack:**

- `react-hook-form` - Form state management
- `zod` - Schema validation
- ShadCN Form components - UI layer

### Form Component Structure

#### Basic Form Setup

```tsx
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

// Define validation schema
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms",
  }),
})

export function MyForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
      acceptTerms: false,
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Form fields here */}
      </form>
    </Form>
  )
}
```

### Form Field Patterns

#### Text Input Field

**Before (Bootstrap):**

```tsx
<div className="form-group">
  <label htmlFor="name">Name</label>
  <input
    type="text"
    className="form-control"
    id="name"
    name="name"
  />
  <small className="form-text text-muted">
    Enter your full name
  </small>
</div>
```

**After (ShadCN):**

```tsx
<FormField
  control={form.control}
  name="name"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Name</FormLabel>
      <FormControl>
        <Input placeholder="Enter your name" {...field} />
      </FormControl>
      <FormDescription>
        Enter your full name
      </FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
```

#### Textarea Field

**Before:**

```tsx
<div className="form-group">
  <label htmlFor="comments">Comments</label>
  <textarea
    className="form-control"
    id="comments"
    rows={4}
  />
</div>
```

**After:**

```tsx
<FormField
  control={form.control}
  name="comments"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Comments</FormLabel>
      <FormControl>
        <Textarea
          placeholder="Your comments..."
          rows={4}
          {...field}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

#### Checkbox Field

**Before:**

```tsx
<div className="form-check">
  <input
    type="checkbox"
    className="form-check-input"
    id="interests"
    value="frontend"
  />
  <label className="form-check-label" htmlFor="interests">
    Frontend Development
  </label>
</div>
```

**After:**

```tsx
<FormField
  control={form.control}
  name="interests"
  render={({ field }) => (
    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
      <FormControl>
        <Checkbox
          checked={field.value?.includes("frontend")}
          onCheckedChange={(checked) => {
            return checked
              ? field.onChange([...field.value, "frontend"])
              : field.onChange(
                  field.value?.filter((value) => value !== "frontend")
                )
          }}
        />
      </FormControl>
      <div className="space-y-1 leading-none">
        <FormLabel>
          Frontend Development
        </FormLabel>
      </div>
    </FormItem>
  )}
/>
```

### Files to Migrate

#### 1. Volunteer Form

**File:** `src/app/volunteer-at-virtual-coffee/form.tsx`

**Fields:**

- Name (text input)
- Email (email input)
- Interests (checkboxes - multiple)
- Availability (textarea)
- Comments (textarea)

**Validation Schema:**

```typescript
const volunteerFormSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  interests: z.array(z.string()).min(1, "Select at least one interest"),
  availability: z.string().optional(),
  comments: z.string().optional(),
})
```

#### 2. Report COC Violation Form

**File:** `src/app/report-coc-violation/form.tsx`

**Fields:**

- Reporter name (text input, optional)
- Reporter email (email input, optional)
- Description (textarea, required)
- Date of incident (text input)
- Witnesses (textarea, optional)

**Validation Schema:**

```typescript
const cocReportSchema = z.object({
  reporterName: z.string().optional(),
  reporterEmail: z.string().email().optional().or(z.literal("")),
  description: z.string().min(20, "Please provide detailed description"),
  incidentDate: z.string().optional(),
  witnesses: z.string().optional(),
})
```

#### 3. Start Coffee Table Group Form

**File:** `src/app/start-coffee-table-group/form.tsx`

**Fields:**

- Your name (text)
- Email (email)
- Group topic (text)
- Description (textarea)
- Preferred schedule (text)

#### 4. Lunch and Learn Idea Form

**File:** `src/app/lunch-and-learn-idea/form.tsx`

**Fields:**

- Your name (text)
- Email (email)
- Topic idea (text)
- Description (textarea)
- Willing to present (checkbox)

#### 5. Form Components

**File:** `src/components/forms/index.tsx`

Refactor reusable form components:

- `SubmitButton` - Use ShadCN Button
- `FormCheckbox` - Use ShadCN Checkbox wrapper
- Form layout utilities

### Testing Checklist

- [ ] All form fields render correctly
- [ ] Form validation works (required fields)
- [ ] Error messages display properly
- [ ] Form submission works
- [ ] Accessibility: keyboard navigation
- [ ] Accessibility: screen reader labels
- [ ] Checkbox groups work correctly
- [ ] Textarea autosizing (if applicable)
- [ ] Email validation works
- [ ] Form reset after submission

---

## Phase 5: Navigation Migration

**Estimated Time:** 2-3 days
**Risk Level:** High
**Files Affected:** 1 file (but critical)

### Overview

Migrate the main navigation component from Bootstrap navbar to ShadCN NavigationMenu with a custom mobile menu. This is high-risk as navigation is used on every page.

### Current Navigation Analysis

**File:** `src/components/Nav.tsx`

**Features:**

- Responsive navbar
- Mobile toggle menu
- Collapsible menu on mobile
- Multiple nav items with dropdowns (if any)
- Fixed top positioning
- Dark theme

### ShadCN Navigation Approach

#### Option 1: NavigationMenu + Sheet (Recommended)

**Desktop:** ShadCN NavigationMenu
**Mobile:** ShadCN Sheet (slide-out drawer)

```tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu } from "lucide-react"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

export function Nav() {
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/events", label: "Events" },
    { href: "/members", label: "Members" },
    { href: "/resources", label: "Resources" },
    { href: "/newsletter", label: "Newsletter" },
    { href: "/podcast", label: "Podcast" },
  ]

  return (
    <nav className="fixed top-0 w-full z-50 bg-slate-900 text-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="font-bold text-xl">
            Virtual Coffee
          </Link>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList>
              {navItems.map((item) => (
                <NavigationMenuItem key={item.href}>
                  <Link href={item.href} legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      {item.label}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Mobile Menu Toggle */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col space-y-4 mt-6">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-lg hover:text-primary"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
```

#### Option 2: Custom Mobile Menu (Alternative)

Use Tailwind classes for custom responsive menu without Sheet:

```tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function Nav() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 w-full z-50 bg-slate-900 text-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="font-bold text-xl">
            Virtual Coffee
          </Link>

          {/* Mobile Toggle */}
          <button
            className="lg:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Desktop Menu */}
          <div className="hidden lg:flex lg:space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            "lg:hidden overflow-hidden transition-all duration-300",
            isOpen ? "max-h-96" : "max-h-0"
          )}
        >
          <div className="py-4 space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block hover:text-primary"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
```

### Migration Steps

1. **Install Sheet component** (for Option 1):

   ```bash
   npx shadcn@latest add sheet
   ```

2. **Backup current Nav.tsx**:

   ```bash
   cp src/components/Nav.tsx src/components/Nav.tsx.backup
   ```

3. **Rewrite Nav.tsx** with new implementation

4. **Extract nav items** to a constant or config file

5. **Test thoroughly** on all breakpoints

### Styling Considerations

**Current Bootstrap navbar features to preserve:**

- `navbar-dark` - Dark theme
- `fixed-top` - Fixed positioning
- `navbar-expand-lg` - Responsive breakpoint
- Background gradient (if custom)

**Tailwind equivalent:**

```tsx
className="fixed top-0 w-full z-50 bg-slate-900 text-white shadow-md"
```

### Testing Checklist

- [ ] Desktop menu renders correctly
- [ ] Desktop menu links work
- [ ] Mobile toggle button appears below lg breakpoint
- [ ] Mobile menu opens/closes properly
- [ ] Mobile menu links work and close menu on click
- [ ] Fixed positioning works
- [ ] Z-index prevents content overlap
- [ ] Keyboard navigation works
- [ ] Screen reader accessibility maintained
- [ ] Active/current page indicator (if applicable)
- [ ] Smooth transitions

---

## Phase 6: Cards Migration

**Estimated Time:** 1-2 days
**Risk Level:** Medium
**Files Affected:** 5+ files

### Overview

Convert Bootstrap card components to ShadCN Card components. Cards are used extensively for event listings and content displays.

### ShadCN Card Component

```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description or subtitle</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Main card content goes here</p>
  </CardContent>
  <CardFooter>
    <p>Footer content</p>
  </CardFooter>
</Card>
```

### Bootstrap to ShadCN Mapping

| Bootstrap | ShadCN |
|-----------|--------|
| `.card` | `<Card>` |
| `.card-header` | `<CardHeader>` |
| `.card-body` | `<CardContent>` |
| `.card-title` | `<CardTitle>` |
| `.card-text` | Plain text in `<CardContent>` |
| `.card-footer` | `<CardFooter>` |

### Files to Migrate

#### 1. Events Page

**File:** `src/app/events/page.tsx:123-163`

**Current Structure:**

```tsx
<div className="card mb-4">
  <div className="card-header py-2 d-flex justify-content-between align-items-center flex-row flex-wrap">
    <h5 className="mb-0">{event.title}</h5>
    <small className="text-right text-muted">{event.date}</small>
  </div>
  <div className="card-body">
    <h6 className="card-title">{event.subtitle}</h6>
    <p className="card-text">{event.description}</p>
  </div>
</div>
```

**After:**

```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

<Card className="mb-4">
  <CardHeader className="py-2">
    <div className="flex justify-between items-center flex-wrap">
      <CardTitle className="mb-0">{event.title}</CardTitle>
      <span className="text-sm text-muted-foreground text-right">
        {event.date}
      </span>
    </div>
    {event.subtitle && (
      <CardDescription>{event.subtitle}</CardDescription>
    )}
  </CardHeader>
  <CardContent>
    <p>{event.description}</p>
  </CardContent>
</Card>
```

#### 2. Other Files Using Cards

Search for `.card` class usage in:

- Challenge pages (if cards are used)
- Resource pages
- Any other listing pages

### Card Styling Customization

ShadCN cards can be customized with Tailwind classes:

```tsx
{/* Add hover effect */}
<Card className="hover:shadow-lg transition-shadow">

{/* Add border color */}
<Card className="border-l-4 border-l-primary">

{/* Full height card */}
<Card className="h-full">
```

### Testing Checklist

- [ ] All cards render with correct structure
- [ ] Card spacing is preserved
- [ ] Card headers display correctly
- [ ] Card content is readable
- [ ] Responsive behavior maintained
- [ ] Shadow/border styling matches design
- [ ] Hover states work (if applicable)

---

## Phase 7: Progress Bars

**Estimated Time:** 1 day
**Risk Level:** Medium
**Files Affected:** 7 files (challenge pages)

### Overview

Convert Bootstrap progress bars to ShadCN Progress component. Used primarily in November challenge pages for word count tracking.

### ShadCN Progress Component

```tsx
import { Progress } from "@/components/ui/progress"

<Progress value={60} className="my-4" />
```

**Props:**

- `value` - Progress percentage (0-100)
- `className` - Additional Tailwind classes
- `indicatorClassName` - Style the progress indicator

### Bootstrap to ShadCN Conversion

**Before (Bootstrap):**

```tsx
<div className="progress my-4">
  <div
    className="progress-bar progress-bar-striped"
    role="progressbar"
    style={{ width: `${percentage}%` }}
    aria-valuenow={percentage}
    aria-valuemin="0"
    aria-valuemax="100"
  >
    {percentage}%
  </div>
</div>
```

**After (ShadCN):**

```tsx
<div className="my-4">
  <Progress value={percentage} />
  <p className="text-sm text-center mt-1">{percentage}%</p>
</div>
```

### Striped Progress Bar Styling

Bootstrap's `progress-bar-striped` doesn't have a direct ShadCN equivalent. Add custom styling:

**Create custom Progress variant** in `src/components/ui/progress.tsx`:

```tsx
// Add after the existing Progress component

export function StripedProgress({
  value,
  className,
  ...props
}: React.ComponentProps<typeof Progress>) {
  return (
    <Progress
      value={value}
      className={cn("relative overflow-hidden", className)}
      indicatorClassName="bg-gradient-to-r from-primary to-primary/80 animate-stripes"
      {...props}
    />
  )
}
```

**Add animation to `globals.css`:**

```css
@keyframes stripes {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 40px 0;
  }
}

.animate-stripes {
  background-image: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.15) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.15) 75%,
    transparent 75%,
    transparent
  );
  background-size: 40px 40px;
  animation: stripes 1s linear infinite;
}
```

### Files to Migrate

#### November Challenge Pages (Word Count Trackers)

1. `src/app/monthlychallenges/(challenges)/nov-2020/page.tsx`
2. `src/app/monthlychallenges/(challenges)/nov-2021/page.tsx`
3. `src/app/monthlychallenges/(challenges)/nov-2022/page.tsx`
4. `src/app/monthlychallenges/(challenges)/nov-2023/page.tsx`
5. `src/app/monthlychallenges/(challenges)/nov-2024/page.tsx`

#### Monthly Challenges Overview Page

1. `src/app/monthlychallenges/page.tsx:523-525`

**Pattern:**

```tsx
// Before
<div className="progress my-4">
  <div className="progress-bar progress-bar-striped" style={{width: `${wordCount / 500}%`}}>
    {wordCount} words
  </div>
</div>

// After
import { Progress } from "@/components/ui/progress"

const progressPercentage = Math.min((wordCount / 50000) * 100, 100)

<div className="my-4">
  <StripedProgress value={progressPercentage} />
  <p className="text-sm text-center mt-1">
    {wordCount.toLocaleString()} / 50,000 words ({progressPercentage.toFixed(1)}%)
  </p>
</div>
```

### Testing Checklist

- [ ] Progress bars render correctly
- [ ] Progress percentage calculations are accurate
- [ ] Striped animation works (if implemented)
- [ ] Progress bars are responsive
- [ ] Accessibility: aria-labels present
- [ ] Text labels display correctly

---

## Phase 8: Breadcrumbs & Misc

**Estimated Time:** 1 day
**Risk Level:** Low
**Files Affected:** 2-3 files

### Overview

Migrate remaining Bootstrap components: breadcrumbs, media objects, and any other miscellaneous components.

### ShadCN Breadcrumb Component

```tsx
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">Home</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbLink href="/resources">Resources</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Current Page</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

### Files to Migrate

#### 1. Resources Breadcrumbs

**File:** `src/app/resources/[[...slug]]/breadcrumbs.tsx`

**Current (Bootstrap):**

```tsx
<div className="py-4">
  <div className="container">
    <nav aria-label="breadcrumb">
      <ol className="breadcrumb">
        <li className="breadcrumb-item">
          <Link href="/">Home</Link>
        </li>
        <li className="breadcrumb-item">
          <Link href="/resources">Resources</Link>
        </li>
        <li className="breadcrumb-item active" aria-current="page">
          Current Page
        </li>
      </ol>
    </nav>
  </div>
</div>
```

**After (ShadCN):**

```tsx
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

<div className="py-4">
  <div className="container">
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/resources">Resources</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Current Page</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  </div>
</div>
```

#### 2. Media Objects (Podcast Page)

**File:** `src/app/podcast/page.tsx:64-102`

**Current (Bootstrap):**

```tsx
<div className="media align-items-center">
  <img src={sponsor.logo} className="mr-3" alt={sponsor.name} />
  <div className="media-body">
    <h5>{sponsor.name}</h5>
    <p>{sponsor.description}</p>
  </div>
</div>
```

**After (Tailwind Flex):**

```tsx
<div className="flex items-center gap-4">
  <img src={sponsor.logo} alt={sponsor.name} className="flex-shrink-0" />
  <div className="flex-1">
    <h5 className="text-lg font-semibold">{sponsor.name}</h5>
    <p className="text-muted-foreground">{sponsor.description}</p>
  </div>
</div>
```

### Other Miscellaneous Components

**Check for:**

- Alerts (if any) - Use ShadCN Alert component
- Modals (if any) - Use ShadCN Dialog component
- Tooltips (if any) - Use ShadCN Tooltip component
- Dropdowns (if any) - Use ShadCN DropdownMenu component

### Testing Checklist

- [ ] Breadcrumbs render correctly
- [ ] Breadcrumb links are clickable
- [ ] Breadcrumb separators display
- [ ] Media objects maintain layout
- [ ] All misc components work as expected

---

## Phase 9: MDX Files

**Estimated Time:** 1-2 days
**Risk Level:** Medium
**Files Affected:** 10+ MDX files

### Overview

Update MDX content files that contain Bootstrap classes embedded in HTML/JSX. These files contain documentation and static content.

### MDX Files to Update

Based on the codebase analysis:

1. `src/content/resources/virtual-coffee-handbook/guides-to-virtual-coffee/slack-channels-guide.mdx`
2. `src/content/resources/virtual-coffee-handbook/guides-to-virtual-coffee/coffee-table-groups.mdx`
3. `src/content/resources/virtual-coffee-handbook/get-involved/paths-to-leadership.mdx`
4. `src/content/simple-mdx-pages/about.mdx`
5. `src/content/resources/developer-resources/index.mdx`
6. Other MDX files found in search

### Common Patterns in MDX

#### Bootstrap Classes in MDX HTML

##### Pattern 1: Containers and Rows

```mdx
<!-- Before -->
<div className="container">
  <div className="row">
    <div className="col-md-6">Content</div>
    <div className="col-md-6">Content</div>
  </div>
</div>

<!-- After -->
<div className="container">
  <div className="flex flex-wrap -mx-4">
    <div className="w-full md:w-1/2 px-4">Content</div>
    <div className="w-full md:w-1/2 px-4">Content</div>
  </div>
</div>
```

##### Pattern 2: Buttons

```mdx
<!-- Before -->
<a href="/join" className="btn btn-primary btn-lg">Join Now</a>

<!-- After -->
<a href="/join" className="inline-flex items-center justify-center px-6 py-3 text-lg font-medium text-white bg-primary rounded-lg hover:bg-primary/90">
  Join Now
</a>
```

##### Pattern 3: Alerts

```mdx
<!-- Before -->
<div className="alert alert-info">
  Important information
</div>

<!-- After -->
<div className="p-4 mb-4 text-blue-800 bg-blue-50 border border-blue-200 rounded-lg">
  Important information
</div>
```

##### Pattern 4: Cards

```mdx
<!-- Before -->
<div className="card">
  <div className="card-body">
    <h5 className="card-title">Title</h5>
    <p className="card-text">Text</p>
  </div>
</div>

<!-- After -->
<div className="bg-card rounded-lg border p-6">
  <h5 className="text-lg font-semibold mb-2">Title</h5>
  <p className="text-muted-foreground">Text</p>
</div>
```

### Migration Strategy

1. **Search for Bootstrap classes in MDX:**

   ```bash
   grep -r "className=\".*\(btn\|card\|row\|col-\|container\|alert\).*\"" src/content/
   ```

2. **Review each file manually** - MDX content varies significantly

3. **Update classes** following patterns above

4. **Test MDX rendering** - Ensure MDX processing doesn't break

### MDX Component Library (Optional)

Create reusable MDX components for common patterns:

**File:** `src/components/mdx-components.tsx`

```tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export const mdxComponents = {
  Button: Button,
  Card: ({ title, children }: { title?: string; children: React.ReactNode }) => (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
    </Card>
  ),
  Alert: ({ children }: { children: React.ReactNode }) => (
    <Alert>
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  ),
}
```

Then use in MDX:

```mdx
<Card title="Example Card">
  This is card content with ShadCN styling!
</Card>
```

### Testing Checklist

- [ ] All MDX files compile without errors
- [ ] MDX content displays correctly
- [ ] Links in MDX work
- [ ] Images in MDX render
- [ ] Custom HTML/JSX in MDX still works
- [ ] Responsive behavior maintained

---

## Phase 10: SCSS Cleanup

**Estimated Time:** 1 day
**Risk Level:** Medium
**Files Affected:** 5 SCSS files + package.json

### Overview

Remove Bootstrap dependencies, clean up SCSS files, and complete the migration by removing all Bootstrap code.

### Files to Clean Up

#### 1. Remove Bootstrap SCSS Import

**File:** `src/styles/_bootstrap.scss`

**Action:** Delete this file entirely (or comment out all imports)

#### 2. Update Main SCSS

**File:** `src/styles/main.scss`

**Before:**

```scss
@import 'variables';
@import 'bootstrap';
@import 'nav';
@import 'members';
// ... other imports
```

**After:**

```scss
// Remove Bootstrap import
@import 'variables';
@import 'nav';
@import 'members';
// ... other imports
```

#### 3. Convert Bootstrap Variables

**File:** `src/styles/_variables.scss`

Convert Bootstrap variable overrides to either:

- Tailwind config (`tailwind.config.js`)
- CSS custom properties (`globals.css`)

**Bootstrap variables to convert:**

```scss
// Before (Bootstrap variables)
$pink: #e169aa;
$blue: #007bff;
$primary: $pink;
$secondary: #66635d;

// After (CSS custom properties in globals.css)
:root {
  --color-pink: #e169aa;
  --color-blue: #007bff;
  --color-primary: var(--color-pink);
  --color-secondary: #66635d;
}
```

**Or in `tailwind.config.js`:**

```javascript
theme: {
  extend: {
    colors: {
      'vc-pink': '#e169aa',
      'vc-blue': '#007bff',
      'vc-secondary': '#66635d',
    },
  },
},
```

#### 4. Update Nav SCSS

**File:** `src/styles/_nav.scss`

**Remove Bootstrap mixins:**

```scss
// Before
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins';

.nav-custom {
  @include media-breakpoint-up(lg) {
    // Desktop styles
  }
  background: $gradient-primary;
  z-index: $zindex-fixed;
}

// After (use Tailwind or plain CSS)
.nav-custom {
  @media (min-width: 1024px) {
    // Desktop styles
  }
  background: linear-gradient(to right, var(--color-primary), var(--color-secondary));
  z-index: 9999;
}
```

#### 5. Update Members SCSS

**File:** `src/styles/_members.scss`

**Remove Bootstrap mixins:**

```scss
// Before
.membercard {
  @include media-breakpoint-up(md) {
    // Tablet styles
  }
  border-radius: $border-radius-sm;
}

// After
.membercard {
  @media (min-width: 768px) {
    // Tablet styles
  }
  border-radius: 0.25rem;
}
```

**Or migrate to Tailwind classes entirely** and remove custom SCSS.

#### 6. Remove Bootstrap from package.json

```bash
pnpm remove bootstrap
```

**Before:**

```json
{
  "dependencies": {
    "bootstrap": "^4.6.2",
    // ...
  }
}
```

**After:**

```json
{
  "dependencies": {
    // Bootstrap removed
    // ...
  }
}
```

#### 7. Update next.config.mjs

Remove Bootstrap-specific configurations:

**Before:**

```javascript
{
  sassOptions: {
    silenceDeprecations: ['legacy-js-api'],
  },
}
```

**After:**
Keep if still using Sass for custom styles, or remove if fully migrated to Tailwind.

### Verification Steps

1. **Build the project:**

   ```bash
   pnpm build
   ```

2. **Check for Bootstrap references:**

   ```bash
   grep -r "bootstrap" src/
   grep -r "btn btn-" src/
   grep -r "card card-" src/
   ```

3. **Verify no Bootstrap CSS loaded:**
   - Check browser dev tools Network tab
   - Look for `bootstrap.css` or `bootstrap.min.css`
   - Should not be present

4. **Check bundle size reduction:**

   ```bash
   pnpm build
   # Check .next/static/css/ folder
   # Should be smaller than before
   ```

### Testing Checklist

- [ ] Project builds without errors
- [ ] No Bootstrap imports remain
- [ ] All pages render correctly
- [ ] No console errors
- [ ] CSS bundle size reduced
- [ ] No broken styles
- [ ] SCSS compilation works (if Sass still used)

---

## Testing Strategy

### Visual Regression Testing

#### Tools

- **Percy** (recommended) - Visual diff testing
- **Playwright** - Screenshot testing
- **Manual comparison** - Before/after screenshots

#### Pages to Test

1. Homepage (/)
2. About page (/about)
3. Events page (/events)
4. Members page (/members)
5. Newsletter page (/newsletter)
6. Podcast page (/podcast)
7. Monthly challenges (/monthlychallenges)
8. Individual challenge pages
9. Resources pages
10. All form pages

#### Breakpoints to Test

- Mobile: 375px (iPhone SE)
- Mobile: 414px (iPhone Pro)
- Tablet: 768px (iPad)
- Tablet: 1024px (iPad Pro)
- Desktop: 1440px (MacBook Pro)
- Wide: 1920px (Full HD)

### Functional Testing

#### Forms

- [ ] All form fields work
- [ ] Validation displays correctly
- [ ] Submit functionality works
- [ ] Error states display
- [ ] Success states work
- [ ] Required fields enforced

#### Navigation

- [ ] Desktop menu links work
- [ ] Mobile menu opens/closes
- [ ] All nav links clickable
- [ ] Current page indicator (if any)
- [ ] Dropdown menus (if any)

#### Interactive Components

- [ ] Buttons are clickable
- [ ] Cards are interactive (if applicable)
- [ ] Progress bars animate
- [ ] Modals open/close (if any)

### Accessibility Testing

#### Tools

- **axe DevTools** - Automated accessibility testing
- **Lighthouse** - Chrome DevTools audit
- **Screen reader** - Manual testing (NVDA/JAWS/VoiceOver)
- **Keyboard navigation** - Tab through all interactive elements

#### Checklist

- [ ] All images have alt text
- [ ] Form inputs have labels
- [ ] Buttons have accessible names
- [ ] Links have descriptive text
- [ ] Color contrast meets WCAG AA
- [ ] Keyboard navigation works
- [ ] Screen reader announcements correct
- [ ] Focus indicators visible
- [ ] ARIA attributes correct
- [ ] Semantic HTML used

### Performance Testing

#### Metrics to Track

- **First Contentful Paint (FCP)**
- **Largest Contentful Paint (LCP)**
- **Time to Interactive (TTI)**
- **Bundle size**

#### Tools

- Chrome DevTools Lighthouse
- WebPageTest
- Bundle analyzer

#### Expected Improvements

- Reduced CSS bundle size (Bootstrap removal)
- Faster page load times
- Better Lighthouse scores

### Browser Compatibility Testing

#### Browsers to Test

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile Safari (iOS)
- Chrome Mobile (Android)

### Deployment Testing

#### Staging Environment

1. Deploy to Netlify preview
2. Test all pages
3. Test all forms
4. Verify no 404s
5. Check production build

---

## Timeline

### Week 1

- **Day 1-2:** Phase 0 (Setup) + Phase 1 (Utilities)
- **Day 3-4:** Phase 2 (Grid System)
- **Day 5:** Phase 3 (Buttons & Badges)

### Week 2

- **Day 1-3:** Phase 4 (Forms) - Most complex
- **Day 4-5:** Phase 5 (Navigation)

### Week 3

- **Day 1:** Phase 6 (Cards)
- **Day 2:** Phase 7 (Progress Bars)
- **Day 3:** Phase 8 (Breadcrumbs & Misc)
- **Day 4-5:** Phase 9 (MDX Files)

### Week 4

- **Day 1:** Phase 10 (SCSS Cleanup)
- **Day 2-3:** Testing & QA
- **Day 4:** Bug fixes
- **Day 5:** Final review & deployment

<!-- markdownlint-disable MD036 -->
**Total: 3-4 weeks**
<!-- markdownlint-enable MD036 -->

### Milestones

- ✅ **Week 1 Complete:** Basic utilities and layout migrated
- ✅ **Week 2 Complete:** Forms and navigation working
- ✅ **Week 3 Complete:** All components migrated
- ✅ **Week 4 Complete:** Testing done, ready for production

---

## Risk Mitigation

### Development Practices

1. **Feature Branch**

   ```bash
   git checkout -b migration/bootstrap-to-shadcn
   ```

2. **Frequent Commits**
   - Commit after each phase
   - Use descriptive commit messages
   - Tag important milestones

3. **Code Review**
   - Self-review before committing
   - Peer review for critical components
   - Test on local before pushing

### Rollback Plan

1. **Keep Bootstrap during migration**
   - Don't remove Bootstrap until Phase 10
   - Allows fallback if needed

2. **Git tags**

   ```bash
   git tag -a phase-1-complete -m "Phase 1: Utilities migrated"
   ```

3. **Easy revert**

   ```bash
   git revert <commit-hash>
   ```

### Testing Safety Net

1. **Visual regression tests** - Catch UI changes
2. **Automated tests** - Ensure functionality
3. **Manual QA** - Human verification
4. **Staging deployment** - Test before production

### Communication

1. **Document progress** - Update this plan as you go
2. **Team updates** - Regular standups/check-ins
3. **Issue tracking** - Create tickets for bugs
4. **Changelog** - Document all changes

---

## Post-Migration Benefits

### Technical Benefits

✅ **Modern stack** - Up-to-date component library
✅ **Type-safe** - Full TypeScript support
✅ **Accessible** - Radix UI primitives (WCAG compliant)
✅ **Smaller bundle** - Remove Bootstrap (~50KB+ savings)
✅ **Better DX** - Easier to customize and maintain
✅ **Server Components** - Next.js 15 compatible

### User Benefits

✅ **Faster load times** - Smaller CSS bundle
✅ **Better accessibility** - Improved keyboard navigation
✅ **Consistent UI** - Design system with ShadCN
✅ **Mobile-first** - Better responsive design

### Developer Benefits

✅ **Easy customization** - Own the component code
✅ **Better documentation** - ShadCN docs + Tailwind docs
✅ **Modern patterns** - React best practices
✅ **Dark mode ready** - Built-in theme support

---

## Resources

### Documentation

- [ShadCN/UI Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/primitives/docs/overview/introduction)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/)

### Tools

- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) - VS Code extension
- [Prettier Plugin Tailwind](https://github.com/tailwindlabs/prettier-plugin-tailwindcss) - Class sorting

### Support

- [ShadCN GitHub Discussions](https://github.com/shadcn/ui/discussions)
- [Tailwind Discord](https://tailwindcss.com/discord)

---

## Conclusion

This migration plan provides a comprehensive, phased approach to converting from Bootstrap 4.6.2 to ShadCN/UI. By following each phase systematically with thorough testing, the migration can be completed successfully with minimal risk.

The key to success is:

1. **Take it slow** - One phase at a time
2. **Test thoroughly** - Visual, functional, and accessibility testing
3. **Commit often** - Easy rollback if needed
4. **Communicate** - Keep team informed of progress

Good luck with the migration! 🚀
