import type { LessonMove, Variation } from '../types';
import { step, variation } from './shared';

// Names and defining positions: lichess-org/chess-openings, b.tsv (B22–B90).
// Each lesson is a short Black repertoire, with original strategic annotations.
const start: LessonMove[] = [
  step(
    'e4',
    'White claims central space',
    'White opens lines for the queen and kingside bishop.',
    'The pawn controls d5 and f5. Black can challenge White’s center from the flank instead of copying the move with e5.',
    'White starts by advancing the king pawn two squares.',
  ),
  step(
    'c5',
    'Challenge the center from the flank',
    'Your c-pawn controls d4 and creates an asymmetric position.',
    'If White plays d4, your c-pawn can trade for a central pawn. You keep your d- and e-pawns, and the exchange can open the c-file for a rook.',
    'Advance your c-pawn two squares to contest d4.',
  ),
  step(
    'Nf3',
    'White develops toward the center',
    'White brings out a knight and prepares the d4 advance.',
    'The knight controls d4 and can recapture there after your c-pawn takes. White also clears g1 for eventual castling.',
    'White develops the kingside knight to f3.',
  ),
];

const d6 = step(
  'd6',
  'Keep e5 under control',
  'Your queen pawn controls e5 and opens a diagonal for the c8 bishop.',
  'Controlling e5 makes it harder for White to push the e-pawn forward and chase a knight on f6. This flexible pawn move lets you choose between several Sicilian setups.',
  'Move the queen pawn one square to guard e5.',
);
const e6 = step(
  'e6',
  'Build a flexible central base',
  'Your king pawn guards d5 and opens the f8 bishop’s diagonal.',
  'You can later develop the bishop to e7 or b4, and a future d5 break may challenge White’s center. The c8 bishop will need another route because e6 blocks its original diagonal.',
  'Move the king pawn one square to control d5.',
);
const nc6 = step(
  'Nc6',
  'Put a knight near the action',
  'Your queenside knight controls d4 and e5.',
  'A knight on c6 adds pressure to the center without deciding where the e-pawn belongs. In open lines it also attacks a White knight on d4.',
  'Develop the b8 knight toward the central d4 square.',
);
const nf6 = step(
  'Nf6',
  'Ask White to protect e4',
  'Your kingside knight attacks the e4 pawn and clears g8 for castling.',
  'Developing with a threat encourages White to defend the center. The knight also controls d5; before moving it, make sure a White e5 advance cannot simply chase it away without a response.',
  'Develop your kingside knight so it attacks e4.',
);
const whiteNc3 = step(
  'Nc3',
  'White reinforces the center',
  'White’s second knight defends e4 and controls d5.',
  'This keeps the e4 pawn secure against a knight on f6 and puts another piece near the center. Your next move will define the kind of Sicilian you are building.',
  'White develops the b1 knight to support e4.',
);
const openExchange: LessonMove[] = [
  step(
    'd4',
    'White opens the center',
    'White offers an exchange to gain active piece play.',
    'If you capture, White’s f3 knight can recapture on d4. White accepts a pawn trade to put a knight on a strong central square and open lines for development.',
    'White advances the queen pawn two squares.',
  ),
  step(
    'cxd4',
    'Trade a flank pawn for a center pawn',
    'Your c-pawn captures White’s d-pawn.',
    'Removing the d-pawn reduces White’s central pawn presence. The c-file loses your pawn, giving your rook a potential lane once development is complete.',
    'Capture the pawn on d4 with your c-pawn.',
  ),
  step(
    'Nxd4',
    'White recaptures actively',
    'The f3 knight takes back on d4.',
    'White restores material balance and places a knight in the center. Your development can now combine pressure on this knight with pressure on the e4 pawn.',
    'White recaptures on d4 with the knight from f3.',
  ),
];
const openD6: LessonMove[] = [...start, d6, ...openExchange, nf6, whiteNc3];
const openE6: LessonMove[] = [...start, e6, ...openExchange];
const openNc6: LessonMove[] = [...start, nc6, ...openExchange];
const whiteBe3 = step(
  'Be3',
  'White supports the central knight',
  'White develops the c1 bishop and protects d4.',
  'The bishop can support the knight on d4 and coordinate with the queen on d2. Depending on the pawn setup, White may choose kingside or queenside castling later.',
  'White develops the queenside bishop to e3.',
);
const whiteBe2 = step(
  'Be2',
  'White prepares to castle safely',
  'White develops the kingside bishop without committing to an early attack.',
  'The bishop clears f1, so White can castle kingside. This quieter setup keeps the king secure while White decides how to use the space advantage.',
  'White brings the f1 bishop one diagonal step to e2.',
);
const blackG6 = step(
  'g6',
  'Prepare your long-diagonal bishop',
  'Your g-pawn makes room for the bishop on g7.',
  'A bishop on g7 will aim toward the central d4 square and the queenside. This setup also changes the dark squares around your king, so protecting the bishop and king matters.',
  'Move your g-pawn one square to prepare a fianchetto.',
);
const blackBg7 = step(
  'Bg7',
  'Give the bishop a long view',
  'Your kingside bishop enters the a1–h8 diagonal.',
  'From g7 the bishop can influence d4 when the diagonal clears. Developing it also vacates f8, bringing kingside castling closer.',
  'Place the f8 bishop behind the pawn you moved to g6.',
);
const blackCastle = step(
  'O-O',
  'Put the king behind its pawns',
  'Castle kingside and bring the rook toward the center.',
  'Your king moves away from the open central files. The rook on f8 can later support central or kingside play; castling is preparation, not a reason to stop watching White’s threats.',
  'Castle on the kingside.',
);

