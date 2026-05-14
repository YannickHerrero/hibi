# hibi-client

Official TypeScript client for the [Hibi](https://github.com/YannickHerrero/hibi) flashcard API.

## Install

```bash
pnpm add hibi-client
```

## Getting an API key

Hibi uses per-user API keys. Keys are issued from the user's portal at [app.hibi.app](https://app.hibi.app) under **API keys**:

1. Sign in to the portal (email OTP).
2. Create a key with a recognizable name (e.g. "My third-party app").
3. Copy the raw key — it is shown **once** at creation and stored hashed afterward.
4. Paste the key into your app or have your end users paste theirs.

Each user authenticates with their own key. Third-party apps should prompt the user for their key rather than embedding one. Keys can be revoked at any time from the portal.

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
