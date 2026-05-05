import { DictionaryPopup } from "../extensions/DictionaryPopup.tsx";
import { Heatmap } from "../extensions/Heatmap.tsx";
import { KanjiTable } from "../extensions/KanjiTable.tsx";
import { SentenceCard } from "../extensions/SentenceCard.tsx";
import { TokenizedText } from "../extensions/TokenizedText.tsx";

const SAMPLE_FURIGANA = [
  { base: "彼女", reading: "かのじょ" },
  { base: "は", reading: "" },
  { base: "本", reading: "ほん" },
  { base: "を", reading: "" },
  { base: "読んでいる", reading: "よんでいる" },
];

const SAMPLE_KANJI = [
  { kanji: "彼", meaning: "he, that one", wanikaniLevel: 4 },
  { kanji: "女", meaning: "woman, female", wanikaniLevel: 1 },
  { kanji: "本", meaning: "book, origin", wanikaniLevel: 1 },
  { kanji: "読", meaning: "read", wanikaniLevel: 7 },
];

const SAMPLE_TOKENS = SAMPLE_FURIGANA.map((p) => ({
  surface: p.base,
  pos: "noun",
  basicForm: p.base,
  reading: p.reading,
}));

const SAMPLE_HEATMAP = Array.from({ length: 90 }, (_, i) => {
  const d = new Date(Date.UTC(2026, 0, 1 + i));
  return {
    date: d.toISOString().slice(0, 10),
    count: Math.round(Math.max(0, 10 + 8 * Math.sin(i / 6) + (i % 7 === 0 ? -8 : 0))),
  };
});

export function HibiExtensionsSection() {
  return (
    <section className="block">
      <div className="section-title">
        <span className="display">Hibi extensions</span>
        <span className="meta">Domain components on Torakaa</span>
      </div>

      <div className="grid-2">
        <div>
          <div className="meta">SentenceCard</div>
          <div style={{ marginTop: 10 }}>
            <SentenceCard
              furigana={SAMPLE_FURIGANA}
              focusWord="読んでいる"
              english="She is reading a book."
              glosses={["to read"]}
              source="One Piece S1E47 12:34"
              onRate={() => undefined}
            />
          </div>
        </div>
        <div>
          <div className="meta">KanjiTable</div>
          <div style={{ marginTop: 10 }}>
            <KanjiTable entries={SAMPLE_KANJI} />
          </div>
          <div className="meta" style={{ marginTop: 24 }}>
            TokenizedText
          </div>
          <div style={{ marginTop: 10 }}>
            <TokenizedText tokens={SAMPLE_TOKENS} />
          </div>
          <div className="meta" style={{ marginTop: 24 }}>
            DictionaryPopup
          </div>
          <div style={{ marginTop: 10 }}>
            <DictionaryPopup
              term="読む"
              reading="よむ"
              senses={[
                {
                  partOfSpeech: ["v5m", "vt"],
                  glosses: ["to read", "to peruse"],
                },
                {
                  partOfSpeech: ["v5m"],
                  glosses: ["to guess (the answer)"],
                },
              ]}
              onAdd={() => undefined}
            />
          </div>
        </div>
      </div>

      <div className="meta" style={{ marginTop: 32 }}>
        Heatmap (sample, first 90 days of 2026)
      </div>
      <div style={{ marginTop: 10, overflowX: "auto" }}>
        <Heatmap year={2026} days={SAMPLE_HEATMAP} />
      </div>
    </section>
  );
}
