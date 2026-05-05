# @hibi/design

Live reference site for the Hibi design system. Renders all 5 Torakaa variants (`paper`, `stone`, `sage`, `clay`, `ink`) applied to:

- Foundations (color tokens, typography scale, spacing)
- Editorial primitives (display / serif / sans / mono, rules, labels)
- Generic components (buttons, fields, stat cards, charts)
- **Hibi extensions** — domain components for Japanese SRS:
  - `SentenceCard`, `FuriganaText`, `ReviewButton`, `KanjiTable`, `Heatmap`, `DictionaryPopup`, `TokenizedText`

Deploys to `design.hibi.app`.

The CSS tokens, theme variants, and font definitions are ported verbatim from the Torakaa source spec. Component implementations are idiomatic React.

## Dev

```bash
pnpm --filter @hibi/design dev   # http://localhost:5174
pnpm --filter @hibi/design build
```
