# AgentSphere Main App - Dark Theme Update Prompt

## Objective

Update the main AgentSphere application to use a dark theme that matches the AR Viewer and AR Hub deployment interface.

## Target Color Scheme

### Background Colors

- **Main container background**: `bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900`
- **Card backgrounds**: `bg-slate-800/90 backdrop-blur-sm` with `border border-slate-700/50`
- **Secondary containers**: `bg-slate-700/50 backdrop-blur-sm` with `border border-slate-600`
- **Tertiary backgrounds**: `bg-slate-700/30`

### Text Colors

- **Headings (h1, h2, h3)**: `text-white`
- **Primary text**: `text-slate-200` or `text-slate-300`
- **Secondary text/labels**: `text-slate-300` or `text-slate-400`
- **Helper text/descriptions**: `text-slate-400`
- **Disabled text**: `text-slate-500`

### Form Elements

- **Input fields**: `bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400`
- **Focus states**: `focus:ring-2 focus:ring-blue-500 focus:border-blue-500`
- **Select dropdowns**: Same as input fields
- **Textareas**: Same as input fields
- **Checkboxes**: `bg-slate-600 border-slate-500 text-blue-400`

### Button Colors

- **Primary buttons**: `bg-gradient-to-r from-blue-600 to-purple-700` with `hover:shadow-lg hover:shadow-blue-500/50`
- **Secondary buttons**: `bg-slate-700 hover:bg-slate-600 border border-slate-600`
- **Success buttons**: `bg-gradient-to-r from-green-600 to-emerald-600`
- **Danger buttons**: `bg-gradient-to-r from-red-600 to-pink-600`

### Accent Colors & Icons

- **Primary icons**: `text-blue-400`
- **Success states**: `text-green-400`
- **Warning states**: `text-yellow-400`
- **Error states**: `text-red-400`
- **Info states**: `text-blue-300`

### Alert/Notice Boxes

- **Success**: `bg-green-500/10 border border-green-500/30 text-green-300`
- **Error**: `bg-red-500/10 border border-red-500/30 text-red-300`
- **Warning**: `bg-yellow-500/10 border border-yellow-500/30 text-yellow-300`
- **Info**: `bg-blue-500/10 border border-blue-500/30 text-blue-300`

### Badges & Tags

- **Default**: `bg-blue-500/20 text-blue-300 border border-blue-500/30`
- **Success**: `bg-green-500/20 text-green-300 border border-green-500/30`
- **Warning**: `bg-yellow-500/20 text-yellow-300 border border-yellow-500/30`

### Special Effects

- **Glow on selected items**: `shadow-lg shadow-blue-500/20`
- **Hover effects**: `hover:bg-slate-700/70 transition-all duration-200`
- **Active states**: `border-blue-500 bg-blue-500/20`

## Files to Update

### Core Components

1. **Home page** (`src/components/Home.tsx` or `src/pages/Home.tsx`)

   - Update hero section backgrounds
   - Update navigation elements
   - Update CTA buttons to gradient style

2. **Navigation/Header** (`src/components/Header.tsx` or similar)

   - Dark background with transparency
   - White text for links
   - Blue accents for active states

3. **Agent Cards/List** (wherever agents are displayed)

   - Card backgrounds: `bg-slate-700/50 border border-slate-600`
   - Hover effects with blue glow
   - White text for titles, slate for descriptions

4. **Forms** (any form components)

   - All input fields to dark theme
   - Labels to slate-300
   - Validation messages with appropriate colors

5. **Modals/Dialogs**
   - Dark backgrounds with backdrop blur
   - Border with slate colors
   - White headings

## Find and Replace Patterns

### Background Replacements

```
bg-white → bg-slate-800/90 backdrop-blur-sm
bg-gray-50 → bg-slate-700/50 backdrop-blur-sm
bg-gray-100 → bg-slate-700/30
bg-green-50 → bg-green-500/10
bg-blue-50 → bg-blue-500/10
bg-red-50 → bg-red-500/10
bg-yellow-50 → bg-yellow-500/10
```

### Text Color Replacements

```
text-gray-900 → text-white
text-gray-800 → text-slate-200
text-gray-700 → text-slate-300
text-gray-600 → text-slate-300
text-gray-500 → text-slate-400
text-gray-400 → text-slate-400

text-green-800 → text-green-300
text-green-700 → text-green-300
text-green-600 → text-green-400

text-blue-800 → text-blue-300
text-blue-700 → text-blue-300
text-blue-600 → text-blue-400

text-red-800 → text-red-300
text-red-700 → text-red-300
text-red-600 → text-red-400
```

