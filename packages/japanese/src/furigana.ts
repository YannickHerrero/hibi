import { katakanaToHiragana } from "./kana.ts";
import type { Token } from "./token.ts";

export interface FuriganaPair {
  base: string;
  reading: string;
}

const KANJI_RE = /[一-鿿㐀-䶿]/;

function hasKanji(s: string): boolean {
  return KANJI_RE.test(s);
}

export function buildFurigana(tokens: Token[]): FuriganaPair[] {
  return tokens.map((t) => {
    if (!hasKanji(t.surface)) {
      return { base: t.surface, reading: "" };
    }
    return { base: t.surface, reading: katakanaToHiragana(t.reading) };
  });
}
