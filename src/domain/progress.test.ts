import { describe, expect, it } from 'vitest';
import {
  completeReview,
  createInitialProgress,
  getReviewQueue,
  getStats,
  getVariationProgress,
  markLearned,
  recordAttempt,
  setDailyGoal,
} from './progress';

const variationId = 'italian-giuoco-piano';
const day = (date: number, hour = 10) => new Date(2026, 9, date, hour);

describe('spaced repetition', () => {
  it('requires spaced successful reviews to reach mastery', () => {
    let state = markLearned(createInitialProgress(), variationId, day(4));
    expect(getReviewQueue(state, day(4))).toHaveLength(1);
    state = completeReview(state, variationId, 1, day(4));
    expect(getVariationProgress(state, variationId)).toMatchObject({
      mastery: 'Familiar',
      successfulReviews: 1,
      dueAt: day(5).toISOString(),
    });
    state = completeReview(state, variationId, 1, day(4, 11));
    expect(getVariationProgress(state, variationId).successfulReviews).toBe(1);
    expect(getReviewQueue(state, day(4, 11))).toEqual([]);
    state = completeReview(state, variationId, 0.9, day(5));
    expect(getVariationProgress(state, variationId)).toMatchObject({
      mastery: 'Good',
      dueAt: day(8).toISOString(),
    });
    state = completeReview(state, variationId, 1, day(8));
    expect(getVariationProgress(state, variationId)).toMatchObject({
      mastery: 'Mastered',
      dueAt: day(15).toISOString(),
    });
    state = completeReview(state, variationId, 1, day(15));
    expect(getVariationProgress(state, variationId).dueAt).toBe(day(29).toISOString());
  });

  it('brings mistakes and hint-assisted moves back sooner without awarding mastery', () => {
    const learned = markLearned(createInitialProgress(), variationId, day(4));
    const familiar = completeReview(learned, variationId, 1, day(4));
    const mistaken = recordAttempt(familiar, variationId, false, false, day(4, 11));
    expect(getVariationProgress(mistaken, variationId)).toMatchObject({
      attempts: 1,
      correct: 0,
      successfulReviews: 1,
      mastery: 'Familiar',
      dueAt: day(4, 11).toISOString(),
    });
    expect(getVariationProgress(familiar, variationId).attempts).toBe(0);
    const assisted = recordAttempt(mistaken, variationId, true, true, day(4, 12));
    expect(getVariationProgress(assisted, variationId)).toMatchObject({
      attempts: 2,
      correct: 1,
      successfulReviews: 1,
      mastery: 'Familiar',
    });
    const reviewed = completeReview(assisted, variationId, 0.5, day(4, 12));
    expect(getVariationProgress(reviewed, variationId)).toMatchObject({
      successfulReviews: 0,
      mastery: 'Learning',
    });
    expect(getReviewQueue(reviewed, day(4, 12))).toHaveLength(1);
    expect(getStats(reviewed, day(4, 12)).accuracy).toBe(50);
  });

  it('ignores invalid review accuracy and cannot review an unlearned variation into mastery', () => {
    const initial = createInitialProgress();
    expect(completeReview(initial, variationId, 1, day(4))).toEqual(initial);
    const learned = markLearned(initial, variationId, day(4));
    for (const accuracy of [Number.NaN, Number.POSITIVE_INFINITY, 100]) {
      expect(
        getVariationProgress(completeReview(learned, variationId, accuracy, day(4)), variationId)
          .successfulReviews,
      ).toBe(0);
    }
  });
});

describe('daily practice', () => {
  it('counts practice by local calendar day, keeps yesterday streak alive, and breaks at gaps', () => {
    let state = markLearned(createInitialProgress(), variationId, day(2));
    state = recordAttempt(state, variationId, true, false, day(2, 23));
    state = recordAttempt(state, variationId, false, false, day(3, 0));
    state = recordAttempt(state, variationId, true, false, day(3, 23));
    expect(getStats(state, day(3))).toMatchObject({
      attempts: 3,
      accuracy: 67,
      todayCount: 2,
      streak: 2,
    });
    expect(getStats(state, day(4))).toMatchObject({ todayCount: 0, streak: 2 });
    expect(getStats(state, day(5)).streak).toBe(0);
    state = recordAttempt(state, variationId, true, false, day(5));
    expect(getStats(state, day(5)).streak).toBe(1);
  });

  it('bounds the daily goal and returns a new state without changing activity', () => {
    const initial = createInitialProgress();
    expect(setDailyGoal(initial, 12).dailyGoal).toBe(12);
    expect(initial.dailyGoal).toBe(8);
    expect(setDailyGoal(initial, 0).dailyGoal).toBe(1);
    expect(setDailyGoal(initial, 999).dailyGoal).toBe(100);
    expect(setDailyGoal(initial, Number.NaN)).toEqual(initial);
  });
});
