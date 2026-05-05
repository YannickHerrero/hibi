import { describe, expect, it } from "vitest";
import { initialState, schedule } from "./schedule.ts";

describe("initialState", () => {
  it("returns a New card with no prior review", () => {
    const now = new Date("2026-05-05T10:00:00Z");
    const state = initialState({ now });

    expect(state.state).toBe("new");
    expect(state.reps).toBe(0);
    expect(state.lapses).toBe(0);
    expect(state.lastReview).toBeNull();
  });
});

describe("schedule", () => {
  it("schedules a Good rating on a new card", () => {
    const now = new Date("2026-05-05T10:00:00Z");
    const state = initialState({ now });
    const result = schedule({ state, rating: 3, now });

    expect(result.nextState.reps).toBe(1);
    expect(result.nextState.lastReview).toEqual(now);
    expect(result.reviewLog.rating).toBe(3);
    expect(result.reviewLog.reviewedAt).toEqual(now);
  });

  it("Again resets due to a near-term review", () => {
    const now = new Date("2026-05-05T10:00:00Z");
    const state = initialState({ now });
    const result = schedule({ state, rating: 1, now });

    const minutesUntilDue = (result.nextState.due.getTime() - now.getTime()) / 60_000;
    expect(minutesUntilDue).toBeGreaterThan(0);
    expect(minutesUntilDue).toBeLessThan(60);
  });

  it("Easy schedules further out than Good for the same input", () => {
    const now = new Date("2026-05-05T10:00:00Z");
    const seed = initialState({ now });
    const good = schedule({ state: seed, rating: 3, now });
    const easy = schedule({ state: seed, rating: 4, now });

    expect(easy.nextState.due.getTime()).toBeGreaterThan(good.nextState.due.getTime());
  });
});
