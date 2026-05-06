export interface HeatmapDay {
  date: string;
  count: number;
}

interface Props {
  year: number;
  days: HeatmapDay[];
}

const CELL = 11;
const GAP = 2;

export function Heatmap({ year, days }: Props) {
  const byDate = new Map(days.map((d) => [d.date, d.count]));
  const max = Math.max(1, ...days.map((d) => d.count));

  const start = new Date(Date.UTC(year, 0, 1));
  const dayOfWeek = start.getUTCDay();
  const totalDays = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 366 : 365;

  const cells: { date: string; count: number; col: number; row: number }[] = [];
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(Date.UTC(year, 0, 1 + i));
    const date = d.toISOString().slice(0, 10);
    const dayIndex = i + dayOfWeek;
    cells.push({
      date,
      count: byDate.get(date) ?? 0,
      col: Math.floor(dayIndex / 7),
      row: dayIndex % 7,
    });
  }
  const cols = Math.ceil((totalDays + dayOfWeek) / 7);
  const width = cols * (CELL + GAP) - GAP;
  const height = 7 * (CELL + GAP) - GAP;

  return (
    <svg width={width} height={height} role="img" aria-label={`${year} heatmap`}>
      {cells.map((c) => {
        const intensity = c.count / max;
        const fill =
          c.count === 0
            ? "var(--rule-soft)"
            : `color-mix(in srgb, var(--accent) ${Math.round(20 + intensity * 80)}%, transparent)`;
        return (
          <rect
            key={c.date}
            x={c.col * (CELL + GAP)}
            y={c.row * (CELL + GAP)}
            width={CELL}
            height={CELL}
            fill={fill}
          >
            <title>
              {c.date}: {c.count} reviews
            </title>
          </rect>
        );
      })}
    </svg>
  );
}
