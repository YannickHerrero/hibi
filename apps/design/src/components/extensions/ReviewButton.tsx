export type Rating = 1 | 2 | 3 | 4;

const LABELS: Record<Rating, string> = { 1: "Again", 2: "Hard", 3: "Good", 4: "Easy" };

interface Props {
  rating: Rating;
  onClick: (rating: Rating) => void;
}

export function ReviewButton({ rating, onClick }: Props) {
  const isPrimary = rating === 3;
  const isAgain = rating === 1;
  return (
    <button
      type="button"
      onClick={() => onClick(rating)}
      style={{
        flex: 1,
        padding: "16px 12px",
        border: "1px solid var(--ink)",
        borderLeft: rating === 1 ? "1px solid var(--ink)" : "none",
        background: isPrimary ? "var(--accent)" : "transparent",
        color: isPrimary ? "var(--paper)" : isAgain ? "var(--accent)" : "var(--ink)",
        fontFamily: "'Geist Mono', monospace",
        fontSize: 11,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        cursor: "pointer",
      }}
    >
      {LABELS[rating]}
    </button>
  );
}

export function ReviewButtonGroup({ onRate }: { onRate: (r: Rating) => void }) {
  return (
    <div style={{ display: "flex" }}>
      {([1, 2, 3, 4] as Rating[]).map((r) => (
        <ReviewButton key={r} rating={r} onClick={onRate} />
      ))}
    </div>
  );
}
