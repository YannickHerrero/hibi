# Hibi DS Extensions v0.1 — based on Torakaa, 2026-05-05

This document specifies **Hibi-specific** components built on top of the Torakaa Design System foundations (color, typography, spacing, radii, motion). It does NOT restate Torakaa — read the Torakaa spec for foundations.

The reference implementation for web lives at `apps/design/src/components/extensions/`.

## Conventions

- Reference tokens by CSS variable name: `var(--accent)`, `var(--ink)`, `var(--paper)`, etc. Never raw color values.
- Each component has a 3-sentence behavior summary, a props table, and platform notes.
- Default Torakaa variant for the Hibi portal: **`paper`**. Other variants are user-selectable themes.

---

## SentenceCard

The primary review surface. Renders a Japanese sentence with furigana, the focus word, the English translation, optional glosses, and the four FSRS rating buttons. Always full-bleed within the page gutter; the top and bottom rules are 1px `var(--ink)`.

| Prop | Type | Notes |
|---|---|---|
| `furigana` | `FuriganaPair[]` | Pre-built; never re-tokenized at render time |
| `english` | `string` | Translation |
| `focusWord` | `string` | The mined token |
| `glosses` | `string[]` | Dictionary glosses, populated at mining time |
| `source` | `string?` | e.g. "One Piece S1E47 12:34" |
| `onRate` | `(r: 1\|2\|3\|4) => void` | Submits the rating |

**Web**: uses `<ruby>` for furigana. **RN**: uses a custom layout (no native ruby) — render reading as a small line above each kanji span.

---

## FuriganaText

Renders Japanese text with reading annotations above kanji-bearing tokens. Pure presentation — does no tokenization, no dictionary lookup. The data shape is a flat `FuriganaPair[]` produced at mining time and stored on `cards.furigana`.

| Prop | Type | Notes |
|---|---|---|
| `pairs` | `FuriganaPair[]` | `{ base, reading }` — empty `reading` for non-kanji parts |
| `size` | `number?` | Base font size in px (default 28) |

**Web**: `<ruby>` + `<rt>`, ruby font is Geist at 45% of base size in `var(--ink-soft)`.
**RN**: stack `<View>` with two `<Text>` rows; reading uses `Text` with smaller font.

---

## ReviewButton / ReviewButtonGroup

Four-rating row driving the FSRS submit. Mapping: 1 = Again, 2 = Hard, 3 = Good, 4 = Easy. The Good (3) variant uses `var(--accent)` background with `var(--paper)` text; Again (1) uses transparent background with accent-color text; the others use the editorial outlined style.

**Group prop**: `onRate: (r: 1|2|3|4) => void`. The group renders all four side-by-side, sharing the row's borders.

**Platform notes**: identical visual model on web and RN. Use Pressable/TouchableOpacity on RN.

---

## KanjiTable

Tabular display of kanji entries pulled from the card's `kanjiList`. Three columns: kanji glyph (Newsreader, large), meaning, and WaniKani level (right-aligned, em-dash if `null`). Hairline below each row using `var(--rule-soft)`.

| Prop | Type | Notes |
|---|---|---|
| `entries` | `KanjiEntry[]` | `{ kanji, meaning, wanikaniLevel }` |

---

## Heatmap

Yearly grid of review counts, rendered as SVG. 7 rows × ~52 columns (one cell per day), color-mixed `var(--accent)` with opacity proportional to `count / max`. Empty cells use `var(--rule-soft)`. Tooltips via SVG `<title>`.

| Prop | Type | Notes |
|---|---|---|
| `year` | `number` | The grid's calendar year |
| `days` | `HeatmapDay[]` | `{ date: 'YYYY-MM-DD', count }` |

**Web**: SVG. **RN**: `react-native-svg` with the same shape.

---

## DictionaryPopup

Yomitan-style popup driven by the **client's local JMdict store**, never the API. Shows the term in `serif`, the reading in `meta`, then per-sense rows of POS tags + glosses. Optional "Add to deck" action.

| Prop | Type | Notes |
|---|---|---|
| `term` | `string` | Headword |
| `reading` | `string` | Hiragana reading |
| `senses` | `Sense[]` | `{ partOfSpeech: string[], glosses: string[] }` |
| `onAdd` | `() => void?` | If present, renders a `.btn-ghost` action |

**Interaction**:
- Tsumu (web): hover over a token in `TokenizedText` opens the popup.
- Horu (mobile): long-press a token.

**Platform notes**: this is the most divergent component between web and RN. The shape and content are the same; the trigger differs.

---

## TokenizedText

Interactive run of tokens that drive the popup. Each token is a hover/press target; on selection it bubbles a `Token` payload to the parent so the parent can position and populate a `DictionaryPopup`.

| Prop | Type | Notes |
|---|---|---|
| `tokens` | `Token[]` | From `@hibi/japanese` |
| `onSelect` | `(t: Token) => void?` | Selection handler |

Hover state uses `var(--muted)` background with a 100ms ease transition.

---

## Color usage cheatsheet

| Token | Use |
|---|---|
| `--paper` | Page background, primary surface |
| `--paper-alt` | Inset surface (cards on cards, code blocks) |
| `--ink` | Primary text, hairlines |
| `--ink-soft` | Secondary text (meta, glosses) |
| `--ink-faint` | Placeholder text |
| `--rule-soft` | Soft hairline (between rows) |
| `--accent` | Primary action (Good rating, links, important) |
| `--accent-soft` | Hover/focus tints |
| `--muted` | Hover states, light fills |

---

## Open spec gaps

- DictionaryPopup positioning algorithm (anchor + flip behavior near viewport edges).
- ReviewButton accessibility (focus ring, keyboard activation).
- Heatmap month/day-of-week labels — design TBD.
- Empty/loading states for all components.

When implementing, extend this doc rather than hard-coding ad-hoc decisions.
