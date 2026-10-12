import type { LessonMove, Variation } from '../types';

/** Shared branches keep each opening's explanation and repertoire data together. */
export function step(
  san: string,
  title: string,
  explanation: string,
  why: string,
  hint: string,
): LessonMove {
  return { san, title, explanation, why, hint };
}

export function variation(
  id: string,
  name: string,
  description: string,
  moves: LessonMove[],
): Variation {
  return { id, name, description, moves };
}
