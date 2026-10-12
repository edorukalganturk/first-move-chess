import { createInitialProgress } from './progress';
import type { Mastery, ProgressState } from './progress';

export const PROGRESS_STORAGE_KEY = 'first-move.progress.v1';
const MASTERY_LEVELS: Mastery[] = ['New', 'Learning', 'Familiar', 'Good', 'Mastered'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

function isDateOrNull(value: unknown): value is string | null {
  return value === null || (typeof value === 'string' && Number.isFinite(Date.parse(value)));
}

function isProgressState(value: unknown): value is ProgressState {
  if (
    !isRecord(value) ||
    value.version !== 1 ||
    !isRecord(value.variations) ||
    !isRecord(value.activity)
  ) {
    return false;
  }
  if (!isCount(value.dailyGoal) || value.dailyGoal < 1 || value.dailyGoal > 100) return false;
  for (const [id, entry] of Object.entries(value.variations)) {
    if (!isRecord(entry) || entry.variationId !== id || typeof entry.learned !== 'boolean')
      return false;
    if (!isCount(entry.attempts) || !isCount(entry.correct) || entry.correct > entry.attempts)
      return false;
    if (!isCount(entry.successfulReviews) || !MASTERY_LEVELS.includes(entry.mastery as Mastery))
      return false;
    if (!isDateOrNull(entry.dueAt) || !isDateOrNull(entry.lastPracticedAt)) return false;
  }
  return Object.entries(value.activity).every(
    ([day, count]) => /^\d{4}-\d{2}-\d{2}$/.test(day) && isCount(count),
  );
}

/** Loading and saving remain usable when storage is unavailable, full, or damaged. */
export function loadProgress(): ProgressState {
  try {
    const saved = globalThis.localStorage?.getItem(PROGRESS_STORAGE_KEY);
    if (!saved) return createInitialProgress();
    const parsed: unknown = JSON.parse(saved);
    return isProgressState(parsed) ? parsed : createInitialProgress();
  } catch {
    return createInitialProgress();
  }
}

export function saveProgress(state: ProgressState): boolean {
  try {
    if (!globalThis.localStorage) return false;
    globalThis.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
