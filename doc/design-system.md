# Costa Lavos Enterprise Design System

## 1. Overview
This design system provides a comprehensive set of guidelines, tokens, and components to ensure consistency, scalability, and maintainability across the Costa Lavos 360° application. It is built upon React, TailwindCSS, and Radix UI primitives.

## 2. Core Principles
- **Consistency:** All UI elements share a common visual language.
- **Accessibility:** Components are built with ARIA standards (via Radix UI).
- **Responsiveness:** Mobile-first approach using Tailwind breakpoints.
- **Performance:** Lightweight components and efficient CSS generation.

## 3. Design Tokens

### 3.1 Colors
Colors are defined in `src/constants/colors.js` and mapped in `tailwind.config.js`.

| Token | Value | Usage |
| :--- | :--- | :--- |
| `primary` | `#2563EB` (Blue 600) | Main actions, links, active states |
| `secondary` | `#7C3AED` (Violet 600) | Secondary actions, highlights |
| `accent` | `#F59E0B` (Amber 500) | Warnings, important highlights |
| `success` | `#10B981` (Emerald 500) | Success states, positive trends |
| `error` | `#EF4444` (Red 500) | Destructive actions, errors |
| `background` | `#FFFFFF` | Page background |
| `foreground` | `#0F172A` | Primary text color |

### 3.2 Typography
Harmonic scale defined in `src/constants/typography.js`.

- **Font Family:** Inter (Sans-serif)
- **Scale:**
  - `xs` (12px)
  - `sm` (14px)
  - `base` (16px)
  - `lg` (18px)
  - `xl` (20px) ... up to `5xl`

### 3.3 Spacing
Based on a 4px grid. Defined in `src/constants/spacing.js`.

- `xs`: 4px
- `sm`: 8px
- `md`: 16px
- `lg`: 24px
- `xl`: 32px

## 4. Components Library
Components are located in `src/components/ui/`.

### Basic Inputs
- **Button:** `src/components/ui/button.jsx` - Variants: default, secondary, ghost, destructive, link.
- **Input:** `src/components/ui/input.jsx`
- **Select:** `src/components/ui/select.jsx`
- **Checkbox:** `src/components/ui/checkbox.jsx`

### Data Display
- **Card:** `src/components/ui/card.jsx` - Header, Title, Content, Footer.
- **Table:** `src/components/ui/table.jsx` - Responsive tables.
- **Badge:** `src/components/ui/badge.jsx` - Status indicators.

### Feedback
- **Alert:** `src/components/ui/alert.jsx` - Contextual messages.
- **Toast:** `src/components/ui/use-toast.js` - Temporary notifications.
- **Skeleton:** `src/components/ui/skeleton.jsx` - Loading states.

### Navigation & Layout
- **AppLayout:** `src/layouts/AppLayout.jsx` - Main application shell.
- **PageHeader:** `src/components/PageHeader.jsx` - Standard page titles and breadcrumbs.
- **SidebarOverride:** `src/components/SidebarOverride.jsx` - Configurable navigation menu.

## 5. Usage Example

\`\`\`jsx
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import PageHeader from '@/components/PageHeader';

export default function MyPage() {
  return (
    <div className="p-6 space-y-6">
      <PageHeader 
        title="My Page" 
        breadcrumbs={[{ label: 'Home', path: '/' }, { label: 'My Page' }]}
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Content Section</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="default">Action</Button>
        </CardContent>
      </Card>
    </div>
  );
}
\`\`\`

## 6. Menu Configuration
The sidebar menu is data-driven and defined in `src/config/menuStructure.js`. To add new pages:
1. Open `src/config/menuStructure.js`.
2. Locate the relevant module (e.g., 'analytics').
3. Add a new object to `subItems`: `{ id: 'unique-id', label: 'Page Name', path: '/path' }`.