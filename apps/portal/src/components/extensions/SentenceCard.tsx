import { type FuriganaPair, FuriganaText } from "./FuriganaText.tsx";
import { type Rating, ReviewButtonGroup } from "./ReviewButton.tsx";

interface Props {
  furigana: FuriganaPair[];
  english: string;
  focusWord: string;
  glosses: string[];
  source?: string;
  onRate?: (r: Rating) => void;
}

export function SentenceCard({ furigana, english, focusWord, glosses, source, onRate }: Props) {
  return (
    <div
      style={{
        borderTop: "1px solid var(--ink)",
        borderBottom: "1px solid var(--ink)",
        padding: "32px 0",
        background: "var(--paper)",
      }}
    >
      {source && (
        <div className="meta" style={{ marginBottom: 12 }}>
          {source}
        </div>
      )}
      <FuriganaText pairs={furigana} size={32} />
      <div style={{ borderTop: "1px solid var(--rule-soft)", margin: "20px 0" }} />
      <div className="meta" style={{ marginBottom: 4 }}>
        Focus
      </div>
      <div className="serif" style={{ fontSize: 22 }}>
        {focusWord}
      </div>
      <div className="meta" style={{ marginTop: 16, marginBottom: 4 }}>
        Meaning
      </div>
      <div className="serif" style={{ fontSize: 18 }}>
        {english}
      </div>
      {glosses.length > 0 && (
        <>
          <div className="meta" style={{ marginTop: 16, marginBottom: 4 }}>
            Glosses
          </div>
          <ul className="sans" style={{ paddingLeft: 18, fontSize: 14 }}>
            {glosses.map((g, i) => (
              <li key={i}>{g}</li>
            ))}
          </ul>
        </>
      )}
      {onRate && (
        <div style={{ marginTop: 24 }}>
          <ReviewButtonGroup onRate={onRate} />
        </div>
      )}
    </div>
  );
}
