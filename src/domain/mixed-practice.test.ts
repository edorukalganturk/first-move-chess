import { Chess } from 'chess.js';
import { describe, expect, it } from 'vitest';
import { createPosition } from './chess';
import {
  buildMixedPuzzlePool,
  createMixedPracticeSession,
  resolveMixedPuzzleAnswer,
} from './mixed-practice';
import type { MixedPracticeQuestion, MixedPuzzle } from './mixed-practice';
import { getOpening, italianOpening } from './openings';
import { createInitialProgress, markLearned } from './progress';
import type { LessonMove, Opening, Variation } from './types';

const piano = italianOpening.variations.find((variation) => variation.id === 'giuoco-piano')!;
const pianissimo = italianOpening.variations.find(
  (variation) => variation.id === 'giuoco-pianissimo',
)!;
const sicilian = getOpening('sicilian-defense')!;
const queensGambit = getOpening('queens-gambit')!;
const ruyLopez = getOpening('ruy-lopez')!;
const learnedAt = new Date('2026-10-05T09:00:00Z');

function progressFor(...ids: string[]) {
  return ids.reduce((state, id) => markLearned(state, id, learnedAt), createInitialProgress());
}

function positionKey(fen: string) {
  return fen.split(' ').slice(0, 4).join(' ');
}

function lesson(san: string): LessonMove {
  return {
    san,
    title: `Play ${san}`,
    explanation: `The fixture continues with ${san}.`,
    why: `This annotated fixture move ${san} is used to test position-based grouping.`,
    hint: `Recall the fixture move ${san}.`,
  };
}

function fixtureOpening(id: string, moves: string[]): Opening {
  const variation: Variation = {
    id: `${id}-line`,
    name: `${id} line`,
    description: 'A legal position fixture.',
    moves: moves.map(lesson),
  };
  return { ...italianOpening, id, name: id, variations: [variation] };
}

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function freezeDeep<T>(value: T): T {
  if (typeof value === 'object' && value !== null) {
    Object.freeze(value);
    for (const child of Object.values(value)) freezeDeep(child);
  }
  return value;
}

function diversePool(): MixedPuzzle[] {
  const catalog = [italianOpening, queensGambit, sicilian];
  const ids = catalog.flatMap((opening) => opening.variations.map((variation) => variation.id));
  return buildMixedPuzzlePool(catalog, progressFor(...ids));
}

