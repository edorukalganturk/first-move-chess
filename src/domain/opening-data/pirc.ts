import type { LessonMove, Variation } from '../types';
import { step as s, variation as v } from './shared';

// Defining names and positions: https://github.com/lichess-org/chess-openings/blob/master/b.tsv
const foundation: LessonMove[] = [
  s(
    'e4',
    'White takes central space',
    'White advances the king pawn and opens the f1 bishop.',
    'The e4 pawn controls d5 and f5. The Pirc allows this space initially, then challenges the center with pieces and a well-timed pawn break.',
    'White advances the king pawn two squares.',
  ),
  s(
    'd6',
    'Build a compact central base',
    'Control e5 with the queen pawn without occupying it yet.',
    'The pawn on d6 controls c5 and e5 and opens the c8 bishop’s diagonal. It also supports a possible e5 break after your pieces and king are ready.',
    'Move the queen pawn one square to control e5.',
  ),
  s(
    'd4',
    'White builds the central duo',
    'White adds the queen pawn beside e4.',
    'White gains more space and opens the c1 bishop. The two-pawn center will be your target; having more space does not make it immune to pawn breaks.',
    'White advances the queen pawn two squares.',
  ),
  s(
    'Nf6',
    'Develop with pressure on e4',
    'Bring out the kingside knight and attack the e4 pawn.',
    'The knight attacks e4 and controls d5. You gain useful central influence without committing your e-pawn, while White must defend the king pawn.',
    'Develop the kingside knight to the square that attacks e4.',
  ),
  s(
    'Nc3',
    'White protects the attacked pawn',
    'White develops the queenside knight to defend e4.',
    'The c3 knight supports e4 and controls d5. White maintains the broad pawn center with a developing move instead of adding another pawn defender.',
    'White develops the queenside knight to defend e4.',
  ),
  s(
    'g6',
    'Prepare the long-diagonal bishop',
    'Make g7 available for the f8 bishop.',
    'The bishop will reinforce the kingside and gain central influence when the f6 knight moves. Its diagonal is initially blocked by that knight, so the pressure is a developing plan rather than an immediate attack on d4.',
    'Advance the g-pawn one square to prepare a fianchetto.',
  ),
];
const whiteNf3 = s(
  'Nf3',
  'White develops behind the pawn duo',
  'White brings the kingside knight toward d4 and e5.',
  'The knight protects d4 and controls e5 and g5. White also clears g1 for castling while keeping the central pawn structure intact.',
  'White develops the kingside knight to support d4.',
);
const bishopG7 = s(
  'Bg7',
  'Complete the fianchetto',
  'Place your f8 bishop on the prepared g7 square.',
  'The bishop helps protect your future castled king. Its line toward e5 and d4 will open if the f6 knight moves, so coordinate the bishop with central pawn breaks.',
  'Develop the kingside bishop onto the square the g-pawn vacated.',
);
const whiteBe2 = s(
  'Be2',
  'White chooses quiet development',
  'White develops the kingside bishop and prepares to castle.',
  'The bishop clears f1 without committing to an early attack. White aims to secure the king and then use the space offered by d4 and e4.',
  'White develops the f1 bishop just one diagonal square.',
);
const castleBlack = s(
  'O-O',
  'Put the king behind the fianchetto',
  'Castle before opening the center.',
  'The g7 bishop and kingside pawns give the king a shelter on g8. Your rook reaches f8, and you can now consider c5 or e5 without keeping the king on e8.',
  'Both kingside minor pieces have moved. Castle now.',
);
const castleWhite = s(
  'O-O',
  'White secures the king',
  'White castles and brings the rook toward the center.',
  'The king leaves e1 while the rook reaches f1. With both kings safe, the fight over d4 and e4 can develop into pawn exchanges and active piece play.',
  'White castles on the kingside.',
);
const classical: LessonMove[] = [
  ...foundation,
  whiteNf3,
  bishopG7,
  whiteBe2,
  castleBlack,
  castleWhite,
];
const knightC6 = s(
  'Nc6',
  'Attack the base of White’s center',
  'Develop the queenside knight with pressure on d4.',
  'The knight on c6 attacks d4 and controls e5. Your d6 pawn already controls e5, so the new knight adds pressure against the other central pawn.',
  'Develop the queenside knight toward White’s d4 pawn.',
);
const c6Setup = s(
  'c6',
  'Prepare a supported d5 challenge',
  'Control d5 and give the queenside a flexible pawn base.',
  'The pawn on c6 supports a possible d5 advance and controls b5. It also supports a later b5 expansion, but takes the natural c6 square away from your queenside knight.',
  'Use the c-pawn to support d5 while keeping the center flexible.',
);
const austrianF4 = s(
  'f4',
  'White prepares a larger center',
  'White advances the f-pawn to control e5.',
  'The f4 pawn supports a future e5 advance and gains kingside space. White has used another move on a pawn, giving you time to finish development and challenge the center before it advances further.',
  'White advances the f-pawn two squares to support a future e5 push.',
);
const austrian: LessonMove[] = [...foundation, austrianF4, bishopG7, whiteNf3];

