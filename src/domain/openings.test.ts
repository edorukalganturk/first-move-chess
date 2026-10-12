import { Chess } from 'chess.js';
import { describe, expect, it } from 'vitest';
import { openings, getVariation } from './openings';
import { createPosition, generatePuzzles, validateMove } from './chess';

describe('complete playable catalog', () => {
  it('publishes exactly ten distinct lesson lines for every opening', () => {
    expect(openings).toHaveLength(20);
    expect(new Set(openings.map((opening) => opening.id)).size).toBe(20);
    const ids = openings.flatMap((opening) => opening.variations.map((v) => v.id));
    expect(ids).toHaveLength(200);
    expect(new Set(ids).size).toBe(200);
    for (const opening of openings) {
      expect(opening.available, opening.name).toBe(true);
      expect(opening.variations, opening.name).toHaveLength(10);
      const signatures = opening.variations.map((v) => v.moves.map((m) => m.san).join(' '));
      expect(new Set(signatures).size, opening.name).toBe(10);
    }
  });

  it('preserves the IDs used by previous lesson progress', () => {
    for (const id of [
      'giuoco-piano',
      'giuoco-pianissimo',
      'ruy-lopez-morphy',
      'ruy-lopez-berlin',
      'ruy-lopez-exchange',
      'scotch-classical',
      'scotch-four-knights',
      'queens-gambit-declined',
      'queens-gambit-accepted',
      'queens-gambit-slav',
      'sicilian-najdorf',
      'sicilian-dragon',
      'sicilian-classical',
      'french-advance',
      'french-winawer',
      'french-classical',
      'caro-kann-classical',
      'caro-kann-advance',
      'caro-kann-exchange',
      'kings-indian-classical',
      'kings-indian-saemisch',
      'kings-indian-fianchetto',
    ])
      expect(getVariation(id), id).toBeDefined();
  });

  for (const opening of openings) {
    describe(opening.name, () => {
      for (const variation of opening.variations) {
        it(`${variation.name}: replays legally and can be recalled on the board`, () => {
          expect(variation.moves.length).toBeGreaterThanOrEqual(8);
          expect(variation.moves.length % 2).toBe(0);
          const chess = new Chess();
          for (const lesson of variation.moves) {
            const played = chess.move(lesson.san, { strict: true });
            expect(played.san).toBe(lesson.san);
            expect(lesson.title.trim().length).toBeGreaterThan(5);
            expect(lesson.explanation.trim().length).toBeGreaterThan(20);
            expect(lesson.why.trim().length).toBeGreaterThan(45);
            expect(lesson.hint.trim().length).toBeGreaterThan(15);
          }
          expect(chess.isGameOver()).toBe(false);
          const learner = opening.side === 'White' ? 'w' : 'b';
          const puzzles = generatePuzzles(variation, learner);
          expect(puzzles.length).toBeGreaterThanOrEqual(4);
          for (const puzzle of puzzles) {
            const before = new Chess(puzzle.fen);
            expect(before.turn()).toBe(learner);
            expect(puzzle.fen).toBe(createPosition(variation.moves, puzzle.ply).fen());
            const move = before.move(puzzle.expectedSan, { strict: true });
            const attempt = validateMove(puzzle.fen, move.from, move.to);
            expect(attempt.legal).toBe(true);
            expect(attempt.san).toBe(puzzle.expectedSan);
            expect(attempt.fen).toBe(before.fen());
          }
        });
      }
    });
  }
});
