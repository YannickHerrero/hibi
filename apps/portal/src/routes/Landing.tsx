import { Link } from "react-router-dom";
import { SentenceCard } from "../components/extensions/SentenceCard.tsx";
import { useAuth } from "../lib/auth.tsx";

const SAMPLE_FURIGANA = [
  { base: "彼女", reading: "かのじょ" },
  { base: "は", reading: "" },
  { base: "本", reading: "ほん" },
  { base: "を", reading: "" },
  { base: "読んでいる", reading: "よんでいる" },
];

export function Landing() {
  const { session } = useAuth();
  const primaryCta = session
    ? { to: "/stats", label: "Open dashboard" }
    : { to: "/login", label: "Sign in" };

  return (
    <>
      <section className="block">
        <div className="meta">№ 01 · A self-hosted SRS</div>
        <h1 className="display" style={{ fontSize: 96, marginTop: 12 }}>
          Hibi
        </h1>
        <p
          className="display italic"
          style={{ fontSize: 44, color: "var(--ink-soft)", marginTop: 4 }}
        >
          day by day
        </p>
        <p
          className="serif"
          style={{ fontSize: 20, marginTop: 24, maxWidth: 640, color: "var(--ink)" }}
        >
          Mine Japanese sentences while you watch. Review them anywhere. Hibi is a flashcard backend
          with a small ecosystem of clients — built on FSRS, hosted on your own infrastructure.
        </p>
        <div style={{ display: "flex", gap: 12, marginTop: 32, flexWrap: "wrap" }}>
          <Link
            to={primaryCta.to}
            className="btn-primary"
            style={{ textDecoration: "none", display: "inline-block" }}
          >
            {primaryCta.label}
          </Link>
          <a
            href="https://docs.hibi.app"
            className="btn-ghost"
            style={{ textDecoration: "none", display: "inline-block" }}
          >
            Read the docs
          </a>
        </div>
      </section>

      <div className="rule-double" style={{ margin: "48px 0" }} />

      <section className="block">
        <div className="meta">In context</div>
        <p className="serif" style={{ marginTop: 8, marginBottom: 24, color: "var(--ink-soft)" }}>
          Every card carries pre-computed furigana, glosses, and kanji breakdowns — so review
          clients render instantly without dictionaries or tokenizers.
        </p>
        <SentenceCard
          furigana={SAMPLE_FURIGANA}
          focusWord="読んでいる"
          english="She is reading a book."
          glosses={["to read", "to peruse"]}
          source="One Piece S1E47 · 12:34"
        />
      </section>

      <div className="rule-soft" style={{ margin: "64px 0 0" }} />

      <section className="block">
        <div className="section-title">
          <span className="display">The ecosystem</span>
          <span className="meta">One API · Many clients</span>
        </div>
        <div className="grid-3">
          <Pillar
            kicker="Mine"
            title="Tsumu · Horu"
            body="Browser extension and mobile app for sentence mining. Hover or long-press a token, see the dictionary popup, send the card."
          />
          <Pillar
            kicker="Review"
            title="Kiseki"
            body="iOS and Android. Clean review surface backed by FSRS scheduling. Online-only, no sync to manage."
          />
          <Pillar
            kicker="Track"
            title="This portal"
            body="Account settings, API keys, and stats. Heatmap, retention curve, daily counts."
          />
        </div>
      </section>

      <div className="rule-soft" style={{ margin: "64px 0 0" }} />

      <section className="block">
        <div className="section-title">
          <span className="display">Why FSRS</span>
          <span className="meta">Modern scheduling</span>
        </div>
        <p className="serif" style={{ fontSize: 18, maxWidth: 720 }}>
          FSRS replaces the SM-2 algorithm Anki has used for decades. It models stability and
          difficulty per card, supports per-user parameter optimization, and predicts retention with
          fewer reviews. Hibi runs the FSRS update server-side in a single transaction per review.
        </p>
        <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a
            href="https://github.com/YannickHerrero/hibi"
            className="btn-ghost"
            style={{ textDecoration: "none", display: "inline-block" }}
          >
            View on GitHub
          </a>
          <a
            href="https://docs.hibi.app/concepts/fsrs"
            className="btn-ghost"
            style={{ textDecoration: "none", display: "inline-block" }}
          >
            FSRS reference
          </a>
        </div>
      </section>
    </>
  );
}

function Pillar({ kicker, title, body }: { kicker: string; title: string; body: string }) {
  return (
    <div>
      <div className="meta">{kicker}</div>
      <div className="serif" style={{ fontSize: 22, marginTop: 6 }}>
        {title}
      </div>
      <p className="sans" style={{ fontSize: 14, marginTop: 8, color: "var(--ink-soft)" }}>
        {body}
      </p>
    </div>
  );
}