### Border Replacements

```
border-gray-200 → border-slate-600
border-gray-300 → border-slate-600
border-blue-200 → border-blue-500/30
border-green-200 → border-green-500/30
border-red-200 → border-red-500/30
```

### Button Replacements

```
bg-green-500 to-emerald-600 → bg-blue-600 to-purple-700
(OR keep green for specific success actions)

focus:ring-green-500 → focus:ring-blue-500
```

## Component-Specific Updates

### Agent Deployment Success/Status

- Keep green for success states but use dark theme green: `text-green-400`, `bg-green-500/10`

### Network Selection/Status

- Use blue accents for active network
- Slate for inactive/disabled networks

### Wallet Connection Badge

- `bg-green-500/10 border border-green-500/30`
- `text-green-300` for wallet address
- `text-green-400` for checkmark icon

### Revenue/Earnings Displays

- Use green gradient: `from-green-500/10 to-emerald-500/10`
- Green text for amounts: `text-green-400`
- White/slate for labels

## Implementation Steps

1. **Start with the main layout/container**

   - Update root background to dark gradient
   - Ensure proper contrast ratios

2. **Update navigation and header**

   - Dark background
   - White/light text
   - Blue active states

3. **Update all card components**

   - Dark backgrounds with borders
   - Update internal text colors
   - Add hover effects

4. **Update all form elements**

   - Dark inputs with proper contrast
   - Update labels and helper text
   - Ensure placeholders are visible

5. **Update buttons and interactive elements**

   - Gradient primary buttons
   - Proper hover and focus states
   - Consistent sizing and spacing

6. **Update alert/notification components**

   - Semi-transparent backgrounds
   - Colored borders
   - Light text

7. **Test contrast and accessibility**
   - Ensure text is readable
   - Check focus indicators
   - Verify color-blind friendly combinations

## Visual Examples from AR Hub

### Container Structure

```jsx
<div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-8">
  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
    <motion.div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-slate-700/50">
      {/* Content */}
    </motion.div>
  </div>
</div>
```

### Section Header

```jsx
<h2 className="text-2xl font-bold text-white flex items-center">
  <Icon className="h-6 w-6 mr-2 text-blue-400" />
  Section Title
</h2>
```

### Form Field

```jsx
<div>
  <label className="block text-sm font-medium text-slate-300 mb-2">
    Field Label
  </label>
  <input
    type="text"
    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400"
    placeholder="Enter value..."
  />
</div>
```

### Info Box

```jsx
<div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
  <p className="text-sm text-blue-200">
    <strong>Note:</strong> Information message here
  </p>
</div>
```

### Primary Button

```jsx
<button className="w-full flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-700 text-white text-lg font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
  Button Text
</button>
```

## Testing Checklist

- [ ] All text is readable with proper contrast
- [ ] Forms are usable and inputs are visible
- [ ] Buttons have clear hover and focus states
- [ ] Cards have proper depth and hierarchy
- [ ] Icons are visible and properly colored
- [ ] Success/error/warning states are clear
- [ ] Mobile responsive design maintained
- [ ] Dark theme consistent across all pages
- [ ] No white/light artifacts remaining
- [ ] Loading states are visible

## Color Reference Quick Guide

```css
/* Backgrounds */
--bg-main: from-slate-900 via-blue-900 to-slate-900
--bg-card-primary: bg-slate-800/90
--bg-card-secondary: bg-slate-700/50
--bg-input: bg-slate-700/50

/* Text */
--text-heading: text-white
--text-primary: text-slate-200
--text-secondary: text-slate-300
--text-tertiary: text-slate-400

/* Borders */
--border-primary: border-slate-700/50
--border-secondary: border-slate-600

/* Accents */
--accent-primary: text-blue-400
--accent-success: text-green-400
--accent-warning: text-yellow-400
--accent-error: text-red-400

/* Buttons */
--btn-primary: from-blue-600 to-purple-700
--btn-success: from-green-600 to-emerald-600
--btn-secondary: bg-slate-700
```

## Notes

- Maintain consistency with AR Viewer (`/hmr` route) and AR Hub (`/deploy` route)
- Use backdrop-blur for glassmorphism effects where appropriate
- Add subtle shadows and glows for depth
- Ensure animations and transitions remain smooth
- Keep green colors for success/revenue indicators
- Use blue as primary accent color throughout
