import type {
  DailyCount,
  DailyCountResponse,
  HeatmapResponse,
  OverviewResponse,
  RetentionResponse,
} from "@hibi/types";
import { useEffect, useState } from "react";
import { Heatmap } from "../components/extensions/Heatmap.tsx";
import { apiFetch } from "../lib/api.ts";

const CURRENT_YEAR = new Date().getUTCFullYear();
const HEATMAP_YEARS_OFFERED = [CURRENT_YEAR - 2, CURRENT_YEAR - 1, CURRENT_YEAR];

const EMPTY_TODAY: DailyCount = {
  date: new Date().toISOString().slice(0, 10),
  reviews: 0,
  again: 0,
  hard: 0,
  good: 0,
  easy: 0,
};

export function Stats() {
  const [year, setYear] = useState<number>(CURRENT_YEAR);
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [today, setToday] = useState<DailyCount | null>(null);
  const [heatmap, setHeatmap] = useState<HeatmapResponse | null>(null);
  const [retention, setRetention] = useState<RetentionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    apiFetch<OverviewResponse>("/v1/account/stats/overview")
      .then((res) => {
        if (active) setOverview(res);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Could not load overview.");
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const today = new Date().toISOString().slice(0, 10);
    apiFetch<DailyCountResponse>(`/v1/account/stats/daily?from=${today}&to=${today}`)
      .then((res) => {
        if (active) setToday(res.days[0] ?? EMPTY_TODAY);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Could not load today's stats.");
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    setHeatmap(null);
    apiFetch<HeatmapResponse>(`/v1/account/stats/heatmap?year=${year}`)
      .then((res) => {
        if (active) setHeatmap(res);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Could not load heatmap.");
      });
    return () => {
      active = false;
    };
  }, [year]);

  useEffect(() => {
    let active = true;
    apiFetch<RetentionResponse>("/v1/account/stats/retention")
      .then((res) => {
        if (active) setRetention(res);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Could not load retention.");
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <section className="block">
        <h1 className="display" style={{ fontSize: 44 }}>
          Stats
        </h1>
      </section>

      {error && (
        <section className="block">
          <p
            className="meta"
            role="alert"
            style={{ color: "var(--accent)", textTransform: "none", letterSpacing: 0 }}
          >
            {error}
          </p>
        </section>
      )}

      <section className="block">
        <div className="grid-4">
          <StatCard
            label="Due now"
            value={overview?.dueNow ?? null}
            hint="Cards ready to review"
          />
          <StatCard
            label="Reviews today"
            value={overview?.reviewsToday ?? null}
            hint={
              today
                ? `${today.again} again · ${today.hard} hard · ${today.good} good · ${today.easy} easy`
                : "Loading…"
            }
          />
          <StatCard
            label="Streak"
            value={overview?.streakDays ?? null}
            hint="Consecutive days"
          />
          <StatCard
            label="Total cards"
            value={overview?.totalCards ?? null}
            hint="In your deck"
          />
        </div>
      </section>

      <div className="rule-soft" style={{ margin: "48px 0 0" }} />

      <section className="block">
        <div className="section-title">
          <span className="display" style={{ fontSize: 24 }}>
            Heatmap
          </span>
          <fieldset className="btn-segment" style={{ border: "none", padding: 0, margin: 0 }}>
            <legend style={{ position: "absolute", left: -9999, top: -9999 }}>Year</legend>
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
          </fieldset>
        </div>
        <div style={{ overflowX: "auto", paddingBottom: 12 }}>
          {heatmap ? (
            <Heatmap year={heatmap.year} days={heatmap.days} />
          ) : (
            <p className="meta">Loading…</p>
          )}
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
        {retention ? (
          retention.points.length > 0 ? (
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
          ) : (
            <p className="meta">Not enough reviews yet.</p>
          )
        ) : (
          <p className="meta">Loading…</p>
        )}
      </section>
    </>
  );
}

function StatCard({ label, value, hint }: { label: string; value: number | null; hint: string }) {
  return (
    <div className="stat-card">
      <div className="meta">{label}</div>
      <div className="num" style={{ marginTop: 6 }}>
        {value === null ? "—" : value.toLocaleString()}
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
