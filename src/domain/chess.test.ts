import { Chess } from 'chess.js';
import { describe, expect, it } from 'vitest';
import {
  createPosition,
  generatePuzzles,
  getLastMove,
  legalDestinations,
  validateMove,
} from './chess';
import { getOpening, getVariation, italianOpening, openings } from './openings';

describe('opening repertoire', () => {
  it('keeps every published lesson line legal', () => {
    const available = openings.filter((opening) => opening.available);
    for (const opening of available) {
      for (const variation of opening.variations) {
        const chess = createPosition(variation.moves, variation.moves.length);
        expect(chess.history()).toEqual(variation.moves.map((move) => move.san));
        expect(chess.turn()).toBe('w');
      }
    }
  });

  it('offers the exact MVP line and a distinct quieter branch', () => {
    expect(getVariation('giuoco-piano')?.moves.map((move) => move.san)).toEqual([
      'e4',
      'e5',
      'Nf3',
      'Nc6',
      'Bc4',
      'Bc5',
      'c3',
      'Nf6',
    ]);
    expect(getVariation('giuoco-pianissimo')?.moves[6].san).toBe('d3');
    expect(openings).toHaveLength(20);
    expect(getOpening('italian-game')).toBe(italianOpening);
    expect(getOpening('missing')).toBeUndefined();
  });
});

describe('chess rule validation', () => {
  const startingFen = new Chess().fen();

  it('validates a legal move and returns the updated position', () => {
    const result = validateMove(startingFen, 'e2', 'e4');
    expect(result.legal).toBe(true);
    expect(result.san).toBe('e4');
    expect(new Chess(result.fen).get('e4')).toEqual({ type: 'p', color: 'w' });
    expect(new Chess(startingFen).get('e2')).toEqual({ type: 'p', color: 'w' });
  });

  it('rejects illegal movement and playing the opponent’s piece', () => {
    expect(validateMove(startingFen, 'e2', 'e5')).toEqual({ legal: false });
    expect(validateMove(startingFen, 'e7', 'e5')).toEqual({ legal: false });
    expect(legalDestinations(startingFen, 'g1').sort()).toEqual(['f3', 'h3']);
    expect(legalDestinations(startingFen, 'g8')).toEqual([]);
  });

  it('does not allow a pinned piece to expose its king', () => {
    const pinFen = '4r1k1/8/8/8/8/8/4R3/4K3 w - - 0 1';
    expect(validateMove(pinFen, 'e2', 'd2')).toEqual({ legal: false });
    expect(legalDestinations(pinFen, 'e2')).not.toContain('d2');
    expect(validateMove(pinFen, 'e2', 'e8').legal).toBe(true);
  });

  it('identifies the last move for board highlights', () => {
    const moves = italianOpening.variations[0].moves;
    expect(getLastMove(moves, 0)).toBeNull();
    expect(getLastMove(moves, 3)).toEqual({ from: 'g1', to: 'f3' });
    expect(() => createPosition(moves, 20)).toThrow(RangeError);
  });
});

describe('position-based practice', () => {
  it('generates the four White decisions from the learned Italian line', () => {
    const variation = italianOpening.variations[0];
    const puzzles = generatePuzzles(variation);
    expect(puzzles.map((puzzle) => puzzle.ply)).toEqual([0, 2, 4, 6]);
    expect(puzzles.map((puzzle) => puzzle.expectedSan)).toEqual(['e4', 'Nf3', 'Bc4', 'c3']);

    for (const puzzle of puzzles) {
      const chess = new Chess(puzzle.fen);
      expect(chess.turn()).toBe('w');
      expect(chess.fen()).toBe(createPosition(variation.moves, puzzle.ply).fen());
      expect(chess.move(puzzle.expectedSan).san).toBe(puzzle.expectedSan);
      expect(puzzle.hint.length).toBeGreaterThan(10);
    }
  });

  it('keeps each branch’s final puzzle distinct', () => {
    const piano = generatePuzzles(italianOpening.variations[0]).at(-1)!;
    const pianissimo = generatePuzzles(italianOpening.variations[1]).at(-1)!;
    expect(piano.fen).toBe(pianissimo.fen);
    expect(piano.expectedSan).toBe('c3');
    expect(pianissimo.expectedSan).toBe('d3');
    expect(piano.id).not.toBe(pianissimo.id);
  });

  it('generates only Black decisions when training a Black repertoire', () => {
    const variation = italianOpening.variations[0];
    const blackPuzzles = generatePuzzles(variation, 'b');
    const whitePuzzleIds = new Set(generatePuzzles(variation).map((puzzle) => puzzle.id));

    expect(blackPuzzles.map((puzzle) => puzzle.ply)).toEqual([1, 3, 5, 7]);
    expect(blackPuzzles.map((puzzle) => puzzle.expectedSan)).toEqual(['e5', 'Nc6', 'Bc5', 'Nf6']);
    for (const puzzle of blackPuzzles) {
      const chess = new Chess(puzzle.fen);
      expect(chess.turn()).toBe('b');
      expect(chess.fen()).toBe(createPosition(variation.moves, puzzle.ply).fen());
      expect(chess.move(puzzle.expectedSan).san).toBe(puzzle.expectedSan);
      expect(puzzle.prompt).toMatch(/^Black to move\./);
      expect(whitePuzzleIds.has(puzzle.id)).toBe(false);
    }
  });

  it('does not generate practice for unreleased lessons', () => {
    expect(
      generatePuzzles({ id: 'unreleased', name: 'Unreleased lesson', description: '', moves: [] }),
    ).toEqual([]);
  });
});
