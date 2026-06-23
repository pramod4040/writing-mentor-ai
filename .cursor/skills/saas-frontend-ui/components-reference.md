# Component Reference

Read this file when implementing the component system.

## Folder structure

```
src/components/
├── ui/           # Primitives: button, input, card, badge, modal
├── layout/       # container, navbar, sidebar
└── [feature]/    # Feature-specific compositions
```

## Container

```tsx
export function Container({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}
```

## Button variants

Use `cva` (class-variance-authority) or equivalent:

| Variant   | Use case                          |
|-----------|-----------------------------------|
| primary   | Main CTA — one per section max    |
| secondary | Alternative actions               |
| ghost     | Tertiary / icon-adjacent actions  |

Required states: `hover`, `focus-visible:ring-2`, `disabled:opacity-50`, `transition-colors duration-200`.

## Card

```tsx
// Base: rounded-xl border border-border/60 bg-card shadow-sm
// Hover lift (optional): whileHover={{ y: -2 }} transition={{ duration: 0.2 }}
```

## Form layout

Wrap forms in `max-w-[480px]`. Stack fields with `gap-4` or `gap-6`. Label above input, muted helper text below.

## Accessibility checklist

- [ ] Semantic HTML (`nav`, `main`, `button`, not div-onClick)
- [ ] `aria-label` on icon-only buttons
- [ ] Visible focus rings on all interactive elements
- [ ] Sufficient color contrast (WCAG AA)
- [ ] `prefers-reduced-motion`: disable or simplify Framer Motion

## Responsive breakpoints

Mobile-first. Common pattern:

- Stack on `default`
- `md:grid-cols-2` for two-column layouts
- `lg:grid-cols-3` for dashboard cards
- Sidebar: hidden on mobile, slide-over or bottom nav alternative

## Motion defaults

```tsx
const fadeIn = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.2 } };
const cardLift = { whileHover: { y: -2 }, transition: { duration: 0.15 } };
```