describe('learned mixed puzzle pool', () => {
  it('has no questions without both a published variation and learned progress', () => {
    expect(buildMixedPuzzlePool([], progressFor(piano.id))).toEqual([]);
    expect(buildMixedPuzzlePool([italianOpening], createInitialProgress())).toEqual([]);
    expect(
      buildMixedPuzzlePool([{ ...italianOpening, available: false }], progressFor(piano.id)),
    ).toEqual([]);
    expect(buildMixedPuzzlePool([italianOpening], progressFor('removed-opening-line'))).toEqual([]);
  });

  it('excludes unavailable, unlearned, and orphaned variations from a populated pool', () => {
    const unavailable = { ...sicilian, available: false };
    const progress = progressFor(piano.id, unavailable.variations[0].id, 'removed-opening-line');
    const pool = buildMixedPuzzlePool([italianOpening, unavailable], progress);

    expect(pool).toHaveLength(3);
    expect(
      new Set(pool.flatMap((puzzle) => puzzle.sources.map((source) => source.variationId))),
    ).toEqual(new Set([piano.id]));
    expect(
      pool.every((puzzle) =>
        puzzle.sources.every((source) => source.openingId === italianOpening.id),
      ),
    ).toBe(true);
  });

  it('skips the starting choices and uses legal positions for the actual learner side', () => {
    const catalog = [italianOpening, sicilian];
    const pool = buildMixedPuzzlePool(catalog, progressFor(piano.id, sicilian.variations[0].id));
    expect(new Set(pool.flatMap((puzzle) => puzzle.sources.map((source) => source.side)))).toEqual(
      new Set(['White', 'Black']),
    );

    for (const puzzle of pool) {
      for (const source of puzzle.sources) {
        const original = catalog
          .find((opening) => opening.id === source.openingId)!
          .variations.find((variation) => variation.id === source.variationId)!;
        const chess = new Chess(puzzle.fen);
        expect(source.ply).toBeGreaterThanOrEqual(2);
        expect(source.ply % 2).toBe(source.side === 'White' ? 0 : 1);
        expect(chess.turn()).toBe(source.side === 'White' ? 'w' : 'b');
        expect(positionKey(puzzle.fen)).toBe(
          positionKey(createPosition(original.moves, source.ply).fen()),
        );
        expect(source.move).toBe(original.moves[source.ply]);
        expect(chess.move(source.move.san, { strict: true }).san).toBe(source.move.san);
      }
    }
    expect(
      pool.some((puzzle) =>
        puzzle.sources.some((source) => source.side === 'Black' && source.ply === 3),
      ),
    ).toBe(true);
    expect(pool.some((puzzle) => puzzle.sources.some((source) => source.ply < 2))).toBe(false);
  });

  it('merges the Italian branch position and retains every learned answer', () => {
    const pool = buildMixedPuzzlePool([italianOpening], progressFor(piano.id, pianissimo.id));
    const branchFen = createPosition(piano.moves, 6).fen();
    const branch = pool.find((puzzle) => positionKey(puzzle.fen) === positionKey(branchFen))!;

    expect(pool).toHaveLength(3);
    expect(branch.sources.map((source) => source.move.san)).toEqual(['c3', 'd3']);
    expect(branch.sources.map((source) => source.variationId)).toEqual([piano.id, pianissimo.id]);
    expect(branch.sources[0].move.why).toBe(piano.moves[6].why);
    expect(branch.sources[1].move.why).toBe(pianissimo.moves[6].why);
  });

  it('does not admit an alternative answer from an unlearned branch', () => {
    const pool = buildMixedPuzzlePool([italianOpening], progressFor(piano.id));
    const branch = pool.find((puzzle) => puzzle.sources.some((source) => source.ply === 6))!;
    expect(branch.sources.map((source) => source.move.san)).toEqual(['c3']);
    expect(
      resolveMixedPuzzleAnswer({ puzzle: branch, focus: branch.sources[0] }, 'd3'),
    ).toBeUndefined();
  });

  it('deduplicates the same position even when halfmove and fullmove clocks differ', () => {
    const opening = fixtureOpening('clock-loop', [
      'e4',
      'e5',
      'Nf3',
      'Nf6',
      'Ng1',
      'Ng8',
      'Nc3',
      'Nc6',
    ]);
    const variation = opening.variations[0];
    const earlyFen = createPosition(variation.moves, 2).fen();
    const returnedFen = createPosition(variation.moves, 6).fen();
    expect(earlyFen).not.toBe(returnedFen);
    expect(positionKey(earlyFen)).toBe(positionKey(returnedFen));

    const pool = buildMixedPuzzlePool([opening], progressFor(variation.id));
    const returnedPosition = pool.find(
      (puzzle) => positionKey(puzzle.fen) === positionKey(earlyFen),
    )!;
    expect(pool).toHaveLength(2);
    expect(returnedPosition.sources.map((source) => source.ply)).toEqual([2, 6]);
    expect(returnedPosition.sources.map((source) => source.move.san)).toEqual(['Nf3', 'Nc3']);
    expect(new Set(pool.map((puzzle) => puzzle.id)).size).toBe(pool.length);
  });

  it('does not merge identical placement and turn with different castling rights', () => {
    const opening = fixtureOpening('king-loop', [
      'e4',
      'e5',
      'Ke2',
      'Nf6',
      'Ke1',
      'Ng8',
      'Nf3',
      'Nc6',
    ]);
    const variation = opening.variations[0];
    const beforeKingMove = createPosition(variation.moves, 2).fen();
    const afterKingReturn = createPosition(variation.moves, 6).fen();
    expect(beforeKingMove.split(' ').slice(0, 2)).toEqual(afterKingReturn.split(' ').slice(0, 2));
    expect(beforeKingMove.split(' ')[2]).not.toBe(afterKingReturn.split(' ')[2]);

    const pool = buildMixedPuzzlePool([opening], progressFor(variation.id));
    expect(pool).toHaveLength(3);
    expect(new Set(pool.map((puzzle) => puzzle.id)).size).toBe(3);
  });

  it('keeps input catalog and progress unchanged', () => {
    const catalog = freezeDeep(structuredClone([italianOpening]));
    const progress = freezeDeep(progressFor(piano.id, pianissimo.id));
    const before = JSON.stringify({ catalog, progress });
    expect(buildMixedPuzzlePool(catalog, progress)).toHaveLength(3);
    expect(JSON.stringify({ catalog, progress })).toBe(before);
  });

  it('keeps a legal en passant opportunity distinct after the same board returns', () => {
    const opening = fixtureOpening('en-passant-loop', [
      'e4',
      'a5',
      'e5',
      'd5',
      'Nf3',
      'Nf6',
      'Ng1',
      'Ng8',
      'Nc3',
      'Nc6',
    ]);
    const variation = opening.variations[0];
    const beforeExpiry = createPosition(variation.moves, 4).fen();
    const afterExpiry = createPosition(variation.moves, 8).fen();
    expect(beforeExpiry.split(' ').slice(0, 3)).toEqual(afterExpiry.split(' ').slice(0, 3));
    expect(beforeExpiry.split(' ')[3]).toBe('d6');
    expect(afterExpiry.split(' ')[3]).toBe('-');
    expect(new Chess(beforeExpiry).moves()).toContain('exd6');
    expect(new Chess(afterExpiry).moves()).not.toContain('exd6');

    const pool = buildMixedPuzzlePool([opening], progressFor(variation.id));
    expect(pool).toHaveLength(4);
    expect(
      pool
        .find((puzzle) => positionKey(puzzle.fen) === positionKey(beforeExpiry))!
        .sources.map((source) => source.ply),
    ).toEqual([4]);
    expect(
      pool
        .find((puzzle) => positionKey(puzzle.fen) === positionKey(afterExpiry))!
        .sources.map((source) => source.ply),
    ).toEqual([8]);
  });
});

