import type { LessonMove, Variation } from '../types';
import { step as s, variation as v } from './shared';

// Defining names and positions: https://github.com/lichess-org/chess-openings/blob/master/b.tsv
const start: LessonMove[] = [
  s(
    'e4',
    'White occupies the center',
    'White opens the f1 bishop and controls d5.',
    'The e4 pawn gains space, but it is also a target. The Scandinavian challenges it immediately instead of first preparing a central pawn advance.',
    'White advances the king pawn two squares.',
  ),
  s(
    'd5',
    'Challenge the center immediately',
    'Attack White’s e4 pawn with your queen pawn.',
    'You open the c8 bishop’s diagonal and force an early decision in the center. If White captures, you can recover the pawn with the queen or develop a knight first.',
    'Advance the queen pawn two squares to attack e4.',
  ),
  s(
    'exd5',
    'White accepts the central exchange',
    'White captures your d5 pawn with the e-pawn.',
    'White removes your central pawn, but the pawn on d5 can be attacked by your queen or kingside knight. Your choice of recapture determines how quickly each side develops.',
    'White’s e-pawn captures the pawn on d5.',
  ),
];
const queenCapture = s(
  'Qxd5',
  'Restore material with the queen',
  'Recapture the pawn in the center.',
  'Your queen restores material immediately, but White can develop Nc3 while attacking it. Plan the retreat as part of the opening, rather than treating the queen’s central square as permanent.',
  'The open d-file lets your queen recover the pawn.',
);
const knightTempo = s(
  'Nc3',
  'White develops with a tempo',
  'White attacks your queen with the queenside knight.',
  'The knight on c3 controls d5, so the queen must move. White develops a piece while you spend another move on the queen; your later development needs to be economical.',
  'White develops the queenside knight to attack the queen on d5.',
);
const queenStart: LessonMove[] = [...start, queenCapture, knightTempo];
const queenA5 = s(
  'Qa5',
  'Keep the queen active from the side',
  'Move the queen away from the knight’s attack.',
  'The queen on a5 looks toward c3 along the diagonal through b4. If White moves the d2 pawn, that diagonal can also reach e1, so the queen has a role beyond simply retreating.',
  'Move the queen along the fifth rank toward the a-file.',
);
const queenD6 = s(
  'Qd6',
  'Retreat while watching the d-file',
  'Keep the queen close to the center on d6.',
  'The queen watches the d-file and can pressure a future pawn on d4 through d5. It may need another move if White gains a tempo against it, so develop your pieces promptly.',
  'Retreat the queen one square up the d-file.',
);
const queenD8 = s(
  'Qd8',
  'Return to a secure starting square',
  'Bring the queen home and let the minor pieces develop.',
  'You give up the queen’s central activity, but White will find it harder to gain further tempos against her. The open c8 bishop diagonal remains an important benefit of the early pawn exchange.',
  'Retreat the queen all the way back along the open d-file.',
);
const whiteD4 = s(
  'd4',
  'White claims more central space',
  'White advances the queen pawn and opens the c1 bishop.',
  'White’s e-pawn has left the e-file, while the d4 pawn provides a central foothold. In the Qa5 lines this also clears d2, making the queen’s diagonal toward e1 more important.',
  'White advances the queen pawn two squares.',
);
const blackNf6 = s(
  'Nf6',
  'Develop toward the central squares',
  'Bring out the kingside knight and prepare king safety.',
  'The knight controls e4 and d5, useful squares in the open center. It clears g8 for castling, although your f8 bishop still needs to develop.',
  'Develop the kingside knight toward e4 and d5.',
);
const whiteNf3 = s(
  'Nf3',
  'White supports d4 while developing',
  'White brings out the kingside knight.',
  'The knight protects d4 and controls e5 and g5. White clears g1 for castling while keeping the central pawn defended.',
  'White develops the kingside knight to support the queen pawn.',
);
const bishopF5 = s(
  'Bf5',
  'Use the freed bishop diagonal',
  'Develop the c8 bishop to an active square.',
  'The exchanged d-pawn has cleared d7, and e6 is still empty. Your bishop can reach f5 before an e6 pawn move restricts the diagonal, influencing e4 and d3.',
  'Develop the c8 bishop through d7 and e6 before closing that route.',
);
const bishopG4 = s(
  'Bg4',
  'Pin a defender of the center',
  'Develop the c8 bishop with pressure on the f3 knight.',
  'The diagonal g4–f3–e2–d1 reaches White’s queen because the e-pawn has left e2. The f3 knight must account for that relative pin before moving.',
  'Develop the light-squared bishop to pin f3 against the queen.',
);
const whiteBe2 = s(
  'Be2',
  'White breaks the line to the queen',
  'White places the f1 bishop on e2.',
  'The bishop stands between the f3 knight and queen on the diagonal from g4. White also clears f1 for castling, answering the pressure with normal development.',
  'White develops the kingside bishop between the queen and the g4 diagonal.',
);
const blackE6 = s(
  'e6',
  'Release the dark-squared bishop',
  'Open the f8 bishop’s diagonal with a compact pawn move.',
  'The e6 pawn controls d5 and f5 and clears e7 for the bishop. Your light-squared bishop has already developed, so this move does not shut it inside the pawn chain.',
  'Move the e-pawn one square to free the f8 bishop.',
);
const modernKnight = s(
  'Nf6',
  'Develop before recovering the pawn',
  'Attack the pawn on d5 with the kingside knight.',
  'You avoid exposing the queen to Nc3. White may try to keep the extra pawn, but doing so costs time and can give you opportunities to develop with threats.',
  'Attack the advanced d5 pawn with the kingside knight.',
);
const modernStart: LessonMove[] = [...start, modernKnight];
const knightCapture = s(
  'Nxd5',
  'Recover the pawn with a piece',
  'Capture White’s advanced pawn with the f6 knight.',
  'You restore material and centralize the knight without bringing out the queen. White can chase this knight with c4 or attack it with a bishop, so remain ready to relocate it.',
  'Your developed knight can now recover the pawn on d5.',
);
const whiteBc4 = s(
  'Bc4',
  'White uses the open bishop diagonal',
  'White develops the f1 bishop actively.',
  'The bishop on c4 points along d5, e6, and f7. If d5 is occupied by your knight, that knight is attacked first; do not treat the farther f7 pawn as the only concern.',
  'White develops the kingside bishop toward the d5–f7 diagonal.',
);

