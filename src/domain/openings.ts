import type { Opening, Variation } from './types';
import { italianVariations } from './opening-data/italian';
import { ruyLopezVariations } from './opening-data/ruy-lopez';
import { scotchVariations } from './opening-data/scotch';
import { queensGambitVariations } from './opening-data/queens-gambit';
import { sicilianVariations } from './opening-data/sicilian';
import { frenchVariations } from './opening-data/french';
import { caroKannVariations } from './opening-data/caro-kann';
import { kingsIndianVariations } from './opening-data/kings-indian';
import { englishVariations } from './opening-data/english';
import { retiVariations } from './opening-data/reti';
import { londonVariations } from './opening-data/london';
import { viennaVariations } from './opening-data/vienna';
import { kingsGambitVariations } from './opening-data/kings-gambit';
import { fourKnightsVariations } from './opening-data/four-knights';
import { scandinavianVariations } from './opening-data/scandinavian';
import { pircVariations } from './opening-data/pirc';
import { alekhineVariations } from './opening-data/alekhine';
import { dutchVariations } from './opening-data/dutch';
import { nimzoIndianVariations } from './opening-data/nimzo-indian';
import { grunfeldVariations } from './opening-data/grunfeld';

export const italianOpening: Opening = {
  id: 'italian-game',
  name: 'Italian Game',
  subtitle: 'A beautiful place to begin',
  description:
    'Discover the opening essentials: own the center, develop with purpose, and get your king to safety.',
  difficulty: 'Beginner',
  side: 'White',
  category: 'Open game',
  accent: '#DDA365',
  variations: italianVariations,
  available: true,
};

