import { createEmptyCard, type Card as FsrsCard, fsrs, type Grade, Rating, State } from "ts-fsrs";

export type CardStateName = "new" | "learning" | "review" | "relearning";

export interface CardStateData {
  due: Date;
  stability: number;
  difficulty: number;
  scheduledDays: number;
  learningSteps: number;
  reps: number;
  lapses: number;
  state: CardStateName;
  lastReview: Date | null;
}

export interface ReviewLogData {
  rating: 1 | 2 | 3 | 4;
  state: CardStateName;
  due: Date;
  stability: number;
  difficulty: number;
  scheduledDays: number;
  learningSteps: number;
  reviewedAt: Date;
}

export interface InitialStateInput {
  now?: Date;
}

export interface ScheduleInput {
  state: CardStateData;
  rating: 1 | 2 | 3 | 4;
  now?: Date;
}

export interface ScheduleResult {
  nextState: CardStateData;
  reviewLog: ReviewLogData;
}

const STATE_TO_NAME: Record<State, CardStateName> = {
  [State.New]: "new",
  [State.Learning]: "learning",
  [State.Review]: "review",
  [State.Relearning]: "relearning",
};

const NAME_TO_STATE: Record<CardStateName, State> = {
  new: State.New,
  learning: State.Learning,
  review: State.Review,
  relearning: State.Relearning,
};

function toFsrsCard(s: CardStateData): FsrsCard {
  const base = {
    due: s.due,
    stability: s.stability,
    difficulty: s.difficulty,
    elapsed_days: 0,
    scheduled_days: s.scheduledDays,
    learning_steps: s.learningSteps,
    reps: s.reps,
    lapses: s.lapses,
    state: NAME_TO_STATE[s.state],
  };
  return s.lastReview ? { ...base, last_review: s.lastReview } : base;
}

function fromFsrsCard(c: FsrsCard): CardStateData {
  return {
    due: c.due,
    stability: c.stability,
    difficulty: c.difficulty,
    scheduledDays: c.scheduled_days,
    learningSteps: c.learning_steps,
    reps: c.reps,
    lapses: c.lapses,
    state: STATE_TO_NAME[c.state],
    lastReview: c.last_review ?? null,
  };
}

export function initialState(input: InitialStateInput = {}): CardStateData {
  const now = input.now ?? new Date();
  const card = createEmptyCard(now);
  return fromFsrsCard(card);
}

export function schedule(input: ScheduleInput): ScheduleResult {
  const now = input.now ?? new Date();
  const scheduler = fsrs();
  const card = toFsrsCard(input.state);
  const result = scheduler.next(card, now, input.rating as Grade);

  return {
    nextState: fromFsrsCard(result.card),
    reviewLog: {
      rating: input.rating,
      state: STATE_TO_NAME[result.log.state],
      due: result.log.due,
      stability: result.log.stability,
      difficulty: result.log.difficulty,
      scheduledDays: result.log.scheduled_days,
      learningSteps: result.log.learning_steps,
      reviewedAt: result.log.review,
    },
  };
}

export { Rating };
