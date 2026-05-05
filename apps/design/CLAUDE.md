# CLAUDE.md — apps/design

Live reference site for the Hibi design system. Renders all 5 Torakaa variants applied to the editorial primitives + Hibi extensions. Deploys to `design.hibi.app`.

## Source of truth

The CSS tokens, theme variants, and `@font-face` declarations are ported verbatim from the Torakaa source (`../../hibi-design-system.html` in the parent ecosystem dir). The original file is a self-extracting bundle: 12 woff2 fonts and one large HTML/CSS string. Both have been decoded and committed.

## Layout

```
public/fonts/                       // 12 woff2 files (UUID-named, matching the Torakaa source)
src/
  styles/
    fonts.css                       // @font-face rules → /fonts/<uuid>.woff2
    tokens.css                      // :root + html[data-theme="..."] for 5 variants
    globals.css                     // body resets + .display/.serif/.sans/.mono/.label/.meta
    components.css                  // .btn-primary/.field/.swatch/.theme-bar/etc.
    index.css                       // @imports the four above
  lib/
    theme.ts                        // useTheme() + ThemeName + THEME_SWATCHES
  components/
    Masthead.tsx
    ThemeBar.tsx                    // 5 swatch pills, persists to localStorage
    sections/                       // one component per design section
    extensions/                     // SentenceCard, FuriganaText, ReviewButton, etc.
```

## Theme switching

Set via `data-theme` attribute on `<html>`. Persists in localStorage under key `hibi.design.theme`. The 5 named variants are `paper` (default), `stone`, `sage`, `clay`, `ink`.

## Hibi extensions

Domain components live in `src/components/extensions/`. Each is a faithful render of the spec in `DESIGN_SYSTEM.md` at the repo root. Reference Torakaa tokens by CSS variable name (e.g. `var(--accent)`), never raw colors.

## Dev

```bash
pnpm --filter @hibi/design dev   # http://localhost:5174
pnpm --filter @hibi/design build
```