export const scandinavianVariations: Variation[] = [
  v(
    'scandinavian-classical',
    'Classical Variation',
    'Keep the queen useful on a5 and develop the light-squared bishop before e6.',
    [
      ...queenStart,
      queenA5,
      whiteD4,
      blackNf6,
      whiteNf3,
      bishopF5,
      s(
        'Bd2',
        'White shields the diagonal to the king',
        'White develops the c1 bishop behind the c3 knight.',
        'The bishop on d2 interrupts the queen’s diagonal toward e1. The c3 knight can move without directly exposing the king, and White develops another piece.',
        'White puts the queenside bishop on the queen’s diagonal toward e1.',
      ),
      s(
        'c6',
        'Give the queen a retreat route',
        'Build a compact queenside structure and clear c7.',
        'The pawn controls d5 and b5. Vacating c7 gives your queen another potential retreat along the diagonal from a5 through b6, while the c8 bishop is already active.',
        'Move the c-pawn one square to control d5 and clear c7.',
      ),
    ],
  ),
  v(
    'scandinavian-lasker',
    'Lasker Variation',
    'Use a bishop pin, then exchange when White challenges the bishop.',
    [
      ...queenStart,
      queenA5,
      whiteD4,
      blackNf6,
      whiteNf3,
      bishopG4,
      s(
        'h3',
        'White questions the pinning bishop',
        'White attacks the g4 bishop with the h-pawn.',
        'The pawn asks whether you will retreat or exchange for the knight. Trading removes a defender of d4, while retreating would preserve your bishop pair.',
        'White advances the h-pawn one square against your bishop.',
      ),
      s(
        'Bxf3',
        'Remove a central defender',
        'Exchange the bishop for White’s f3 knight.',
        'The knight helped defend d4 and control e5. You accept losing the bishop pair to remove it; White can recapture with the queen or the g2 pawn, choosing whether to preserve the kingside pawn structure.',
        'Your attacked bishop can capture the knight it has pinned.',
      ),
    ],
  ),
  v(
    'scandinavian-bronstein',
    'Bronstein Variation',
    'Use the Qd6 setup with a6 to prepare queenside development and expansion.',
    [
      ...queenStart,
      queenD6,
      whiteD4,
      blackNf6,
      whiteNf3,
      s(
        'a6',
        'Keep pieces away from b5',
        'Control b5 with the a-pawn.',
        'The pawn discourages a White knight or bishop from landing on b5 and supports a possible later b5 advance. It is useful preparation, but does not replace developing your queenside pieces.',
        'Advance the a-pawn one square to control b5.',
      ),
      s(
        'Bd3',
        'White clears the castling path',
        'White develops the f1 bishop toward the kingside.',
        'The bishop points through e4, f5, and g6 toward h7. White has now developed both kingside pieces and can castle soon.',
        'White develops the kingside bishop onto the diagonal toward h7.',
      ),
      s(
        'Nc6',
        'Put another piece against d4',
        'Develop the queenside knight toward the center.',
        'The knight on c6 attacks d4 and controls e5. Your queen on d6 also watches d4 down the open d-file, so White must keep the central pawn protected.',
        'Develop the queenside knight to add pressure to d4.',
      ),
    ],
  ),
  v(
    'scandinavian-schiller-pytel',
    'Schiller-Pytel Variation',
    'Support the center from c6 and develop the bishop outside the future pawn chain.',
    [
      ...queenStart,
      queenD6,
      whiteD4,
      s(
        'c6',
        'Control d5 from a compact base',
        'Use the c-pawn to control the central d5 square.',
        'The c6 pawn controls b5 and d5, limiting White’s knight jumps. It also clears c7 as a possible queen retreat, though it takes c6 away from your queenside knight.',
        'Move the c-pawn one square to control d5.',
      ),
      whiteNf3,
      blackNf6,
      whiteBc4,
      bishopF5,
    ],
  ),
  v(
    'scandinavian-valencian-main',
    'Valencian: Main Line',
    'Bring the queen home, then recover development time through a useful bishop pin.',
    [...queenStart, queenD8, whiteD4, blackNf6, whiteNf3, bishopG4, whiteBe2, blackE6],
  ),
  v(
    'scandinavian-ilundain',
    'Valencian: Ilundain Variation',
    'Choose Qd8 and c6, keeping the light-squared bishop outside the pawn chain.',
    [
      ...queenStart,
      queenD8,
      whiteD4,
      blackNf6,
      whiteNf3,
      s(
        'c6',
        'Reserve d5 and b5 for your pieces',
        'Control central and queenside squares with the c-pawn.',
        'The c6 pawn controls d5 and b5, limiting White’s jumps. Your queen is already safe on d8, so you can develop the c8 bishop before committing the e-pawn.',
        'Build the c6 structure before choosing the e-pawn’s move.',
      ),
      whiteBc4,
      bishopF5,
    ],
  ),
  v(
    'scandinavian-gipslis',
    'Modern: Gipslis Variation',
    'Recover the pawn with a knight, pin f3, and finish kingside development.',
    [
      ...modernStart,
      whiteD4,
      knightCapture,
      whiteNf3,
      bishopG4,
      whiteBe2,
      blackE6,
      s(
        'O-O',
        'White completes king safety',
        'White castles behind the kingside pawns.',
        'The king leaves the center and the rook reaches f1. White can now focus on central play, so you should complete your own kingside development.',
        'White castles on the kingside.',
      ),
      s(
        'Bd6',
        'Clear the last castling square',
        'Develop the f8 bishop along the diagonal opened by e6.',
        'The bishop controls e5 and points toward h2. With your kingside knight already on d5, moving the bishop leaves both f8 and g8 empty for future castling.',
        'Develop the f8 bishop toward the center and prepare to castle.',
      ),
    ],
  ),
  v(
    'scandinavian-richter',
    'Richter Variation',
    'Pair a central knight with a fianchetto and secure the king early.',
    [
      ...modernStart,
      whiteD4,
      knightCapture,
      whiteNf3,
      s(
        'g6',
        'Prepare a bishop on the long diagonal',
        'Make g7 available for the f8 bishop.',
        'The bishop can influence d4 through f6 and e5 once it reaches g7. Your kingside knight has moved to d5, so it will not block that diagonal from f6.',
        'Advance the g-pawn one square to prepare the fianchetto.',
      ),
      whiteBc4,
      s(
        'Bg7',
        'Develop with pressure on d4',
        'Place the bishop on its prepared diagonal.',
        'The diagonal g7–f6–e5–d4 reaches White’s central pawn. Your knight on d5 is attacked by the c4 bishop, but the queen on d8 protects it along the open d-file.',
        'Put the f8 bishop on g7 and use the long diagonal.',
      ),
      s(
        'O-O',
        'White leaves the center',
        'White castles and brings the rook to f1.',
        'White has developed the kingside pieces and keeps d4 supported by the f3 knight. The next phase will be about central pressure rather than an exposed king.',
        'White castles on the kingside.',
      ),
      s(
        'O-O',
        'Secure your king behind the fianchetto',
        'Castle while your bishop and knight are active.',
        'The knight has left g8 and the bishop has left f8, clearing the castling path. King safety lets you handle future challenges to the d5 knight without leaving the king in the center.',
        'Your kingside pieces have moved. Castle now.',
      ),
    ],
  ),
  v(
    'scandinavian-icelandic-palme',
    'Icelandic-Palme Gambit',
    'Offer a pawn to gain active bishops and rapid central development.',
    [
      ...modernStart,
      s(
        'c4',
        'White tries to hold the extra pawn',
        'White protects d5 with the c-pawn.',
        'The pawn on c4 supports the advanced pawn on d5, making an immediate knight capture unsuitable. This pawn move gains space but delays White’s piece development.',
        'White advances the c-pawn two squares to support d5.',
      ),
      s(
        'e6',
        'Offer a second central pawn for activity',
        'Challenge the advanced d5 pawn with the e-pawn.',
        'If White captures on e6, your c8 bishop can recapture along the cleared diagonal. You will remain a pawn down, so the compensation is quicker development and open lines, not a free material recovery.',
        'Attack d5 with the e-pawn and open a route for the c8 bishop.',
      ),
      s(
        'dxe6',
        'White accepts the gambit',
        'White’s advanced pawn captures your e6 pawn.',
        'White gains another pawn temporarily, but the e6 pawn is now exposed to your bishop. Capturing it will activate a piece instead of bringing out the queen.',
        'White’s pawn on d5 captures the pawn that challenged it.',
      ),
      s(
        'Bxe6',
        'Develop by recovering the advanced pawn',
        'Capture on e6 with the c8 bishop.',
        'The bishop develops through d7 and takes the advanced pawn. White still has an extra pawn overall, while your active bishop and knight give you time to build central pressure.',
        'Use the c8 bishop to recapture through the empty d7 square.',
      ),
      s(
        'Nf3',
        'White prepares a supported d4 advance',
        'White develops the kingside knight toward the center.',
        'The knight controls d4, e5, and g5 and clears g1 for castling. White can use its protection of d4 to build a central pawn foothold on the next move.',
        'White develops the kingside knight before advancing the d-pawn.',
      ),
      s(
        'Nc6',
        'Develop against the central squares',
        'Bring the queenside knight to c6.',
        'The knight controls d4 and e5. White has not yet advanced the d-pawn, so these squares help you contest the center as White completes development.',
        'Develop the queenside knight toward d4 and e5.',
      ),
      whiteD4,
      s(
        'Qe7',
        'Coordinate the queen and active bishop',
        'Move the queen behind the bishop on the e-file.',
        'The queen protects your bishop on e6 and leaves d8 free. With the c8 bishop and b8 knight developed, you can consider queenside castling after checking the squares the king would cross.',
        'Place the queen on the square your e-pawn vacated to support the e6 bishop.',
      ),
    ],
  ),
  v(
    'scandinavian-portuguese-elbow',
    'Portuguese: Elbow Variation',
    'Answer the checking bishop with c6, then recover the center while developing.',
    [
      ...modernStart,
      whiteD4,
      s(
        'Bg4',
        'Develop with a threat against the queen',
        'Bring the c8 bishop onto the diagonal to d1.',
        'With f3 and e2 empty, your bishop attacks White’s queen along g4–f3–e2–d1. White must block that diagonal, move the queen, or use a forcing check.',
        'Use the light-squared bishop’s open diagonal to create a queen threat.',
      ),
      s(
        'Bb5+',
        'White interrupts the threat with check',
        'White develops the f1 bishop with check on e8.',
        'The diagonal from b5 through c6 and d7 reaches your king. A check must be answered before you can carry out the threat against White’s queen.',
        'White gives check with the kingside bishop on the queenside diagonal.',
      ),
      s(
        'c6',
        'Block the check and challenge d5',
        'Interpose the c-pawn on the bishop’s diagonal.',
        'The c6 pawn blocks b5–e8 and attacks White’s advanced pawn on d5. You answer the check with a move that also helps recover the central pawn.',
        'Block the checking diagonal with the c-pawn, attacking d5 at the same time.',
      ),
      s(
        'Be2',
        'White answers the queen threat',
        'White retreats the bishop to block the diagonal from g4.',
        'The bishop on e2 stands between your g4 bishop and the queen on d1. White chooses to secure the queen instead of trying to keep the extra pawn on d5.',
        'White moves the checking bishop back to shield the queen.',
      ),
      s(
        'cxd5',
        'Restore material in the center',
        'Capture the advanced d5 pawn with your c-pawn.',
        'You regain the pawn and keep a central foothold. Vacating c6 also makes the natural developing square available for your queenside knight.',
        'Use the pawn that blocked the check to capture on d5.',
      ),
      whiteNf3,
      s(
        'Nc6',
        'Use the newly freed knight square',
        'Develop the queenside knight with pressure on d4.',
        'The knight attacks White’s d4 pawn and controls e5. Your c-pawn on d5 and active pieces give you a central plan while the queen remains at home.',
        'Develop the queenside knight onto the square the c-pawn vacated.',
      ),
    ],
  ),
];