export const openings: Opening[] = [
  italianOpening,
  {
    id: 'ruy-lopez',
    name: 'Ruy Lopez',
    subtitle: 'Pressure that lasts',
    description:
      'Build lasting pressure on Black’s center with an active bishop and patient development.',
    difficulty: 'Intermediate',
    side: 'White',
    category: 'Open game',
    accent: '#B2A2CE',
    variations: ruyLopezVariations,
    available: true,
  },
  {
    id: 'scotch-game',
    name: 'Scotch Game',
    subtitle: 'Open the center early',
    description: 'Challenge the center directly and find active squares for your pieces.',
    difficulty: 'Beginner',
    side: 'White',
    category: 'Open game',
    accent: '#9DB6BC',
    variations: scotchVariations,
    available: true,
  },
  {
    id: 'queens-gambit',
    name: 'Queen’s Gambit',
    subtitle: 'Build a bigger center',
    description: 'Offer a flank pawn to challenge Black’s central foothold and gain space.',
    difficulty: 'Intermediate',
    side: 'White',
    category: 'Closed game',
    accent: '#C4A490',
    variations: queensGambitVariations,
    available: true,
  },
  {
    id: 'sicilian-defense',
    name: 'Sicilian Defense',
    subtitle: 'Create your own chances',
    description: 'Meet e4 with an asymmetric center and learn to create active counterplay.',
    difficulty: 'Advanced',
    side: 'Black',
    category: 'Semi-open game',
    accent: '#B7BB83',
    variations: sicilianVariations,
    available: true,
  },
  {
    id: 'french-defense',
    name: 'French Defense',
    subtitle: 'Solid structure, sharp plans',
    description: 'Build a resilient pawn chain and learn when to challenge its base.',
    difficulty: 'Intermediate',
    side: 'Black',
    category: 'Semi-open game',
    accent: '#C6938F',
    variations: frenchVariations,
    available: true,
  },
  {
    id: 'caro-kann',
    name: 'Caro-Kann',
    subtitle: 'A foundation you can trust',
    description: 'Support your center while finding a good home for the light-squared bishop.',
    difficulty: 'Beginner',
    side: 'Black',
    category: 'Semi-open game',
    accent: '#96ACA0',
    variations: caroKannVariations,
    available: true,
  },
  {
    id: 'kings-indian-defense',
    name: 'King’s Indian Defense',
    subtitle: 'Let your pieces do the talking',
    description: 'Give White space, then challenge the center with well-timed pawn breaks.',
    difficulty: 'Advanced',
    side: 'Black',
    category: 'Closed game',
    accent: '#9AA6C3',
    variations: kingsIndianVariations,
    available: true,
  },
  {
    id: 'english-opening',
    name: 'English Opening',
    subtitle: 'Control the center from the flank',
    description:
      'Start with c4, develop flexibly, and choose the right moment to claim central space.',
    difficulty: 'Intermediate',
    side: 'White',
    category: 'Flank opening',
    accent: '#A8B69B',
    variations: englishVariations,
    available: true,
  },
  {
    id: 'reti-opening',
    name: 'Réti Opening',
    subtitle: 'Let the center reveal its shape',
    description:
      'Develop your knight first, then challenge central pawns with pieces and flank breaks.',
    difficulty: 'Intermediate',
    side: 'White',
    category: 'Flank opening',
    accent: '#B2A2CE',
    variations: retiVariations,
    available: true,
  },
  {
    id: 'london-system',
    name: 'London System',
    subtitle: 'A familiar setup with flexible plans',
    description:
      'Bring the bishop out before building your pawn chain, and adapt your setup to Black’s reply.',
    difficulty: 'Beginner',
    side: 'White',
    category: 'Closed game',
    accent: '#96ACA0',
    variations: londonVariations,
    available: true,
  },
  {
    id: 'vienna-game',
    name: 'Vienna Game',
    subtitle: 'Develop first, choose your attack',
    description:
      'Support e4 with your queenside knight and explore quiet development or a timely f-pawn advance.',
    difficulty: 'Beginner',
    side: 'White',
    category: 'Open game',
    accent: '#DDA365',
    variations: viennaVariations,
    available: true,
  },
  {
    id: 'kings-gambit',
    name: 'King’s Gambit',
    subtitle: 'Trade a pawn for active possibilities',
    description:
      'Offer the f-pawn to challenge e5, then learn to balance fast development with king safety.',
    difficulty: 'Advanced',
    side: 'White',
    category: 'Open game',
    accent: '#C6938F',
    variations: kingsGambitVariations,
    available: true,
  },
  {
    id: 'four-knights-game',
    name: 'Four Knights Game',
    subtitle: 'Develop naturally and find your plan',
    description:
      'Put both knights near the center, then choose a bishop setup or a direct central exchange.',
    difficulty: 'Beginner',
    side: 'White',
    category: 'Open game',
    accent: '#9DB6BC',
    variations: fourKnightsVariations,
    available: true,
  },
  {
    id: 'scandinavian-defense',
    name: 'Scandinavian Defense',
    subtitle: 'Challenge the center immediately',
    description:
      'Meet e4 with d5 and learn how to develop smoothly after an early central exchange.',
    difficulty: 'Beginner',
    side: 'Black',
    category: 'Semi-open game',
    accent: '#9AA6C3',
    variations: scandinavianVariations,
    available: true,
  },
  {
    id: 'pirc-defense',
    name: 'Pirc Defense',
    subtitle: 'Invite space, prepare a challenge',
    description:
      'Fianchetto the king’s bishop and decide how to counter White’s broad central pawn formation.',
    difficulty: 'Intermediate',
    side: 'Black',
    category: 'Semi-open game',
    accent: '#B7BB83',
    variations: pircVariations,
    available: true,
  },
  {
    id: 'alekhine-defense',
    name: 'Alekhine Defense',
    subtitle: 'Turn advanced pawns into targets',
    description:
      'Provoke White’s center with your knight, then use development and pawn breaks to challenge it.',
    difficulty: 'Intermediate',
    side: 'Black',
    category: 'Semi-open game',
    accent: '#C4A490',
    variations: alekhineVariations,
    available: true,
  },
  {
    id: 'dutch-defense',
    name: 'Dutch Defense',
    subtitle: 'Make space for an active kingside',
    description:
      'Use the f-pawn to control e4, then build a sound piece setup around your chosen pawn structure.',
    difficulty: 'Advanced',
    side: 'Black',
    category: 'Closed game',
    accent: '#B2A2CE',
    variations: dutchVariations,
    available: true,
  },
  {
    id: 'nimzo-indian-defense',
    name: 'Nimzo-Indian Defense',
    subtitle: 'Use a pin to shape the center',
    description:
      'Pin the c3 knight, restrain e4, and weigh active pieces against changes in White’s pawn structure.',
    difficulty: 'Advanced',
    side: 'Black',
    category: 'Closed game',
    accent: '#96ACA0',
    variations: nimzoIndianVariations,
    available: true,
  },
  {
    id: 'grunfeld-defense',
    name: 'Grünfeld Defense',
    subtitle: 'A big center can be a big target',
    description:
      'Challenge d4 with d5, then use your bishop and pawn breaks to pressure White’s central pawns.',
    difficulty: 'Advanced',
    side: 'Black',
    category: 'Closed game',
    accent: '#9DB6BC',
    variations: grunfeldVariations,
    available: true,
  },
];

export function getOpening(id: string): Opening | undefined {
  return openings.find((opening) => opening.id === id);
}

export function getVariation(id: string): Variation | undefined {
  return openings.flatMap((opening) => opening.variations).find((variation) => variation.id === id);
}
