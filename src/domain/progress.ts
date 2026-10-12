export type Mastery = 'New' | 'Learning' | 'Familiar' | 'Good' | 'Mastered';

export type VariationProgress = {
  variationId: string;
  learned: boolean;
  attempts: number;
  correct: number;
  successfulReviews: number;
  mastery: Mastery;
  dueAt: string | null;
  lastPracticedAt: string | null;
};

export type ProgressState = {
  version: 1;
  variations: Record<string, VariationProgress>;
  dailyGoal: number;
  activity: Record<string, number>;
};

const MASTERY_SCORES: Record<Mastery, number> = {
  New: 0,
  Learning: 20,
  Familiar: 45,
  Good: 70,
  Mastered: 100,
};

export function createInitialProgress(): ProgressState {
  return { version: 1, variations: {}, dailyGoal: 8, activity: {} };
}

function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function afterDays(now: Date, days: number): string {
  const date = new Date(now);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

export function getVariationProgress(state: ProgressState, id: string): VariationProgress {
  if (Object.hasOwn(state.variations, id)) return state.variations[id];
  return {
    variationId: id,
    learned: false,
    attempts: 0,
    correct: 0,
    successfulReviews: 0,
    mastery: 'New',
    dueAt: null,
    lastPracticedAt: null,
  };
}

function updateVariation(state: ProgressState, variation: VariationProgress): ProgressState {
  return {
    ...state,
    variations: { ...state.variations, [variation.variationId]: variation },
  };
}

export function markLearned(
  state: ProgressState,
  variationId: string,
  now = new Date(),
): ProgressState {
  const previous = getVariationProgress(state, variationId);
  if (previous.learned) return { ...state };
  return updateVariation(state, {
    ...previous,
    learned: true,
    mastery: 'Learning',
    dueAt: now.toISOString(),
  });
}

/** A submitted move counts toward activity. Hints help learning, but do not award mastery. */
export function recordAttempt(
  state: ProgressState,
  variationId: string,
  correct: boolean,
  assisted = false,
  now = new Date(),
): ProgressState {
  const previous = getVariationProgress(state, variationId);
  const today = localDateKey(now);
  const updated = updateVariation(state, {
    ...previous,
    attempts: previous.attempts + 1,
    correct: previous.correct + (correct ? 1 : 0),
    // Review results, not isolated correct moves, establish reliable recall.
    mastery: previous.mastery,
    successfulReviews: previous.successfulReviews,
    dueAt: !correct || assisted ? earlierDate(previous.dueAt, now.toISOString()) : previous.dueAt,
    lastPracticedAt: now.toISOString(),
  });
  return {
    ...updated,
    activity: { ...state.activity, [today]: (state.activity[today] ?? 0) + 1 },
  };
}

function earlierDate(existing: string | null, candidate: string): string {
  return existing !== null && Date.parse(existing) < Date.parse(candidate) ? existing : candidate;
}

function masteryForReviews(reviews: number): Mastery {
  if (reviews === 0) return 'Learning';
  if (reviews === 1) return 'Familiar';
  if (reviews === 2) return 'Good';
  return 'Mastered';
}

/**
 * Accuracy is a 0–1 fraction of prompts answered correctly without a hint.
 * Future reviews may be practiced early, but only due reviews advance mastery.
 */
export function completeReview(
  state: ProgressState,
  variationId: string,
  accuracy: number,
  now = new Date(),
): ProgressState {
  const previous = getVariationProgress(state, variationId);
  if (!previous.learned) return { ...state };
  const successful = Number.isFinite(accuracy) && accuracy >= 0.8 && accuracy <= 1;
  const isDue = previous.dueAt === null || Date.parse(previous.dueAt) <= now.getTime();
  if (successful && !isDue) {
    return updateVariation(state, { ...previous, lastPracticedAt: now.toISOString() });
  }
  const successfulReviews = successful
    ? previous.successfulReviews + 1
    : Math.max(0, previous.successfulReviews - 1);
  // First successful review: tomorrow; then three, seven, and fourteen days.
  const interval = successful ? [0, 1, 3, 7, 14][Math.min(successfulReviews, 4)] : 0;
  return updateVariation(state, {
    ...previous,
    successfulReviews,
    mastery: masteryForReviews(successfulReviews),
    dueAt: afterDays(now, interval),
    lastPracticedAt: now.toISOString(),
  });
}

export function setDailyGoal(state: ProgressState, goal: number): ProgressState {
  if (!Number.isFinite(goal)) return { ...state };
  return { ...state, dailyGoal: Math.max(1, Math.min(100, Math.round(goal))) };
}

export function getReviewQueue(state: ProgressState, now = new Date()): VariationProgress[] {
  return Object.values(state.variations)
    .filter(
      (variation) =>
        variation.learned &&
        (variation.dueAt === null || Date.parse(variation.dueAt) <= now.getTime()),
    )
    .sort((a, b) => {
      const dueDifference =
        (a.dueAt ? Date.parse(a.dueAt) : 0) - (b.dueAt ? Date.parse(b.dueAt) : 0);
      if (dueDifference !== 0) return dueDifference;
      const aAccuracy = a.attempts ? a.correct / a.attempts : 0;
      const bAccuracy = b.attempts ? b.correct / b.attempts : 0;
      return aAccuracy - bAccuracy || MASTERY_SCORES[a.mastery] - MASTERY_SCORES[b.mastery];
    });
}

export function getStats(
  state: ProgressState,
  now = new Date(),
): {
  accuracy: number;
  attempts: number;
  streak: number;
  todayCount: number;
  overallMastery: number;
  learnedCount: number;
  dueCount: number;
} {
  const variations = Object.values(state.variations);
  const attempts = variations.reduce((sum, variation) => sum + variation.attempts, 0);
  const correct = variations.reduce((sum, variation) => sum + variation.correct, 0);
  const todayCount = state.activity[localDateKey(now)] ?? 0;
  const cursor = new Date(now);
  cursor.setHours(12, 0, 0, 0);
  // An existing streak remains alive until today's opportunity to practice ends.
  if (todayCount === 0) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while ((state.activity[localDateKey(cursor)] ?? 0) > 0) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return {
    accuracy: attempts ? Math.round((correct / attempts) * 100) : 0,
    attempts,
    streak,
    todayCount,
    overallMastery: variations.length
      ? Math.round(
          variations.reduce((sum, variation) => sum + MASTERY_SCORES[variation.mastery], 0) /
            variations.length,
        )
      : 0,
    learnedCount: variations.filter((variation) => variation.learned).length,
    dueCount: getReviewQueue(state, now).length,
  };
}
