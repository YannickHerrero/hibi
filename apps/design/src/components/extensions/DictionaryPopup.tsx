interface Sense {
  partOfSpeech: string[];
  glosses: string[];
}

interface Props {
  term: string;
  reading: string;
  senses: Sense[];
  onAdd?: () => void;
}

export function DictionaryPopup({ term, reading, senses, onAdd }: Props) {
  return (
    <div
      style={{
        background: "var(--paper)",
        border: "1px solid var(--ink)",
        padding: 16,
        maxWidth: 360,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <span className="serif" style={{ fontSize: 24 }}>
          {term}
        </span>
        <span className="meta">{reading}</span>
      </div>

      <div className="rule-soft" style={{ margin: "12px 0" }} />

      {senses.map((sense, i) => (
        <div key={i} style={{ marginBottom: 10 }}>
          <span className="meta">{sense.partOfSpeech.join(" · ")}</span>
          <ol className="sans" style={{ paddingLeft: 18, fontSize: 14, marginTop: 2 }}>
            {sense.glosses.map((g, j) => (
              <li key={j}>{g}</li>
            ))}
          </ol>
        </div>
      ))}

      {onAdd && (
        <div style={{ marginTop: 12 }}>
          <button type="button" className="btn-ghost" onClick={onAdd}>
            Add to deck
          </button>
        </div>
      )}
    </div>
  );
}
