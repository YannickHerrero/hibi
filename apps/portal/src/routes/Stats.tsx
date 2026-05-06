import { useMemo, useState } from "react";
import { Heatmap } from "../components/extensions/Heatmap.tsx";
import {
  HEATMAP_YEARS_OFFERED,
  fakeDailyToday,
  fakeHeatmap,
  fakeOverview,
  fakeRetention,
} from "../lib/fake-stats.ts";

export function Stats() {
  const [year, setYear] = useState<number>(HEATMAP_YEARS_OFFERED[HEATMAP_YEARS_OFFERED.length - 1]!);

  const overview = useMemo(() => fakeOverview(), []);
  const today = useMemo(() => fakeDailyToday(), []);
  const heatmap = useMemo(() => fakeHeatmap(year), [year]);
  const retention = useMemo(() => fakeRetention(), []);

  return (
    <>
      <section className="block">
        <div className="meta">Mock data — wire up the API to see real numbers</div>
        <h1 className="display" style={{ fontSize: 44, marginTop: 8 }}>
          Stats
        </h1>
      </section>

      <section className="block">
        <div className="grid-4">
          <StatCard label="Due now" value={overview.dueNow} hint="Cards ready to review" />
          <StatCard
            label="Reviews today"
            value={overview.reviewsToday}
            hint={`${today.again} again · ${today.hard} hard · ${today.good} good · ${today.easy} easy`}
          />
          <StatCard label="Streak" value={overview.streakDays} hint="Consecutive days" />
          <StatCard label="Total cards" value={overview.totalCards} hint="In your deck" />
        </div>
      </section>

      <div className="rule-soft" style={{ margin: "48px 0 0" }} />

      <section className="block">
        <div className="section-title">
          <span className="display" style={{ fontSize: 24 }}>
            Heatmap
          </span>
          <div className="btn-segment" role="group" aria-label="Year">
            {HEATMAP_YEARS_OFFERED.map((y) => (
              <button
                type="button"
                key={y}
                className={y === year ? "active" : undefined}
                onClick={() => setYear(y)}
              >
                {y}
              </button>
            ))}
          </div>
        </div>
        <div style={{ overflowX: "auto", paddingBottom: 12 }}>
          <Heatmap year={heatmap.year} days={heatmap.days} />
        </div>
      </section>

      <div className="rule-soft" style={{ margin: "48px 0 0" }} />

      <section className="block">
        <div className="section-title">
          <span className="display" style={{ fontSize: 24 }}>
            Retention
          </span>
          <span className="meta">By interval</span>
        </div>
        <table className="tokens">
          <thead>
            <tr>
              <th>Interval (days)</th>
              <th>Retention</th>
              <th style={{ textAlign: "right" }}>Sample</th>
            </tr>
          </thead>
          <tbody>
            {retention.points.map((p) => (
              <tr key={p.intervalDays}>
                <td>{p.intervalDays}</td>
                <td>
                  <RetentionBar value={p.retention} />
                </td>
                <td style={{ textAlign: "right" }}>{p.sampleSize}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint: string;
}) {
  return (
    <div className="stat-card">
      <div className="meta">{label}</div>
      <div className="num" style={{ marginTop: 6 }}>
        {value.toLocaleString()}
      </div>
      <div className="meta" style={{ marginTop: 8, color: "var(--ink-faint)" }}>
        {hint}
      </div>
    </div>
  );
}

function RetentionBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div
        style={{
          flex: 1,
          height: 6,
          background: "var(--rule-soft)",
          maxWidth: 240,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: `${pct}%`,
            background: "var(--accent)",
          }}
        />
      </div>
      <span style={{ minWidth: 48 }}>{pct}%</span>
    </div>
  );
}