describe('balanced randomized mixed sessions', () => {
  it('returns at most ten unique positions and a valid source for each question', () => {
    const pool = diversePool();
    const session = createMixedPracticeSession(pool, 100, seededRandom(42));
    expect(session).toHaveLength(10);
    expect(new Set(session.map((question) => positionKey(question.puzzle.fen))).size).toBe(10);
    for (const question of session) {
      expect(question.puzzle.sources).toContain(question.focus);
      expect(pool.some((puzzle) => puzzle.sources.includes(question.focus))).toBe(true);
    }
  });

  it('balances openings and avoids adjacent repetition when alternatives remain', () => {
    const session = createMixedPracticeSession(diversePool(), 10, seededRandom(7));
    const counts = new Map<string, number>();
    for (const [index, question] of session.entries()) {
      const openingId = question.focus.openingId;
      counts.set(openingId, (counts.get(openingId) ?? 0) + 1);
      if (index) expect(openingId).not.toBe(session[index - 1].focus.openingId);
    }
    expect(counts.size).toBe(3);
    expect([...counts.values()].sort()).toEqual([3, 3, 4]);
  });

  it('can choose a later pooled source to alternate openings at shared positions', () => {
    const pool = buildMixedPuzzlePool(
      [italianOpening, ruyLopez],
      progressFor(piano.id, ruyLopez.variations[0].id),
    );
    const shared = pool.filter(
      (puzzle) => new Set(puzzle.sources.map((source) => source.openingId)).size > 1,
    );
    expect(shared.length).toBeGreaterThanOrEqual(2);
    const session = createMixedPracticeSession(shared.slice(0, 2), 10, () => 0);
    expect(session).toHaveLength(2);
    expect(session[0].focus.openingId).not.toBe(session[1].focus.openingId);
    expect(session.some((question) => question.focus !== question.puzzle.sources[0])).toBe(true);
  });

  it('still fills a session when only one opening is learned', () => {
    const pool = buildMixedPuzzlePool(
      [italianOpening],
      progressFor(...italianOpening.variations.map((variation) => variation.id)),
    );
    const session = createMixedPracticeSession(pool, 10, seededRandom(4));
    expect(session).toHaveLength(Math.min(10, pool.length));
    expect(new Set(session.map((question) => question.focus.openingId))).toEqual(
      new Set([italianOpening.id]),
    );
  });

  it('limits small pools to their unique position count and merges repeated input positions', () => {
    const pool = buildMixedPuzzlePool([italianOpening], progressFor(piano.id, pianissimo.id));
    const duplicate: MixedPuzzle = {
      ...pool[0],
      id: 'same-position-other-clock',
      fen: `${positionKey(pool[0].fen)} 57 90`,
      sources: [pool[0].sources[1]],
    };
    const session = createMixedPracticeSession([...pool, duplicate], 10, seededRandom(15));
    expect(session).toHaveLength(3);
    expect(new Set(session.map((question) => positionKey(question.puzzle.fen))).size).toBe(3);
    expect(
      session.find((question) => positionKey(question.puzzle.fen) === positionKey(duplicate.fen))!
        .puzzle.sources,
    ).toHaveLength(2);
  });

  it.each([0, -4, Number.NaN, Number.NEGATIVE_INFINITY])(
    'clamps limit %s to an empty session',
    (limit) => {
      expect(createMixedPracticeSession(diversePool(), limit, seededRandom(1))).toEqual([]);
    },
  );

  it('floors fractional limits and caps an infinite limit at ten', () => {
    const pool = diversePool();
    expect(createMixedPracticeSession(pool, 2.9, seededRandom(5))).toHaveLength(2);
    expect(
      createMixedPracticeSession(pool, Number.POSITIVE_INFINITY, seededRandom(5)),
    ).toHaveLength(10);
    expect(createMixedPracticeSession(pool, undefined, seededRandom(5))).toHaveLength(10);
    expect(createMixedPracticeSession([], 10)).toEqual([]);
    expect(createMixedPracticeSession([{ ...pool[0], sources: [] }], 10)).toEqual([]);
  });

  it('reproduces seeded sessions and changes position order with a different seed', () => {
    const pool = diversePool();
    const first = createMixedPracticeSession(pool, 10, seededRandom(12));
    expect(createMixedPracticeSession(pool, 10, seededRandom(12))).toEqual(first);
    const second = createMixedPracticeSession(pool, 10, seededRandom(123));
    expect(second.map((question) => question.puzzle.id)).not.toEqual(
      first.map((question) => question.puzzle.id),
    );
  });

  it('does not sort, splice, or rewrite any supplied puzzle, source, or move', () => {
    const pool = freezeDeep(structuredClone(diversePool()));
    const before = JSON.stringify(pool);
    expect(createMixedPracticeSession(pool, 10, seededRandom(83))).toHaveLength(10);
    expect(JSON.stringify(pool)).toBe(before);
  });
});

