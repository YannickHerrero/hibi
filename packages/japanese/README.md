# @hibi/japanese

Shared Japanese-language utilities for the Hibi web stack.

**Scope**: small pure-TS helpers that don't pull in tokenizers or dictionaries. Tokenization and JMdict lookups are client-side concerns and live in the mining clients (`hibi-tsumu`, `hibi-horu`, `hibi-kiseki`).

## What's here

- `Token` — normalized token shape produced by either `kuromoji.js` or `kuromoji-react-native`. Lets client code stay platform-agnostic above the tokenizer call.
- `katakanaToHiragana(s)` — converts katakana characters to their hiragana equivalents. Other characters pass through unchanged.
- `buildFurigana(tokens)` — produces the `[{ base, reading }]` array stored in `cards.furigana`.
