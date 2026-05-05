export interface FuriganaPair {
  base: string;
  reading: string;
}

interface Props {
  pairs: FuriganaPair[];
  size?: number;
  className?: string;
}

export function FuriganaText({ pairs, size = 28, className }: Props) {
  return (
    <span
      className={className}
      style={{ fontFamily: "'Newsreader', serif", fontSize: size, lineHeight: 1.6 }}
    >
      {pairs.map((p, i) =>
        p.reading ? (
          <ruby key={i}>
            {p.base}
            <rt
              style={{
                fontSize: size * 0.45,
                fontFamily: "'Geist', sans-serif",
                letterSpacing: "0.02em",
                color: "var(--ink-soft)",
              }}
            >
              {p.reading}
            </rt>
          </ruby>
        ) : (
          <span key={i}>{p.base}</span>
        ),
      )}
    </span>
  );
}
