# hibi-client

Official TypeScript client for the [Hibi](https://github.com/YannickHerrero/hibi) flashcard API.

## Install

```bash
pnpm add hibi-client
```

## Usage

```ts
import { createHibiClient } from "hibi-client";

const client = createHibiClient({
  apiKey: "hibi_...",
  baseUrl: "https://api.hibi.app",
});

// Cards
const card = await client.cards.create({ /* ... */ });
const list = await client.cards.list({ limit: 50 });
await client.cards.update(card.id, { tags: ["anime"] });
await client.cards.remove(card.id);

// Reviews
const due = await client.reviews.due({ limit: 50 });
const result = await client.reviews.submit({ cardId: card.id, rating: 3 });

// Stats
const heatmap = await client.stats.heatmap({ year: 2026 });
const retention = await client.stats.retention();
```

The surface is intentionally narrow: cards, reviews, stats, account. There is **no dictionary surface** — JMdict and morphological analysis live entirely inside each mining client.

## License

MIT
