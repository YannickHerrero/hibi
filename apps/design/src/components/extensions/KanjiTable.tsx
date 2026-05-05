export interface KanjiEntry {
  kanji: string;
  meaning: string;
  wanikaniLevel: number | null;
}

interface Props {
  entries: KanjiEntry[];
}

export function KanjiTable({ entries }: Props) {
  return (
    <table className="tokens">
      <thead>
        <tr>
          <th style={{ width: 0 }}>K</th>
          <th>Meaning</th>
          <th style={{ width: 0 }}>WK Lvl</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((e, i) => (
          <tr key={i}>
            <td className="serif" style={{ fontSize: 28, paddingRight: 14 }}>
              {e.kanji}
            </td>
            <td>{e.meaning}</td>
            <td style={{ textAlign: "right" }}>{e.wanikaniLevel ?? "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
