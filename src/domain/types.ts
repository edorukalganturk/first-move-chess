export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type OpeningCategory = 'Open game' | 'Semi-open game' | 'Closed game' | 'Flank opening';

export interface LessonMove {
  san: string;
  title: string;
  explanation: string;
  why: string;
  hint: string;
}

export interface Variation {
  id: string;
  name: string;
  description: string;
  moves: LessonMove[];
}

export interface Opening {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  difficulty: Difficulty;
  side: 'White' | 'Black';
  category: OpeningCategory;
  accent: string;
  variations: Variation[];
  available: boolean;
}

export interface Puzzle {
  id: string;
  variationId: string;
  /** Number of half-moves already played before the learner's decision. */
  ply: number;
  fen: string;
  expectedSan: string;
  hint: string;
  explanation: string;
  prompt: string;
}
