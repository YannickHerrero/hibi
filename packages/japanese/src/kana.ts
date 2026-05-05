const KATAKANA_START = 0x30a1;
const KATAKANA_END = 0x30f6;
const HIRAGANA_OFFSET = 0x60;

export function katakanaToHiragana(input: string): string {
  let out = "";
  for (const ch of input) {
    const code = ch.codePointAt(0);
    if (code === undefined) continue;
    if (code >= KATAKANA_START && code <= KATAKANA_END) {
      out += String.fromCodePoint(code - HIRAGANA_OFFSET);
    } else {
      out += ch;
    }
  }
  return out;
}
