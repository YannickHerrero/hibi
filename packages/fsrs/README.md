# @hibi/fsrs

Thin wrapper around [`ts-fsrs`](https://github.com/open-spaced-repetition/ts-fsrs) that maps between the FSRS scheduler internals and the Hibi `card_states` row shape.

## Usage

```ts
import { schedule, initialState } from "@hibi/fsrs";

// New card — initial state for a fresh row
const state = initialState({ now: new Date() });

// Submit a review — Good (rating = 3)
const { nextState, reviewLog } = schedule({
  state,
  rating: 3,
  now: new Date(),
});
```

The wrapper uses the default FSRS-5 parameters. Per-user parameter optimization is a separate concern (added once enough review history accumulates).
