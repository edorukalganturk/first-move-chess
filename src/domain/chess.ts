import { Chess, type Color, type Square } from 'chess.js';
import type { LessonMove, Puzzle, Variation } from './types';

/** Build a fresh legal position after the requested number of half-moves. */
export function createPosition(moves: LessonMove[], ply: number): Chess {
  if (!Number.isInteger(ply) || ply < 0 || ply > moves.length) {
    throw new RangeError(`Ply must be an integer between 0 and ${moves.length}.`);
  }

  const chess = new Chess();
  for (let index = 0; index < ply; index += 1) {
    try {
      chess.move(moves[index].san, { strict: true });
    } catch {
      throw new Error(`Illegal opening move at ply ${index + 1}: ${moves[index].san}`);
    }
  }
  return chess;
}

/** Destinations respect turns, pins, check, castling, and all other chess rules. */
export function legalDestinations(fen: string, square: Square): Square[] {
  const chess = new Chess(fen);
  return [...new Set(chess.moves({ square, verbose: true }).map((move) => move.to))];
}

export interface MoveValidation {
  legal: boolean;
  san?: string;
  fen?: string;
}

/** Validation does not mutate the caller's position; queen is the default promotion. */
export function validateMove(fen: string, from: Square, to: Square): MoveValidation {
  try {
    const chess = new Chess(fen);
    const move = chess.move({ from, to, promotion: 'q' });
    return { legal: true, san: move.san, fen: chess.fen() };
  } catch {
    return { legal: false };
  }
}

export function getLastMove(moves: LessonMove[], ply: number): { from: Square; to: Square } | null {
  const chess = createPosition(moves, ply);
  const lastMove = chess.history({ verbose: true }).at(-1);
  return lastMove ? { from: lastMove.from, to: lastMove.to } : null;
}

/** These puzzles rehearse the learned repertoire; they do not claim an engine-best move. */
export function generatePuzzles(variation: Variation, learnerColor: Color = 'w'): Puzzle[] {
  const chess = new Chess();
  const puzzles: Puzzle[] = [];
  const learnerSide = learnerColor === 'w' ? 'White' : 'Black';

  variation.moves.forEach((lessonMove, ply) => {
    if (chess.turn() === learnerColor) {
      puzzles.push({
        id: `${variation.id}-ply-${ply}`,
        variationId: variation.id,
        ply,
        fen: chess.fen(),
        expectedSan: lessonMove.san,
        hint: lessonMove.hint,
        explanation: lessonMove.explanation,
        prompt: `${learnerSide} to move. Which move continues your ${variation.name} line?`,
      });
    }
    try {
      chess.move(lessonMove.san, { strict: true });
    } catch {
      throw new Error(`Illegal move in ${variation.name} at ply ${ply + 1}: ${lessonMove.san}`);
    }
  });

  return puzzles;
}
