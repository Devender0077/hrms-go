# Accessibility Guidelines

This document outlines the accessibility standards and best practices for the HRMS application.

## Quick Fix for Accessibility Warnings

If you see the warning: **"If you do not provide a visible label, you must specify an aria-label or aria-labelledby attribute for accessibility"**

### For Icon-only Buttons:
```tsx
// ❌ Bad - Missing aria-label
<Button isIconOnly size="sm" variant="light">
  <Icon icon="lucide:more-horizontal" />
</Button>

// ✅ Good - With aria-label
<Button isIconOnly size="sm" variant="light" aria-label="More actions">
  <Icon icon="lucide:more-horizontal" />
</Button>
```

### For Form Inputs:
```tsx
// ❌ Bad - Missing aria-label
<Input placeholder="Search..." />

// ✅ Good - With aria-label
<Input placeholder="Search..." aria-label="Search employees" />
```

### For Dropdown Triggers:
```tsx
// ❌ Bad - Missing aria-label
<DropdownTrigger>
  <Button isIconOnly>
    <Icon icon="lucide:more-vertical" />
  </Button>
</DropdownTrigger>

// ✅ Good - With aria-label
<DropdownTrigger>
  <Button isIconOnly aria-label="Employee actions">
    <Icon icon="lucide:more-vertical" />
  </Button>
</DropdownTrigger>
```

## Common Accessibility Patterns

### 1. Icon-only Buttons
Always provide descriptive `aria-label` attributes:

```tsx
// View action
<Button isIconOnly aria-label="View details">
  <Icon icon="lucide:eye" />
</Button>

// Edit action
<Button isIconOnly aria-label="Edit item">
  <Icon icon="lucide:edit" />
</Button>

// Delete action
<Button isIconOnly aria-label="Delete item">
  <Icon icon="lucide:trash" />
</Button>

// More actions
<Button isIconOnly aria-label="More actions">
  <Icon icon="lucide:more-horizontal" />
</Button>
```

### 2. Table Actions
Use context-specific labels:

```tsx
<Button isIconOnly aria-label="Employee actions">
  <Icon icon="lucide:more-vertical" />
</Button>

<Button isIconOnly aria-label="Department actions">
  <Icon icon="lucide:more-vertical" />
</Button>

<Button isIconOnly aria-label="Asset actions">
  <Icon icon="lucide:more-vertical" />
</Button>
```

### 3. Form Controls
Provide labels for all form inputs:

```tsx
// Input with label
<Input 
  label="Employee Name"
  placeholder="Enter employee name"
  aria-label="Employee name"
/>

// Select with label
<Select 
  label="Department"
  aria-label="Select department"
>
  <SelectItem key="hr">HR</SelectItem>
  <SelectItem key="it">IT</SelectItem>
</Select>
```

### 4. Navigation
Use descriptive labels for navigation:

```tsx
<Button aria-label="Navigate to dashboard">
  <Icon icon="lucide:home" />
</Button>

<Button aria-label="View notifications">
  <Icon icon="lucide:bell" />
</Button>
```

## Using the Accessibility Utility

Import and use the accessibility utility functions:

```tsx
import { getIconButtonAriaLabel, getTableActionAriaLabel } from '@/utils/accessibility';

// For icon buttons
<Button 
  isIconOnly 
  aria-label={getIconButtonAriaLabel('lucide:eye', 'employee')}
>
  <Icon icon="lucide:eye" />
</Button>

// For table actions
<Button 
  isIconOnly 
  aria-label={getTableActionAriaLabel('edit', 'employee')}
>
  <Icon icon="lucide:edit" />
</Button>
```

## Testing Accessibility

### Browser DevTools
1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Run accessibility audit
4. Check for accessibility issues

### Screen Reader Testing
- Use NVDA (Windows) or VoiceOver (Mac) to test with screen readers
- Ensure all interactive elements are accessible via keyboard navigation

### Keyboard Navigation
- Test that all interactive elements are reachable via Tab key
- Ensure proper focus indicators are visible
- Test that Enter/Space keys work for buttons

## Common Issues and Solutions

### Issue: "Missing aria-label"
**Solution**: Add `aria-label` attribute to the element

### Issue: "Interactive element must be focusable"
**Solution**: Add `tabIndex={0}` to the element

### Issue: "Form control must have associated label"
**Solution**: Add `aria-label` or associate with a `<label>` element

### Issue: "Image must have alt text"
**Solution**: Add `alt` attribute to `<img>` elements

## Resources

- [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/WCAG21/quickref/)
- [React Accessibility Guide](https://reactjs.org/docs/accessibility.html)
- [HeroUI Accessibility](https://heroui.com/docs/components/accessibility)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

## Checklist

Before submitting code, ensure:

- [ ] All icon-only buttons have `aria-label` attributes
- [ ] All form inputs have proper labels
- [ ] All images have `alt` attributes
- [ ] All interactive elements are keyboard accessible
- [ ] Color contrast meets WCAG standards
- [ ] Focus indicators are visible
- [ ] Screen reader testing completed
- [ ] Keyboard navigation works properly
