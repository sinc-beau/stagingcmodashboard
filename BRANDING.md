# SINC USA Branding Implementation

This document outlines how the SINC USA brand guidelines have been implemented in this application.

## Color Palette

The application uses the official SINC USA color palette defined in `tailwind.config.js`:

### Primary Colors
- **Primary Blue** (`sinc-blue`): `#27AAE1` - Used for headings, buttons, and key highlights
- **Secondary Light Blue** (`sinc-blue-light`): `#D4EBFB` - Soft backgrounds for panels and hover states

### Accent Colors
- **Accent Green** (`sinc-green`): `#83B735` - Special CTAs and highlights
- **Accent Green Hover** (`sinc-green-hover`): `#74A32F` - Hover state for green elements

### Neutral Colors
- **Dark Grey** (`sinc-gray-dark`): `#333333` - Default text and links
- **Dark Grey Hover** (`sinc-gray-dark-hover`): `#242424` - Hover states for dark elements
- **Light Grey** (`sinc-gray-light`): `#F7F7F7` - Default backgrounds and neutral panels
- **Light Grey Hover** (`sinc-gray-light-hover`): `#EFEFEF` - Hover state for light elements

### System Colors
- **Success Green** (`sinc-success`): `#459647` - Success messages and confirmations
- **Warning Gold** (`sinc-warning`): `#E0B252` - Warning messages and alerts

## Typography

### Font Families
The application uses Google Fonts matching SINC's guidelines:

- **Raleway** (`font-heading`): Used for headings and titles
  - Weights: 400, 500, 600, 700
  - Applied to all h1-h6 elements by default

- **Open Sans** (`font-body`): Used for body text, navigation, and buttons
  - Weights: 400, 600, 700
  - Applied to body text by default at 14px with 1.4 line-height

### Usage Examples

```jsx
// Headings (automatically styled)
<h1 className="text-3xl">Main Heading</h1>

// Body text (default styling applied)
<p>Body text uses Open Sans at 14px</p>

// Custom heading with specific font
<h2 className="font-heading font-semibold text-2xl">Section Title</h2>

// Navigation/buttons
<button className="font-body font-semibold uppercase text-sm">
  ACTION
</button>
```

## Color Usage Guidelines

### Buttons

**Primary Actions** (e.g., Join, Submit):
```jsx
<button className="bg-sinc-blue hover:bg-sinc-blue/90 text-white">
  Primary Action
</button>
```

**Special CTAs** (e.g., Sponsorship, Registration):
```jsx
<button className="bg-sinc-green hover:bg-sinc-green-hover text-white">
  Special Action
</button>
```

**Secondary Actions**:
```jsx
<button className="bg-sinc-gray-light hover:bg-sinc-gray-light-hover text-sinc-gray-dark">
  Secondary Action
</button>
```

### Backgrounds

**Panel Backgrounds**:
```jsx
<div className="bg-sinc-blue-light">
  Soft background for cards and callouts
</div>
```

**Page Backgrounds**:
```jsx
<div className="bg-sinc-gray-light">
  Neutral page background
</div>
```

### Text

**Default Text** (automatically applied to body):
```jsx
<p className="text-sinc-gray-dark">Default text color</p>
```

**Links**:
```jsx
<a className="text-sinc-blue hover:text-sinc-blue/80">Link Text</a>
```

**Headings**:
```jsx
<h2 className="text-sinc-blue">Heading in Brand Blue</h2>
```

### System Messages

**Success Messages**:
```jsx
<div className="bg-sinc-success/10 text-sinc-success border border-sinc-success">
  Operation completed successfully
</div>
```

**Warning Messages**:
```jsx
<div className="bg-sinc-warning/10 text-sinc-warning border border-sinc-warning">
  Please review before proceeding
</div>
```

## Design Principles

### Whitespace
- Maintain generous spacing between sections using Tailwind's spacing scale
- Use `p-6` or `p-8` for card/panel padding
- Use `gap-4` or `gap-6` for grid/flex layouts

### Contrast
- Always ensure sufficient contrast between text and backgrounds
- Use dark text on light backgrounds and vice versa
- Test accessibility with WCAG AA standards

### Hierarchy
- Use size and weight to establish visual hierarchy
- Primary headings: `text-2xl font-heading font-semibold`
- Secondary headings: `text-xl font-heading font-medium`
- Body text: Default 14px Open Sans

### Modern, Clean Layout
- Use rounded corners: `rounded-lg` (8px) or `rounded-xl` (12px)
- Use subtle shadows: `shadow-sm` or `shadow-md`
- Prefer borders: `border border-gray-200`

## Component Examples

### Card Component
```jsx
<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
  <h3 className="text-lg font-heading font-semibold text-sinc-gray-dark mb-2">
    Card Title
  </h3>
  <p className="text-sinc-gray-dark">
    Card content with proper spacing and typography
  </p>
</div>
```

### Navigation
```jsx
<nav className="bg-white border-b border-gray-200">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between h-16">
      <button className="font-body font-semibold uppercase text-sm text-sinc-gray-dark hover:text-sinc-blue">
        Menu Item
      </button>
    </div>
  </div>
</nav>
```

### Stats/Metrics Display
```jsx
<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
  <div className="w-12 h-12 bg-sinc-blue/10 rounded-lg flex items-center justify-center mb-4">
    <Icon className="w-6 h-6 text-sinc-blue" />
  </div>
  <h3 className="text-2xl font-heading font-bold text-sinc-gray-dark mb-1">
    42
  </h3>
  <p className="text-sm text-gray-600">
    Metric Label
  </p>
</div>
```

## Updating Existing Components

When updating components to match brand guidelines:

1. Replace generic blue colors with `sinc-blue`
2. Replace green accents with `sinc-green` (use sparingly)
3. Update text colors to use `sinc-gray-dark`
4. Update backgrounds to use `sinc-gray-light` or `white`
5. Ensure buttons use proper color scheme
6. Update icon colors to match their context
7. Apply proper typography classes

## Voice & Tone

When writing copy for the application:

- **Professional**: Use clear, direct language appropriate for senior executives
- **Collaborative**: Emphasize community and partnership
- **Innovative**: Focus on solving future challenges
- **Inclusive**: Reflect diverse, welcoming communities
- **Straightforward**: Avoid jargon, speak directly

## Testing

Before deploying:
1. Check color contrast for accessibility
2. Verify all fonts load correctly
3. Test hover states on interactive elements
4. Ensure consistent spacing throughout
5. Verify the design is responsive across breakpoints