export const pircVariations: Variation[] = [
  v(
    'pirc-chigorin',
    'Classical: Chigorin Line',
    'Castle, then develop a knight directly against White’s d4 pawn.',
    [...classical, knightC6],
  ),
  v(
    'pirc-czech',
    'Classical: Czech Defense',
    'Use c6 to prepare d5 and give the queenside a flexible pawn structure.',
    [...classical, c6Setup],
  ),
  v(
    'pirc-parma',
    'Classical: Parma Defense',
    'Develop the light-squared bishop against a knight that supports White’s center.',
    [
      ...classical,
      s(
        'Bg4',
        'Question the knight defending d4',
        'Develop the c8 bishop with pressure on the f3 knight.',
        'Exchanging on f3 could remove a defender of d4. White’s bishop on e2 sits between the knight and queen, so this is pressure on the knight rather than a direct pin to the queen on d1.',
        'Use the open c8 diagonal to attack the knight on f3.',
      ),
    ],
  ),
  v(
    'pirc-schlechter',
    'Classical: Schlechter Variation',
    'Meet White’s h3 restraint with king safety and pressure on d4.',
    [
      ...foundation,
      whiteNf3,
      bishopG7,
      s(
        'h3',
        'White keeps pieces out of g4',
        'White uses the h-pawn to control g4.',
        'The pawn makes a bishop or knight move to g4 less comfortable. White spends a move preventing pressure rather than developing the f1 bishop immediately.',
        'White advances the h-pawn one square to control g4.',
      ),
      castleBlack,
      s(
        'Be3',
        'White reinforces the queen pawn',
        'White develops the c1 bishop to protect d4.',
        'The bishop on e3 defends d4 and can cooperate with a later queen move to d2. White can choose the king’s destination after finishing this setup.',
        'White develops the queenside bishop in front of the e-pawn.',
      ),
      knightC6,
    ],
  ),
  v(
    'pirc-austrian-dragon',
    'Austrian Attack: Dragon Formation',
    'Challenge d4 early and use queen activity after the pawn exchange.',
    [
      ...austrian,
      s(
        'c5',
        'Attack the base before e5 advances',
        'Challenge White’s d4 pawn with your c-pawn.',
        'The pawn on c5 attacks d4, the base that supports a future e5 advance. You choose central counterplay before castling, so be ready for exchanges that open the queen’s diagonal.',
        'Advance the c-pawn two squares to attack d4.',
      ),
      s(
        'dxc5',
        'White removes the central challenger',
        'White captures the c5 pawn with the d-pawn.',
        'White’s pawn leaves d4, changing the broad central duo into pawns on c5, e4, and f4. The c3 knight still stands on the diagonal from a5 to e1.',
        'White’s queen pawn captures the c-pawn that challenged it.',
      ),
      s(
        'Qa5',
        'Create two queenside targets',
        'Develop the queen with pressure on c5 and the c3 knight.',
        'The queen attacks the pawn on c5 along the fifth rank. Its diagonal through b4 and c3 also reaches e1 with d2 empty, pinning the c3 knight against the king.',
        'Use the diagonal cleared by your c-pawn to put the queen on a5.',
      ),
    ],
  ),
  v(
    'pirc-austrian-bronstein',
    'Austrian: Unzicker Attack',
    'Meet e5 with a useful knight retreat and prepare to undermine the advanced center.',
    [
      ...austrian,
      castleBlack,
      s(
        'e5',
        'White uses the supporting f-pawn',
        'White advances the e-pawn to attack your f6 knight.',
        'The e5 pawn is supported by d4 and f4 and controls d6 and f6. White gains space, but the advanced chain gives you targets for later c5 or d-pawn exchanges.',
        'White pushes the e-pawn one square to attack f6.',
      ),
      s(
        'Nfd7',
        'Retreat without abandoning central play',
        'Move the attacked f6 knight to d7.',
        'From d7 the knight controls c5 and e5 and leaves f6 clear for your bishop’s diagonal. Both Black knights could reach d7, so the notation identifies the knight from the f-file.',
        'Move the attacked knight back to a square that controls c5 and e5.',
      ),
    ],
  ),
  v(
    'pirc-inner-doll',
    '150 Attack: Inner Doll Defense',
    'Develop the bishop before choosing a retreat when White reinforces e4 with f3.',
    [
      ...foundation,
      s(
        'Be3',
        'White builds a flexible attacking setup',
        'White develops the c1 bishop and defends d4.',
        'The bishop supports d4 and prepares a queen-and-bishop battery after Qd2. White can later aim for queenside castling and a kingside pawn advance.',
        'White brings the queenside bishop to e3.',
      ),
      c6Setup,
      s(
        'Qd2',
        'White puts the queen behind the bishop',
        'White prepares queenside castling and a possible bishop trade on h6.',
        'The queen on d2 supports the bishop along d2–e3–f4–g5–h6. Clearing d1 also makes queenside castling possible once the other necessary squares are safe.',
        'White moves the queen behind the bishop on e3.',
      ),
      s(
        'Bg4',
        'Use the light-squared diagonal first',
        'Develop the c8 bishop to control f3 and e2.',
        'Your bishop leaves c8 before a future e6 move could restrict it. White’s queen is on d2, so there is no queen pin along the g4 diagonal; the bishop instead influences White’s kingside development.',
        'Develop the c8 bishop along its open diagonal toward the kingside.',
      ),
      s(
        'f3',
        'White supports e4 and attacks the bishop',
        'White advances the f-pawn one square.',
        'The pawn on f3 protects e4 and attacks your bishop on g4. It takes the natural f3 square away from White’s knight, a tradeoff made to secure the center and gain a tempo.',
        'White uses the f-pawn to defend e4 and chase the g4 bishop.',
      ),
      s(
        'Bd7',
        'Keep the bishop without closing the center',
        'Retreat the attacked bishop to d7.',
        'The diagonal through f5 and e6 is clear, allowing the bishop to return safely. From d7 it can later move toward the queenside while your g-pawn setup remains ready for Bg7.',
        'Retreat along the bishop’s diagonal toward the square your d-pawn vacated.',
      ),
    ],
  ),
  v(
    'pirc-byrne',
    'Byrne Variation',
    'Meet early bishop pressure with a fianchetto and queenside counterplay.',
    [
      ...foundation,
      s(
        'Bg5',
        'White develops against f6',
        'White’s c1 bishop attacks your kingside knight.',
        'The bishop pressures f6, but your e7 pawn blocks the diagonal before it reaches the queen on d8. An exchange would change the kingside defenders rather than win the queen automatically.',
        'White develops the queenside bishop to attack f6.',
      ),
      bishopG7,
      s(
        'Qd2',
        'White prepares the queenside king route',
        'White moves the queen away from d1.',
        'The queen helps coordinate the bishop on g5 and clears the d1 square. With the c1 bishop and b1 knight already developed, White can consider queenside castling.',
        'White moves the queen to d2 and clears the queenside castling path.',
      ),
      castleBlack,
      s(
        'O-O-O',
        'White chooses the opposite wing',
        'White castles queenside and puts a rook on d1.',
        'The kings now stand on opposite wings, making pawn advances against each king more attractive. The rook on d1 also adds support to White’s central d4 pawn.',
        'White castles on the queenside.',
      ),
      s(
        'c6',
        'Prepare counterplay toward White’s king',
        'Build support for b5 and a possible central d5 break.',
        'The c6 pawn protects b5 and d5. Since White’s king is on c1, queenside expansion can gain useful space, but the central e4 and d4 pawns still need attention.',
        'Use the c-pawn to prepare queenside space against the king on c1.',
      ),
    ],
  ),
  v(
    'pirc-kholmov',
    'Kholmov System',
    'Respect the bishop’s f7 diagonal while developing against the central pawns.',
    [
      ...foundation,
      s(
        'Bc4',
        'White develops toward f7',
        'White places the f1 bishop on the c4–f7 diagonal.',
        'The bishop sees f7 through the empty d5 and e6 squares. This creates pressure near your king, so finishing king safety is useful before opening the center.',
        'White develops the kingside bishop onto the diagonal toward f7.',
      ),
      bishopG7,
      s(
        'Qe2',
        'White adds a defender to e4',
        'White places the queen behind the central e-pawn.',
        'The queen protects e4 along the e-file, helping support the center against your f6 knight. White also leaves d1 clear for the rook or king’s later plans.',
        'White moves the queen onto the e-file to protect e4.',
      ),
      castleBlack,
      whiteNf3,
      knightC6,
    ],
  ),
  v(
    'pirc-sveshnikov',
    'Sveshnikov System',
    'Meet White’s fianchetto with a supported e5 break and a safe king.',
    [
      ...foundation,
      s(
        'g3',
        'White prepares another fianchetto',
        'White makes g2 available for the f1 bishop.',
        'The bishop on g2 will protect the e4 pawn through f3 while that square remains clear. White chooses steady central support instead of an immediate f4 advance.',
        'White advances the g-pawn one square for the bishop.',
      ),
      bishopG7,
      s(
        'Bg2',
        'White supports the central e-pawn',
        'White develops the bishop onto the prepared g2 square.',
        'The diagonal g2–f3–e4 reaches White’s own central pawn, giving it another defender. The pawn itself blocks the bishop’s influence farther across the board until the center changes.',
        'White completes the kingside fianchetto.',
      ),
      castleBlack,
      s(
        'Nge2',
        'White keeps the bishop’s diagonal clear',
        'White develops the g1 knight to e2 instead of f3.',
        'The knight on e2 supports d4 while leaving f3 empty for the bishop’s protection of e4. Both White knights could reach e2, so the notation specifies the g-file knight.',
        'White develops the g1 knight without blocking the g2 bishop.',
      ),
      s(
        'e5',
        'Challenge the center with support',
        'Advance the e-pawn to attack d4.',
        'The pawn on d6 protects e5, so a White capture on e5 can be answered by the d-pawn. You now contest the central space that White occupied at the start.',
        'Use the e-pawn to challenge d4, backed by the pawn on d6.',
      ),
    ],
  ),
];
