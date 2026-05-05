import { useState } from "react";

export interface Token {
  surface: string;
  pos: string;
  basicForm: string;
  reading: string;
}

interface Props {
  tokens: Token[];
  onSelect?: (token: Token) => void;
  fontSize?: number;
}

export function TokenizedText({ tokens, onSelect, fontSize = 22 }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  return (
    <span style={{ fontFamily: "'Newsreader', serif", fontSize, lineHeight: 1.6 }}>
      {tokens.map((t, i) => (
        <span
          key={i}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(null)}
          onClick={() => onSelect?.(t)}
          style={{
            background: hover === i ? "var(--muted)" : "transparent",
            cursor: onSelect ? "pointer" : "default",
            transition: "background 100ms ease",
            padding: "0 1px",
          }}
        >
          {t.surface}
        </span>
      ))}
    </span>
  );
}