export const sicilianVariations: Variation[] = [
  variation(
    'sicilian-najdorf',
    'Najdorf Variation',
    'Use a6 to control b5, then challenge the center with e5.',
    [
      ...openD6,
      step(
        'a6',
        'Take b5 away from White',
        'Your a-pawn prevents a White bishop or knight from settling on b5.',
        'The Najdorf keeps your queenside knight flexible and prepares possible b5 expansion. This is a useful waiting move because White’s setup helps you choose the right central plan.',
        'Advance your a-pawn one square to control b5.',
      ),
      whiteBe3,
      step(
        'e5',
        'Gain space and challenge the knight',
        'Your king pawn attacks the knight on d4.',
        'With d6 supporting e5, you gain central space and make the knight choose a new square. The cost is a weaker d5 square: neither your d6 pawn nor your e5 pawn can control it.',
        'Advance the e-pawn two squares to attack the d4 knight.',
      ),
    ],
  ),
  variation(
    'sicilian-dragon',
    'Dragon Variation',
    'Fianchetto the bishop and prepare for White’s Yugoslav setup.',
    [
      ...openD6,
      blackG6,
      whiteBe3,
      blackBg7,
      step(
        'f3',
        'White builds a base for an attack',
        'White supports e4 and keeps your knight out of g4.',
        'The f3 pawn helps protect e4 and the bishop on e3 from a knight jump to g4. White may later use Qd2 and queenside castling, so you must prepare active counterplay rather than wait passively.',
        'White advances the f-pawn one square to support e4.',
      ),
      blackCastle,
    ],
  ),
  variation(
    'sicilian-classical',
    'Classical Variation',
    'Develop both knights, then meet the bishop pin with e6.',
    [
      ...openD6,
      nc6,
      step(
        'Bg5',
        'White adds pressure to f6',
        'White develops the c1 bishop and prepares a pin against your f6 knight.',
        'The diagonal g5–f6–e7–d8 contains your knight, pawn, and queen. The knight is not yet directly pinned because e7 is occupied; after you move that pawn, the bishop can create a relative pin to the queen.',
        'White develops the queenside bishop to g5.',
      ),
      step(
        'e6',
        'Strengthen d5 and free the bishop',
        'Your e-pawn guards d5 and lets the f8 bishop develop.',
        'This is a standard response to the Richter–Rauzer setup. Be7 can later break the relative pin on your f6 knight by blocking the bishop’s line to your queen, while d6 and e6 provide a compact base for your central pieces.',
        'Move the e-pawn one square to support d5 and prepare Be7.',
      ),
    ],
  ),
  variation(
    'sicilian-scheveningen',
    'Scheveningen Variation',
    'Build the d6–e6 center and complete kingside development.',
    [
      ...openD6,
      step(
        'e6',
        'Build the small center',
        'Your pawns on d6 and e6 form the Scheveningen structure.',
        'They control important central squares while keeping the position flexible. You may seek a d5 or e5 break later, but White has more space and you still need to finish development.',
        'Add an e-pawn on the sixth rank beside d6.',
      ),
      whiteBe2,
      step(
        'Be7',
        'Prepare a sheltered king',
        'Your bishop develops behind the central pawns.',
        'The bishop clears f8 for castling without exposing itself to an immediate pawn chase. A compact setup works best when you remain ready to challenge the center at the right moment.',
        'Develop the f8 bishop to the square cleared by e6.',
      ),
    ],
  ),
  variation(
    'sicilian-sveshnikov',
    'Sveshnikov Variation',
    'Accept a d5 weakness in return for central space and active queenside play.',
    [
      ...openNc6,
      nf6,
      whiteNc3,
      step(
        'e5',
        'Push the central knight away',
        'Your e-pawn gains space and attacks the knight on d4.',
        'This creates a hole on d5 and leaves d6 available as a potential backward pawn. The Sveshnikov accepts these structural costs in return for active pieces and useful pawn advances.',
        'Advance the king pawn two squares to challenge d4.',
      ),
      step(
        'Ndb5',
        'White eyes the d6 square',
        'White’s d4 knight jumps to b5 and puts pressure on d6.',
        'From b5 the knight can target d6 and c7. White also preserves the knight on c3, which helps control d5 and defend e4.',
        'White moves the knight from d4 to b5.',
      ),
      step(
        'd6',
        'Support the advanced e-pawn',
        'Your d-pawn reinforces e5 and becomes a target on d6, defended by your queen.',
        'You accept a pawn on d6 that needs protection. The immediate priority is keeping e5 secure while preparing to chase the knight from b5.',
        'Move the queen pawn one square to support e5.',
      ),
      step(
        'Bg5',
        'White threatens to remove a defender',
        'White’s bishop puts pressure on the f6 knight.',
        'The f6 knight helps control d5. Exchanging it can make that square more useful to White, so your queenside activity needs to provide compensation.',
        'White brings the c1 bishop to g5.',
      ),
      step(
        'a6',
        'Ask the advanced knight to retreat',
        'Your a-pawn attacks the knight on b5.',
        'The knight must respond to a direct pawn threat. You also prepare b5, gaining queenside space and taking c4 away from White’s pieces.',
        'Push the a-pawn one square to attack b5.',
      ),
      step(
        'Na3',
        'White keeps the knight available',
        'The b5 knight retreats to a3.',
        'The knight avoids capture but needs time to find a better route. That gives Black a chance to expand on the queenside while White reorganizes.',
        'White retreats the attacked knight to a3.',
      ),
      step(
        'b5',
        'Use the time to gain space',
        'Your b-pawn advances and controls c4.',
        'The a6 pawn supports b5. This advance can help the c8 bishop develop to b7 and restrict White’s queenside pieces, balancing the enduring weakness of d5.',
        'Advance the b-pawn two squares with support from a6.',
      ),
    ],
  ),
  variation(
    'sicilian-taimanov',
    'Taimanov Variation',
    'Combine e6, Nc6, and Qc7 before expanding with a6.',
    [
      ...openE6,
      nc6,
      whiteNc3,
      step(
        'Qc7',
        'Support the center from c7',
        'Your queen supports the c6 knight and watches the c-file.',
        'On c7 the queen helps coordinate a future d5 or e5 break. You keep the f8 bishop flexible and delay committing the d-pawn; watch for White knight jumps to b5 that may attack the queen.',
        'Move your queen to c7, behind the semi-open c-file for Black.',
      ),
      whiteBe3,
      step(
        'a6',
        'Remove the b5 jump',
        'Your a-pawn controls a square from which a knight could attack c7.',
        'The queen on c7 makes b5 particularly sensitive. Controlling it with a6 gives your queen more security and prepares possible b5 queenside expansion.',
        'Use your a-pawn to keep a knight away from b5.',
      ),
    ],
  ),
  variation(
    'sicilian-kan',
    'Kan Variation',
    'Keep the queenside knight flexible while developing behind e6 and a6.',
    [
      ...openE6,
      step(
        'a6',
        'Keep your next development choice open',
        'Your a-pawn controls b5 while the queenside knight stays home.',
        'Unlike the Taimanov, you have not committed the b8 knight to c6. It may later use c6 or d7 depending on White’s setup; a6 also supports a future b5 advance.',
        'Advance the a-pawn one square before developing the b8 knight.',
      ),
      step(
        'Bd3',
        'White reinforces e4 with a bishop',
        'White develops the f1 bishop to d3.',
        'The bishop supports e4 along the d3–e4 diagonal and clears the way for castling. White keeps the b1 knight flexible, so you should avoid assuming it will appear on c3 immediately.',
        'White places the kingside bishop on d3.',
      ),
      nf6,
      step(
        'O-O',
        'White secures the king',
        'White castles after developing the kingside pieces.',
        'The king leaves the central files, and the f1 rook can later join play. With White safely developed, you should complete your own setup before launching a flank attack.',
        'White castles kingside.',
      ),
      step(
        'd6',
        'Support e5 before White advances',
        'Your d-pawn controls e5 and frees the c8 bishop.',
        'The pawn makes an e5 advance by White less comfortable for your f6 knight. It also creates the familiar d6–e6 base while you decide how to develop your remaining pieces.',
        'Move the queen pawn one square to restrain e5.',
      ),
    ],
  ),
  variation(
    'sicilian-accelerated-dragon',
    'Accelerated Dragon',
    'Fianchetto early while preserving the option of a direct d5 break.',
    [
      ...openNc6,
      blackG6,
      whiteNc3,
      blackBg7,
      whiteBe3,
      step(
        'Nf6',
        'Develop without committing the d-pawn',
        'Your knight attacks e4 while the d7 pawn stays on its starting square.',
        'The Accelerated Dragon can sometimes play d5 in one move instead of first spending a move on d6. That break requires preparation and calculation; it is an option created by the move order, not an automatic move.',
        'Develop the kingside knight toward e4, leaving d7 untouched.',
      ),
    ],
  ),
  variation(
    'sicilian-rossolimo',
    'Rossolimo Attack',
    'Meet Bb5 with a fianchetto and understand the doubled c-pawns.',
    [
      ...start,
      nc6,
      step(
        'Bb5',
        'White changes the nature of the game',
        'White attacks your c6 knight instead of opening with d4.',
        'An exchange on c6 could damage your pawn structure. White develops actively while avoiding the main Open Sicilian; decide how to support your center rather than memorize the wrong branch.',
        'White develops the f1 bishop to attack the knight on c6.',
      ),
      blackG6,
      step(
        'O-O',
        'White prioritizes king safety',
        'White castles while keeping the pressure on c6.',
        'The bishop on b5 and knight on f3 have cleared the kingside. White can now choose whether to exchange on c6 or build a center with c3 and d4.',
        'White castles kingside.',
      ),
      blackBg7,
      step(
        'Bxc6',
        'White trades for a structural target',
        'The bishop captures your c6 knight.',
        'White gives up the bishop pair to create doubled pawns after your recapture. The lesson is a tradeoff: structural damage does not automatically outweigh the long-term value of two bishops.',
        'White captures the knight on c6 with the b5 bishop.',
      ),
      step(
        'dxc6',
        'Recapture and gain a semi-open d-file',
        'Your d-pawn takes the bishop and becomes a second c-pawn.',
        'The pawns on c5 and c6 are doubled, but you retain both bishops and gain a semi-open d-file for Black; White’s pawn remains on d2. The recapture also clears a diagonal for the c8 bishop.',
        'Recapture on c6 with the pawn from d7.',
      ),
      step(
        'Re1',
        'White adds support to e4',
        'White centralizes the rook from f1.',
        'The rook supports the e4 pawn along the e-file. This helps White meet pressure from your kingside knight and prepares later central play.',
        'White moves the castled rook from f1 to e1.',
      ),
      nf6,
    ],
  ),
  variation(
    'sicilian-alapin',
    'Alapin Variation',
    'Challenge c3 immediately with d5, then develop against the central structure.',
    [
      ...start.slice(0, 2),
      step(
        'c3',
        'White prepares a pawn recapture',
        'White supports d4 with the c-pawn.',
        'After d4 and a capture on d4, the c-pawn can recapture and maintain a central pawn presence. The price is that c3 is temporarily unavailable to White’s queenside knight.',
        'White advances the c-pawn one square to support d4.',
      ),
      step(
        'd5',
        'Challenge the center before it grows',
        'Your d-pawn attacks e4 immediately.',
        'White’s c3 pawn blocks the normal Nc3 development, so bringing the queen out after an exchange is less vulnerable to an immediate knight attack. You challenge White before a broad pawn center is established.',
        'Push the queen pawn two squares to attack e4.',
      ),
      step(
        'exd5',
        'White releases the central tension',
        'White’s e-pawn captures on d5.',
        'The trade leaves a semi-open e-file for White, with Black’s pawn still on e7, and gives your queen a recapture. White can still seek a central pawn presence with d4, so the struggle for the center continues.',
        'White captures your d5 pawn with the pawn from e4.',
      ),
      step(
        'Qxd5',
        'Restore material and keep central pressure',
        'Your queen recaptures on d5.',
        'An early queen move is possible here because c3 prevents White from immediately playing Nc3. Still develop your pieces promptly: once that pawn leaves c3, the queen may need to move again.',
        'Recapture the pawn on d5 with your queen.',
      ),
      step(
        'd4',
        'White builds the planned center',
        'White advances the queen pawn with support from c3.',
        'If you exchange on d4, the c3 pawn can replace it. White gains central activity, but the resulting pawn may become isolated if the c-pawn is the only central pawn left.',
        'White advances the queen pawn two squares.',
      ),
      step(
        'cxd4',
        'Clarify the pawn structure',
        'Your c-pawn captures the pawn on d4.',
        'The exchange removes White’s original d-pawn and invites a c-pawn recapture. This makes the future targets in the center easier to identify.',
        'Capture on d4 with the pawn from c5.',
      ),
      step(
        'cxd4',
        'White restores the center',
        'White’s c-pawn recaptures on d4.',
        'The d4 pawn is now isolated because White has no c- or e-pawn beside it. It gives White space and open lines, but you can aim to blockade or pressure it later.',
        'White recaptures on d4 with the pawn from c3.',
      ),
      nc6,
      step(
        'Nf3',
        'White develops and supports d4',
        'White brings out the kingside knight.',
        'The knight defends d4 and controls e5. White uses piece activity to support the isolated pawn, rather than trying to defend it with another pawn.',
        'White develops the g1 knight to f3.',
      ),
      step(
        'Bg4',
        'Put pressure on a central defender',
        'Your c8 bishop develops and pins the f3 knight to the queen.',
        'The diagonal g4–f3–e2–d1 is open behind the knight. This relative pin makes the knight’s defense of d4 less convenient, although White can break the pin by moving the queen or challenging the bishop.',
        'Develop your queenside bishop to g4 to pressure the f3 knight.',
      ),
    ],
  ),
];
