import type { LessonMove, Variation } from '../types';
import { step as s, variation as v } from './shared';

// Defining names and positions: https://github.com/lichess-org/chess-openings/blob/master/b.tsv
const start: LessonMove[] = [
  s(
    'e4',
    'White occupies the center',
    'White advances the king pawn and opens the f1 bishop.',
    'The e4 pawn controls d5 and f5. The Alekhine immediately attacks this pawn with a knight, inviting it to advance before White has developed other pieces.',
    'White advances the king pawn two squares.',
  ),
  s(
    'Nf6',
    'Invite the pawn to advance',
    'Develop the kingside knight with an attack on e4.',
    'White can gain space by pushing e5 and chasing this knight. Your plan is to draw pawns forward, then attack their support with pawn breaks and active pieces.',
    'Develop the kingside knight to attack the e4 pawn.',
  ),
  s(
    'e5',
    'White gains space with a tempo',
    'White advances the e-pawn to attack your f6 knight.',
    'The pawn controls d6 and f6, forcing your knight to move. White gains space, but the pawn will need support if you later challenge it with d6.',
    'White pushes the e-pawn one square to chase your knight.',
  ),
  s(
    'Nd5',
    'Stay active in the center',
    'Move the attacked knight to d5.',
    'The knight controls c3, e3, b4, and f4. It can be chased again with c4, so treat d5 as an active temporary square rather than expecting the knight to remain there forever.',
    'Move the attacked knight toward the central d5 square.',
  ),
];
const whiteD4 = s(
  'd4',
  'White supports the advanced pawn',
  'White advances the queen pawn behind e5.',
  'The pawn on d4 protects e5 and gains more space. This creates a supported central chain, but it also gives you a base to target with later piece pressure.',
  'White advances the queen pawn two squares to support e5.',
);
const blackD6 = s(
  'd6',
  'Question the advanced e-pawn',
  'Challenge e5 with the queen pawn.',
  'The pawn on d6 attacks e5 and opens the c8 bishop’s diagonal. White must choose between maintaining the pawn chain and exchanging to reduce the tension.',
  'Advance the queen pawn one square to attack e5.',
);
const foundation: LessonMove[] = [...start, whiteD4, blackD6];
const whiteNf3 = s(
  'Nf3',
  'White protects the central chain',
  'White develops the kingside knight behind d4 and e5.',
  'The knight supports both central pawns and clears g1 for castling. White combines the space gained earlier with piece development rather than chasing your knight with every move.',
  'White develops the kingside knight to protect d4 and e5.',
);
const modern: LessonMove[] = [...foundation, whiteNf3];
const bishopPin = s(
  'Bg4',
  'Pin a defender of the pawn chain',
  'Develop the c8 bishop against the f3 knight.',
  'With the e2 square empty, the diagonal g4–f3–e2–d1 reaches White’s queen. The knight must respect this pin when defending d4 and e5.',
  'Use the light-squared bishop to pin f3 against the queen.',
);
const whiteBe2 = s(
  'Be2',
  'White clears the castling route',
  'White develops the f1 bishop to e2.',
  'The bishop clears f1 and stands on the diagonal between f3 and d1. If a bishop is attacking from g4, this also breaks the direct line to White’s queen.',
  'White develops the kingside bishop one square diagonally.',
);
const whiteCastle = s(
  'O-O',
  'White secures the king',
  'White castles and brings the rook to f1.',
  'The king leaves the center while White keeps the central pawns supported. Your counterplay now needs to focus on the pawn structure instead of relying on an exposed king.',
  'White castles on the kingside.',
);
const blackE6 = s(
  'e6',
  'Support the knight and release the bishop',
  'Control d5 and open the f8 bishop’s diagonal.',
  'The e6 pawn protects a piece on d5 and controls f5. It clears e7 for the dark-squared bishop, helping you complete development around White’s larger center.',
  'Move the e-pawn one square to control d5 and free the bishop.',
);
const whiteC4 = s(
  'c4',
  'White chases the central knight',
  'White advances the c-pawn to attack d5.',
  'The c4 pawn gains space and attacks your knight on d5. It adds a third advanced pawn, increasing both White’s space and the number of pawns you can challenge later.',
  'White advances the c-pawn two squares against your knight.',
);
const retreatB6 = s(
  'Nb6',
  'Find an active retreat',
  'Move the attacked knight to b6.',
  'From b6 the knight controls c4 and d5. You give White space initially, but preserve the knight so it can join later counterplay against the advanced pawn center.',
  'Retreat the attacked central knight toward the b-file.',
);
const exchangeE5 = s(
  'exd6',
  'White exchanges the advanced pawn',
  'White captures your d6 pawn with the e5 pawn.',
  'White removes the central tension instead of keeping the pawn on e5. You must choose a recapture that shapes the position: the c-pawn opens the c-file, while the e-pawn opens e7 for the bishop.',
  'White’s advanced e-pawn captures the pawn on d6.',
);
const cPawnRecapture = s(
  'cxd6',
  'Choose a central pawn from the c-file',
  'Recapture on d6 with the c-pawn.',
  'The pawn on d6 controls c5 and e5 and is supported by your e7 pawn. Vacating c7 makes the c-file semi-open for Black, giving you a different structure from an e-pawn recapture.',
  'Recapture on d6 with the pawn from the c-file.',
);
const exchange: LessonMove[] = [...foundation, whiteC4, retreatB6, exchangeE5, cPawnRecapture];
const whiteNc3 = s(
  'Nc3',
  'White develops toward d5',
  'White brings the queenside knight into the center.',
  'The knight controls d5 and e4. Developing it gives White more influence over central squares without advancing another pawn.',
  'White develops the queenside knight naturally to c3.',
);
const blackG6 = s(
  'g6',
  'Prepare the bishop’s long diagonal',
  'Make g7 available for the f8 bishop.',
  'Your kingside knight has left f6, so a bishop on g7 will have a clear route toward e5. If e5 is empty, its diagonal can continue toward White’s d4 pawn.',
  'Advance the g-pawn one square to prepare a fianchetto.',
);
const blackBg7 = s(
  'Bg7',
  'Put the bishop against the center',
  'Develop the bishop on the prepared g7 square.',
  'The f6 square is empty because your knight has moved toward the queenside. The bishop can therefore put pressure on e5, or on d4 if White’s e-pawn has been exchanged.',
  'Develop the f8 bishop onto the long diagonal.',
);
const blackCastle = s(
  'O-O',
  'Secure the king before counterplay',
  'Castle behind the kingside pawns and fianchetto bishop.',
  'The original g8 knight is already on the queenside and the f8 bishop is on g7, so the path is clear. King safety gives your pieces freedom to challenge White’s central pawns.',
  'Your kingside minor pieces have left the back rank. Castle now.',
);
const whiteF4 = s(
  'f4',
  'White builds the four-pawn center',
  'White adds a pawn defender to e5.',
  'The pawn on f4 supports e5 and gains kingside space. White now has pawns on c4, d4, e5, and f4, but has spent many moves on pawns before developing pieces.',
  'White advances the f-pawn two squares to support e5.',
);
const fourPawns: LessonMove[] = [...foundation, whiteC4, retreatB6, whiteF4];