describe('mixed answer source resolution', () => {
  function branchQuestion(): MixedPracticeQuestion {
    const pool = buildMixedPuzzlePool([italianOpening], progressFor(piano.id, pianissimo.id));
    const puzzle = pool.find((candidate) => candidate.sources.some((source) => source.ply === 6))!;
    return {
      puzzle,
      focus: puzzle.sources.find((source) => source.variationId === pianissimo.id)!,
    };
  }

  it('credits the focused branch when its move matches', () => {
    const question = branchQuestion();
    expect(resolveMixedPuzzleAnswer(question, 'd3')).toBe(question.focus);
    expect(resolveMixedPuzzleAnswer(question, 'd3')!.move.why).toBe(pianissimo.moves[6].why);
  });

  it('accepts an alternative learned branch with its own progress ID and explanation', () => {
    const question = branchQuestion();
    const answer = resolveMixedPuzzleAnswer(question, 'c3')!;
    expect(answer).toBe(question.puzzle.sources.find((source) => source.variationId === piano.id));
    expect(answer.variationId).toBe(piano.id);
    expect(answer.move).toBe(piano.moves[6]);
    expect(answer.move.explanation).not.toBe(question.focus.move.explanation);
    expect(answer.move.hint).toBe(piano.moves[6].hint);
  });

  it('prefers focus over the first source when multiple learned lines expect the same SAN', () => {
    const pool = buildMixedPuzzlePool([italianOpening], progressFor(piano.id, pianissimo.id));
    const puzzle = pool.find((candidate) => candidate.sources.some((source) => source.ply === 2))!;
    const question = { puzzle, focus: puzzle.sources[1] };
    expect(question.focus).not.toBe(puzzle.sources[0]);
    expect(resolveMixedPuzzleAnswer(question, 'Nf3')).toBe(question.focus);
  });

  it('chooses the first matching alternative deterministically and rejects unlearned moves', () => {
    const question = branchQuestion();
    const first = question.puzzle.sources[0];
    const second = { ...first, variationId: 'another-learned-c3-line' };
    const puzzle = { ...question.puzzle, sources: [first, second, question.focus] };
    const modified = { puzzle, focus: question.focus };
    expect(resolveMixedPuzzleAnswer(modified, 'c3')).toBe(first);
    expect(resolveMixedPuzzleAnswer(modified, 'a3')).toBeUndefined();
  });
});
