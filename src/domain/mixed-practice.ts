import { generatePuzzles } from './chess';
import { getVariationProgress } from './progress';
import type { ProgressState } from './progress';
import type { LessonMove, Opening } from './types';

export type MixedPuzzleSource = {
  openingId: string;
  openingName: string;
  variationId: string;
  variationName: string;
  side: 'White' | 'Black';
  ply: number;
  move: LessonMove;
};

export type MixedPuzzle = {
  id: string;
  fen: string;
  sources: MixedPuzzleSource[];
};

export type MixedPracticeQuestion = {
  puzzle: MixedPuzzle;
  focus: MixedPuzzleSource;
};

const MAX_SESSION_SIZE = 10;

/** Clocks do not change an opening decision; turn, castling, and en passant do. */
function positionKey(fen: string): string {
  return fen.trim().split(/\s+/).slice(0, 4).join(' ');
}

function sourceKey(source: MixedPuzzleSource): string {
  return JSON.stringify([source.openingId, source.variationId, source.ply, source.move.san]);
}

/** Only published, learned repertoire answers become valid answers to a position. */
export function buildMixedPuzzlePool(catalog: Opening[], progress: ProgressState): MixedPuzzle[] {
  const positions = new Map<string, MixedPuzzle>();
  const sourceIds = new Map<string, Set<string>>();

  for (const opening of catalog) {
    if (!opening.available) continue;
    for (const variation of opening.variations) {
      if (!getVariationProgress(progress, variation.id).learned) continue;
      const color = opening.side === 'White' ? 'w' : 'b';
      for (const generated of generatePuzzles(variation, color)) {
        if (generated.ply < 2) continue;
        const key = positionKey(generated.fen);
        const source: MixedPuzzleSource = {
          openingId: opening.id,
          openingName: opening.name,
          variationId: variation.id,
          variationName: variation.name,
          side: opening.side,
          ply: generated.ply,
          move: variation.moves[generated.ply],
        };
        if (!positions.has(key)) {
          positions.set(key, { id: `mixed:${key}`, fen: generated.fen, sources: [] });
          sourceIds.set(key, new Set());
        }
        const id = sourceKey(source);
        if (!sourceIds.get(key)!.has(id)) {
          positions.get(key)!.sources.push(source);
          sourceIds.get(key)!.add(id);
        }
      }
    }
  }

  return [...positions.values()];
}

function randomIndex(length: number, random: () => number): number {
  const sampled = random();
  const unit = Number.isFinite(sampled) ? Math.max(0, Math.min(1 - Number.EPSILON, sampled)) : 0;
  return Math.floor(unit * length);
}

/** Fisher–Yates avoids the bias of sorting with a random comparison function. */
function shuffled<T>(values: T[], random: () => number): T[] {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = randomIndex(index + 1, random);
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
}

/** Defensively merge repeated input positions without changing the supplied pool. */
function uniquePositions(pool: MixedPuzzle[]): MixedPuzzle[] {
  const positions = new Map<string, MixedPuzzle>();
  const sourceIds = new Map<string, Set<string>>();
  for (const puzzle of pool) {
    if (!puzzle.sources.length) continue;
    const key = positionKey(puzzle.fen);
    if (!positions.has(key)) {
      positions.set(key, { ...puzzle, sources: [] });
      sourceIds.set(key, new Set());
    }
    for (const source of puzzle.sources) {
      const id = sourceKey(source);
      if (!sourceIds.get(key)!.has(id)) {
        positions.get(key)!.sources.push(source);
        sourceIds.get(key)!.add(id);
      }
    }
  }
  return [...positions.values()];
}

/**
 * Select an opening before a position, so a large repertoire cannot dominate.
 * Prefer a different opening from the preceding question whenever one remains;
 * among those openings, prefer the least represented and randomize ties.
 */
export function createMixedPracticeSession(
  pool: MixedPuzzle[],
  limit = MAX_SESSION_SIZE,
  random = Math.random,
): MixedPracticeQuestion[] {
  const size = Number.isNaN(limit) ? 0 : Math.max(0, Math.min(MAX_SESSION_SIZE, Math.floor(limit)));
  if (!size || !pool.length) return [];

  const remaining = shuffled(uniquePositions(pool), random);
  const questions: MixedPracticeQuestion[] = [];
  const openingCounts = new Map<string, number>();
  let previousOpening: string | undefined;

  while (questions.length < size && remaining.length) {
    const available = [
      ...new Set(remaining.flatMap((puzzle) => puzzle.sources.map((source) => source.openingId))),
    ];
    const alternatives = available.filter((id) => id !== previousOpening);
    const eligible = alternatives.length ? alternatives : available;
    const lowestCount = Math.min(...eligible.map((id) => openingCounts.get(id) ?? 0));
    const balanced = eligible.filter((id) => (openingCounts.get(id) ?? 0) === lowestCount);
    const openingId = balanced[randomIndex(balanced.length, random)];

    const candidates = remaining.filter((puzzle) =>
      puzzle.sources.some((source) => source.openingId === openingId),
    );
    const puzzle = candidates[randomIndex(candidates.length, random)];
    const sources = puzzle.sources.filter((source) => source.openingId === openingId);
    const focus = sources[randomIndex(sources.length, random)];
    questions.push({ puzzle, focus });
    openingCounts.set(openingId, (openingCounts.get(openingId) ?? 0) + 1);
    previousOpening = openingId;
    remaining.splice(remaining.indexOf(puzzle), 1);
  }

  return questions;
}

/** Credit the focused line first, otherwise the first learned matching branch. */
export function resolveMixedPuzzleAnswer(
  question: MixedPracticeQuestion,
  san: string,
): MixedPuzzleSource | undefined {
  if (question.focus.move.san === san) return question.focus;
  return question.puzzle.sources.find((source) => source.move.san === san);
}