export const alekhineVariations: Variation[] = [
  v(
    'alekhine-flohr',
    'Modern: Flohr Variation',
    'Pin the center’s defender, support the d5 knight, and finish kingside development.',
    [
      ...modern,
      bishopPin,
      whiteBe2,
      s(
        'c6',
        'Give the central knight a pawn defender',
        'Support the knight on d5 with the c-pawn.',
        'The c6 pawn protects d5 and controls b5. Your knight is less exposed to exchanges on its central square, although c6 is now unavailable to the queenside knight.',
        'Reinforce the knight on d5 with the neighboring c-pawn.',
      ),
      whiteCastle,
      blackE6,
    ],
  ),
  v(
    'alekhine-keres',
    'Modern: Keres Variation',
    'Meet the bishop’s attack on d5 with an active knight retreat and a fianchetto.',
    [
      ...modern,
      blackG6,
      s(
        'Bc4',
        'White develops against the d5 knight',
        'White puts the bishop on c4 and attacks your central knight.',
        'The bishop sees the knight immediately on d5. If that knight moves, the diagonal continues through e6 toward f7, so your retreat should consider the bishop’s future activity as well.',
        'White develops the f1 bishop to attack the knight on d5.',
      ),
      s(
        'Nb6',
        'Retreat with an attack of your own',
        'Move the d5 knight to b6 and attack the c4 bishop.',
        'The knight on b6 attacks c4, gaining a tempo against the bishop that chased it. It also controls d5, so the retreat preserves central influence.',
        'Move the attacked knight to a square that also attacks the c4 bishop.',
      ),
      s(
        'Bb3',
        'White preserves the active diagonal',
        'White retreats the attacked bishop to b3.',
        'From b3 the bishop still looks through c4, d5, and e6 toward f7. It keeps an attacking diagonal but has spent another move rather than developing a new piece.',
        'White retreats the c4 bishop one diagonal square toward the b-file.',
      ),
      blackBg7,
      s(
        'a4',
        'White prepares another knight chase',
        'White gains queenside space and prepares a5.',
        'A pawn on a5 would attack your knight on b6. This is the characteristic Keres continuation: White adds a queenside pawn advance while keeping the bishop on b3.',
        'White advances the a-pawn two squares to prepare a5 against b6.',
      ),
      s(
        'dxe5',
        'Answer the flank plan in the center',
        'Capture White’s advanced e5 pawn with your d6 pawn.',
        'You resolve the central tension while White prepares a queenside pawn chase. White can recapture with a knight or pawn, so you are changing the structure rather than winning the protected pawn for free.',
        'Use the d6 pawn to capture the advanced e5 pawn.',
      ),
    ],
  ),
  v(
    'alekhine-larsen',
    'Modern: Larsen Variation',
    'Exchange e5 and challenge the recapturing knight with development.',
    [
      ...modern,
      s(
        'dxe5',
        'Resolve the advanced pawn tension',
        'Capture White’s e5 pawn with your d6 pawn.',
        'Removing e5 reduces White’s space advantage. White can recapture with the f3 knight, so prepare to challenge that centralized piece rather than leaving it unopposed.',
        'Use the queen pawn to capture the advanced e5 pawn.',
      ),
      s(
        'Nxe5',
        'White recaptures with a central knight',
        'White’s f3 knight takes your pawn on e5.',
        'The knight on e5 controls c6, d7, f7, and g6. It is active, but a developing move from your queenside knight can attack it immediately.',
        'White’s developed kingside knight recaptures on e5.',
      ),
      s(
        'Nd7',
        'Develop while attacking the knight',
        'Bring the queenside knight to d7 and attack e5.',
        'The knight on d7 attacks White’s centralized knight and supports f6. You gain development while asking White to defend or relocate the piece on e5.',
        'Develop the queenside knight to attack the knight on e5.',
      ),
      s(
        'Nf3',
        'White returns to the defensive square',
        'White retreats the attacked knight from e5 to f3.',
        'The knight again protects d4 and controls e5. White keeps the central queen pawn supported, but has spent two moves moving the same knight out and back.',
        'White retreats the e5 knight to its earlier f3 square.',
      ),
      blackE6,
    ],
  ),
  v(
    'alekhine-larsen-haakert',
    'Modern: Larsen-Haakert Variation',
    'Develop both knights against the center, then choose the e-pawn recapture.',
    [
      ...modern,
      s(
        'Nc6',
        'Put a second knight against the center',
        'Develop the queenside knight toward d4 and e5.',
        'The knight attacks both White central pawns. Your d6 pawn also attacks e5, creating pressure before White finishes developing the bishops.',
        'Develop the queenside knight against White’s d4 and e5 pawns.',
      ),
      whiteC4,
      retreatB6,
      exchangeE5,
      s(
        'exd6',
        'Choose the e-pawn recapture',
        'Restore material on d6 with the e-pawn.',
        'The pawn on d6 controls c5 and e5, while vacating e7 lets the f8 bishop develop to e7. Your c-pawn stays on c7, preserving a different queenside structure from the Exchange Variation’s c-pawn recapture.',
        'Recapture the pawn on d6 with your e-pawn, leaving c7 unchanged.',
      ),
    ],
  ),
  v(
    'alekhine-schmid',
    'Modern: Schmid Variation',
    'Relocate the knight before c4 and pressure the piece defending White’s center.',
    [
      ...modern,
      s(
        'Nb6',
        'Move before the c-pawn chase',
        'Relocate the d5 knight to b6 while White develops.',
        'The knight controls c4 and d5 and avoids being chased from d5 by a later c4 move. You spend a second knight move, so the rest of your development should stay purposeful.',
        'Move the central knight toward b6 before White plays c4.',
      ),
      whiteBe2,
      s(
        'Bg4',
        'Attack a defender without a queen pin',
        'Develop the light-squared bishop against the f3 knight.',
        'The f3 knight protects d4 and e5, so an exchange would weaken White’s central defenders. The bishop on e2 blocks the line to the queen, making this piece pressure rather than a direct queen pin.',
        'Develop the c8 bishop to pressure the knight supporting White’s center.',
      ),
      whiteCastle,
      s(
        'e6',
        'Prepare the remaining bishop',
        'Open e7 for your dark-squared bishop.',
        'The pawn controls d5 and f5 and frees the f8 bishop to develop. Your light-squared bishop is already on g4, so e6 does not trap it at home.',
        'Move the e-pawn one square to release the f8 bishop.',
      ),
    ],
  ),
  v(
    'alekhine-karpov',
    'Exchange: Karpov Setup',
    'Use a semi-open c-file, fianchetto, and meet White’s restrained central development.',
    [
      ...exchange,
      whiteNc3,
      blackG6,
      s(
        'h3',
        'White restricts a bishop square',
        'White controls g4 with the h-pawn.',
        'The pawn discourages your light-squared bishop from going to g4. White chooses a useful restraint before developing the kingside knight and castling.',
        'White advances the h-pawn one square to control g4.',
      ),
      blackBg7,
      s(
        'Nf3',
        'White protects the remaining central pawn',
        'White develops the kingside knight and reinforces d4.',
        'White’s e-pawn has been exchanged, so d4 is the central pawn to maintain. The knight protects it and controls e5 while clearing g1 for castling.',
        'White develops the kingside knight to protect d4.',
      ),
      blackCastle,
    ],
  ),
  v(
    'alekhine-voronezh',
    'Exchange: Voronezh Setup',
    'Recognize White’s delayed knight development and prepare play against the pawn duo.',
    [
      ...exchange,
      whiteNc3,
      blackG6,
      s(
        'Be3',
        'White reinforces d4 with the bishop',
        'White develops the c1 bishop behind the central pawns.',
        'The bishop on e3 protects d4 and clears c1. White keeps the g1 knight at home for now, leaving future kingside development flexible.',
        'White develops the queenside bishop to defend d4.',
      ),
      blackBg7,
      s(
        'Rc1',
        'White prepares future c-file play',
        'White moves the a1 rook to the cleared c1 square.',
        'The knight on c3 still blocks the rook’s file, so this is preparation rather than immediate pressure. Central exchanges or a knight move can later make the rook’s position useful.',
        'White brings the queenside rook to c1 after developing the knight and bishop.',
      ),
      blackCastle,
    ],
  ),
  v(
    'alekhine-korchnoi',
    'Four Pawns: Korchnoi Variation',
    'Exchange e5, develop the light-squared bishop, and prepare the king for safety.',
    [
      ...fourPawns,
      s(
        'dxe5',
        'Challenge the expanded center',
        'Capture White’s e5 pawn with the d-pawn.',
        'You remove one of the advanced central pawns. White can maintain a pawn on e5 by recapturing from f4, but the f-file will then be emptied of its pawn.',
        'Use your d6 pawn to capture the advanced e5 pawn.',
      ),
      s(
        'fxe5',
        'White rebuilds the advanced pawn chain',
        'White recaptures on e5 with the f-pawn.',
        'The pawn on e5 is still supported by d4, but it now came from the f-file. White has kept central space while opening the f-file for possible rook activity later.',
        'White’s f4 pawn recaptures on e5.',
      ),
      s(
        'Bf5',
        'Free the bishop before e6',
        'Develop the c8 bishop onto an active diagonal.',
        'The bishop influences e4 and d3 before an e6 pawn move could block its route. You use the time White spent on pawns to develop a piece toward the center.',
        'Develop the light-squared bishop through d7 and e6 before closing the diagonal.',
      ),
      whiteNc3,
      s(
        'e6',
        'Support the active bishop and free the other one',
        'Move the e-pawn one square behind the bishop.',
        'The e6 pawn protects your bishop on f5 and controls d5. It also clears e7 for the f8 bishop, linking your central structure to the next developing move.',
        'Use the e-pawn to protect the f5 bishop and open e7.',
      ),
      whiteNf3,
      s(
        'Be7',
        'Finish the kingside castling route',
        'Develop the f8 bishop to e7.',
        'Your original kingside knight is already on b6. Moving the bishop clears f8, so you can prepare to castle instead of leaving the king exposed while the center remains tense.',
        'Develop the f8 bishop one square to complete the castling path.',
      ),
    ],
  ),
  v(
    'alekhine-four-pawns-fianchetto',
    'Four Pawns: Fianchetto Variation',
    'Challenge the expanded center with a bishop on the long diagonal and a safe king.',
    [...fourPawns, blackG6, whiteNf3, blackBg7, whiteNc3, blackCastle],
  ),
  v(
    'alekhine-mikenas',
    'Two Pawns: Mikenas Variation',
    'Answer repeated knight chases by supporting d5 and challenging both advanced pawns.',
    [
      ...start,
      s(
        'c4',
        'White adds a second advanced pawn',
        'White attacks the d5 knight with the c-pawn.',
        'White gains space with the c-pawn while the d-pawn remains on d2. This is the Two Pawns approach: chase the knight first, then decide how to support the advanced e-pawn.',
        'White advances the c-pawn two squares to attack d5.',
      ),
      retreatB6,
      s(
        'c5',
        'White chases the knight again',
        'White advances the c-pawn to attack b6.',
        'The c5 pawn controls b6 and d6, forcing another knight decision. White gains space but has moved the same pawn twice before developing a piece.',
        'White pushes the c-pawn one square to attack the knight on b6.',
      ),
      s(
        'Nd5',
        'Return to the central outpost',
        'Move the attacked knight back to d5.',
        'The knight escapes the c5 pawn’s attack and again controls c3 and f4. Supporting it with e6 will make the coming bishop and knight pressure easier to handle.',
        'Return the attacked knight from b6 to its earlier central square.',
      ),
      s(
        'Bc4',
        'White develops against the knight',
        'White uses the c4 square vacated by the c-pawn.',
        'The bishop on c4 attacks your knight on d5. White is finally developing a piece, but the pawn advances have given you time to prepare support for that knight.',
        'White develops the f1 bishop onto the square the c-pawn left.',
      ),
      blackE6,
      whiteNc3,
      s(
        'd6',
        'Attack both advanced pawn targets',
        'Challenge White’s pawns on c5 and e5 with the d-pawn.',
        'The pawn on d6 attacks both c5 and e5. Your knight on d5 is supported by e6, so you can now challenge the pawn expansion rather than keep retreating pieces.',
        'Move the queen pawn one square to attack the two advanced pawns.',
      ),
    ],
  ),
];
