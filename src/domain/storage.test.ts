import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createInitialProgress, getStats, getVariationProgress, markLearned } from './progress';
import { loadProgress, PROGRESS_STORAGE_KEY, saveProgress } from './storage';

class MemoryStorage {
  private values = new Map<string, string>();
  getItem(key: string) {
    return this.values.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

const variationId = 'italian-giuoco-piano';
const now = new Date(2026, 9, 4, 10);

beforeEach(() => vi.stubGlobal('localStorage', new MemoryStorage()));
afterEach(() => vi.unstubAllGlobals());

describe('offline storage', () => {
  it('starts with honest zero progress and round trips a learned variation', () => {
    const initial = loadProgress();
    expect(getStats(initial, now)).toMatchObject({
      accuracy: 0,
      attempts: 0,
      streak: 0,
      overallMastery: 0,
    });
    const learned = markLearned(initial, variationId, now);
    expect(initial.variations).toEqual({});
    expect(getVariationProgress(learned, variationId).mastery).toBe('Learning');
    expect(saveProgress(learned)).toBe(true);
    expect(loadProgress()).toEqual(learned);
  });

  it.each([
    'not json',
    JSON.stringify({ version: 2, variations: {}, dailyGoal: 8, activity: {} }),
    JSON.stringify({ version: 1, variations: [], dailyGoal: 8, activity: {} }),
    JSON.stringify({ version: 1, variations: {}, dailyGoal: -1, activity: {} }),
    JSON.stringify({
      version: 1,
      variations: { bad: { variationId: 'bad', attempts: 0, correct: 4 } },
      dailyGoal: 8,
      activity: {},
    }),
  ])('recovers safely from malformed or unsupported storage: %s', (saved) => {
    globalThis.localStorage.setItem(PROGRESS_STORAGE_KEY, saved);
    expect(loadProgress()).toEqual(createInitialProgress());
  });

  it('keeps the learning loop available when browser storage fails', () => {
    vi.stubGlobal('localStorage', {
      getItem() {
        throw new Error('storage denied');
      },
      setItem() {
        throw new Error('quota exceeded');
      },
    });
    expect(loadProgress().variations).toEqual({});
    expect(saveProgress(loadProgress())).toBe(false);
  });

  it('handles unavailable storage without losing the ability to practice', () => {
    vi.stubGlobal('localStorage', undefined);
    expect(loadProgress()).toEqual(createInitialProgress());
    expect(saveProgress(createInitialProgress())).toBe(false);
  });
});
