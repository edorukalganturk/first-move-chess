import type { LessonMove, Variation } from '../types';
import { step, variation } from './shared';

const italianFoundation: LessonMove[] = [
  {
    san: 'e4',
    title: 'Take your place in the center',
    explanation: 'Your king pawn claims central space and opens a path for your bishop.',
    why: 'A pawn on e4 controls d5 and f5. It also frees your queen and the bishop on f1, so you can develop quickly. In an open game, central space and active pieces work together.',
    hint: 'Start with your king pawn. Give it two squares of central space.',
  },
  {
    san: 'e5',
    title: 'Black meets you in the center',
    explanation: 'Black matches your central presence and opens lines for development.',
    why: 'The pawn on e5 controls d4 and f4, making it harder for you to build a big center unchallenged. Both sides can now develop their kingside pieces and prepare to castle.',
    hint: 'Black mirrors your first central pawn move.',
  },
  {
    san: 'Nf3',
    title: 'Develop with a purpose',
    explanation: 'Bring out your knight, attack the e5 pawn, and move one step closer to castling.',
    why: 'The knight on f3 puts pressure on e5 while controlling d4 and h4. You develop a piece and ask Black a question at the same time. Moving this knight also clears one of the squares needed for kingside castling.',
    hint: 'Develop your kingside knight to a square that attacks Black’s central pawn.',
  },
  {
    san: 'Nc6',
    title: 'Black protects the center',
    explanation: 'Black develops a knight and defends the pawn you just attacked.',
    why: 'The knight on c6 supports e5 and controls the important d4 square. Black keeps the central pawn secure without spending a move on a passive pawn defense.',
    hint: 'Black’s queenside knight comes out to defend e5.',
  },
  {
    san: 'Bc4',
    title: 'Point your bishop at f7',
    explanation: 'Your bishop takes an active diagonal and looks toward Black’s king.',
    why: 'From c4, your bishop eyes f7, a pawn defended only by Black’s king at the start. That creates useful pressure, but it is not an invitation to attack too early. You have also cleared f1, so castling is now available.',
    hint: 'Place your kingside bishop on the diagonal that points toward f7.',
  },
  {
    san: 'Bc5',
    title: 'The quiet game begins',
    explanation: 'Black develops an active bishop. This is the Giuoco Piano, or “quiet game.”',
    why: 'The bishop on c5 puts pressure on your f2 pawn and helps Black prepare to castle. Both sides now have active minor pieces. Your next choice is about the kind of center you want to build.',
    hint: 'Black’s kingside bishop mirrors the active setup on the c-file.',
  },
];

const blackKnightDevelopment: LessonMove = {
  san: 'Nf6',
  title: 'Black challenges e4',
  explanation: 'Black develops the kingside knight and attacks your central pawn.',
  why: 'The knight on f6 attacks e4 and clears the way for Black to castle. Watch that pawn as you continue developing: opening plans work best when you also notice the threats your opponent creates.',
  hint: 'Black develops the kingside knight toward your e4 pawn.',
};

const giuocoPiano: Variation = {
  id: 'giuoco-piano',
  name: 'Giuoco Piano',
  description: 'Develop naturally, then prepare a strong pawn center with c3 and d4.',
  moves: [
    ...italianFoundation,
    {
      san: 'c3',
      title: 'Prepare your next central step',
      explanation: 'Support a future d4 advance so your pawns can challenge Black’s center.',
      why: 'The c3 pawn supports d4. If you later play d4 and Black captures with the e5 pawn, your c-pawn can recapture toward the center. The tradeoff is that c3 temporarily takes a natural square away from your queenside knight.',
      hint: 'Which pawn can support a future advance to d4? Move it one square.',
    },
    blackKnightDevelopment,
  ],
};

const giuocoPianissimo: Variation = {
  id: 'giuoco-pianissimo',
  name: 'Giuoco Pianissimo',
  description: 'Choose a slower center with d3 and develop your pieces before opening the game.',
  moves: [
    ...italianFoundation,
    {
      san: 'd3',
      title: 'Give your center a steady base',
      explanation: 'Support the e4 pawn and choose a quieter, more patient setup.',
      why: 'The pawn on d3 protects e4 and opens a diagonal for your queenside bishop. Compared with c3 and an early d4, this approach keeps the center more stable. You can castle and improve your pieces before deciding when to push d4.',
      hint: 'Support e4 with your queen pawn. A single square is enough.',
    },
    blackKnightDevelopment,
  ],
};

// Names and defining positions: lichess-org/chess-openings, ECO C50–C58.
// The two original introductory lines retain their IDs and length for saved progress.
const twoKnights = [...italianFoundation.slice(0, 5), blackKnightDevelopment];
const centralAdvance = step(
  'd4',
  'Challenge the center now',
  'Your queen pawn attacks e5 and opens the diagonal for your other bishop.',
  'The c3 pawn supports d4, so an exchange on d4 can be answered by cxd4. You seek two central pawns and active development, but must watch Black’s forcing checks.',
  'Use the support you prepared with c3: advance your queen pawn two squares.',
);
const centralCapture = step(
  'exd4',
  'Black opens central lines',
  'Black exchanges the e-pawn for your advancing d-pawn.',
  'Removing the d4 pawn challenges your space advantage and opens the e-file. This is a central exchange, so calculate the recapture before deciding which side benefits.',
  'Black’s e-pawn captures the pawn that just advanced beside it.',
);
const castleWhite = step(
  'O-O',
  'Put your king behind cover',
  'Castle kingside to protect your king and bring the rook toward the center.',
  'With f1 and g1 cleared, castling removes your king from the opening e-file. The rook on f1 can support active play while your pawn center keeps Black occupied.',
  'Your kingside pieces have cleared the way. Move the king two squares toward the rook.',
);
const pressureF7 = step(
  'Ng5',
  'Add a second attacker on f7',
  'Your knight joins the bishop’s pressure on the f7 pawn.',
  'The bishop on c4 and knight on g5 both attack f7. This early second knight move is justified by a concrete threat, but Black can respond actively in the center with ...d5.',
  'Move the developed knight to a square that attacks f7 together with your bishop.',
);
const counterD5 = step(
  'd5',
  'Black meets an attack with central play',
  'Black attacks the bishop and interrupts the c4–f7 diagonal.',
  'The d5 pawn blocks the bishop’s route to f7 and attacks it. The point is to gain time against your threats rather than defend passively; exchanges can reopen that diagonal.',
  'Black’s queen pawn moves two squares, blocking your bishop’s diagonal.',
);
const takeD5 = step(
  'exd5',
  'Remove the central counterattack',
  'Capture the d5 pawn that attacks your bishop and gain a central foothold.',
  'Your e-pawn replaces Black’s pawn on d5, so the bishop is no longer attacked by that pawn. Your own d5 pawn still blocks its route to f7. Black’s choice between ...Na5 and ...Nxd5 changes the tactics.',
  'Use your e-pawn to capture the pawn attacking your bishop.',
);
const bishopOffer = step(
  'b4',
  'Trade a pawn for useful tempi',
  'The Evans Gambit offers your b-pawn to pull Black’s bishop away from c5.',
  'If the bishop captures on b4, c3 will attack it again while preparing d4. You invest a pawn to build a large center and develop quickly; compensation depends on using those tempi actively.',
  'Offer your queenside knight pawn two squares to attack the bishop on c5.',
);
const evansAccepted = [
  ...italianFoundation,
  bishopOffer,
  step(
    'Bxb4',
    'Black accepts the pawn offer',
    'Black’s bishop captures the b4 pawn.',
    'Black wins material but moves an already developed piece. White plans c3 with tempo, followed by a central advance, so Black must balance material against development.',
    'Black uses the bishop from c5 to take the offered pawn.',
  ),
  step(
    'c3',
    'Gain a tempo for your center',
    'Attack the bishop on b4 while preparing d4.',
    'Unlike a quiet c3 setup, this move directly attacks the bishop. Black must address that attack while you prepare to open central lines for your pieces.',
    'Move the c-pawn one square to attack Black’s bishop and support d4.',
  ),
  step(
    'Ba5',
    'Black keeps the bishop active',
    'The bishop retreats while staying on the a5–e1 diagonal.',
    'From a5 the bishop may influence the diagonal toward your king. It is no longer attacked by c3, but the time spent retreating gives White a chance to build the center.',
    'Black slides the attacked bishop to the safe a5 square.',
  ),
];

export const italianVariations: Variation[] = [
  giuocoPiano,
  giuocoPianissimo,
  variation(
    'italian-classical-center',
    'Classical Center',
    'Prepare d4 with c3, then learn to meet Black’s forcing bishop check.',
    [
      ...giuocoPiano.moves,
      centralAdvance,
      centralCapture,
      step(
        'cxd4',
        'Recapture toward the center',
        'Your c-pawn replaces the pawn on d4 and gives you a broad center.',
        'You now have pawns on d4 and e4, with central space and open lines for the queenside pieces. The c-file opens too; Black’s next check illustrates why rapid development still matters.',
        'Recapture the pawn on d4 with the pawn you placed on c3.',
      ),
      step(
        'Bb4+',
        'Black develops with check',
        'Black’s bishop checks along the diagonal toward e1.',
        'The c3 square was vacated by your recapture, so the bishop can use b4–c3–d2–e1. A check gains a tempo and reminds White to finish development and secure the king.',
        'Black moves the bishop from c5 to b4, giving check.',
      ),
    ],
  ),
  variation(
    'italian-evans-accepted',
    'Evans Gambit Accepted',
    'Offer the b-pawn for development and a quick central expansion.',
    [
      ...evansAccepted,
      centralAdvance,
      centralCapture,
      castleWhite,
      step(
        'Nge7',
        'Black reinforces the center',
        'Develop the g8 knight while adding support to the knight on c6.',
        'The knight on e7 supports c6 without blocking the f-pawn. Black prepares castling and tries to finish development before White’s central initiative grows.',
        'Black develops the g8 knight to e7; the other knight could also reach this square.',
      ),
    ],
  ),
  variation(
    'italian-evans-declined',
    'Evans Gambit Declined',
    'Keep your extra queenside space when Black refuses the gambit.',
    [
      ...italianFoundation,
      bishopOffer,
      step(
        'Bb6',
        'Black keeps material balanced',
        'The bishop retreats instead of capturing your offered pawn.',
        'Black avoids White’s forcing c3 tempo and retains pressure along b6–f2. White keeps the b-pawn and can use the extra queenside space without being a pawn down.',
        'Black retreats the bishop one square along the c5–b6 diagonal.',
      ),
      step(
        'a4',
        'Use your queenside space',
        'Advance the a-pawn to support a possible b5 push.',
        'The a4 pawn supports b5, which would attack the knight on c6. White’s queenside space creates useful possibilities, but it should support development rather than replace it.',
        'Support your advanced b-pawn with a two-square move of the a-pawn.',
      ),
      step(
        'a6',
        'Black provides a bishop retreat',
        'Black creates a7 as a retreat square for the bishop on b6.',
        'After White’s a4 and a future a5, Black’s bishop could be chased again. Advancing a6 gives it a safe a7 square and helps maintain the active diagonal.',
        'Black advances the a-pawn one square to make a retreat square behind it.',
      ),
    ],
  ),
  variation(
    'italian-two-knights-modern',
    'Two Knights: Modern Bishop',
    'Support e4 with d3 and finish development before choosing a central break.',
    [
      ...twoKnights,
      giuocoPianissimo.moves[6],
      step(
        'Be7',
        'Black chooses a restrained bishop square',
        'The bishop develops to e7 and clears f8 for castling.',
        'Unlike ...Bc5, ...Be7 keeps the bishop away from possible d4 attacks. Black gives up immediate pressure on f2 in exchange for a solid route to king safety.',
        'Black develops the f8 bishop one square, staying close to the center.',
      ),
      castleWhite,
      step(
        'O-O',
        'Black secures the king too',
        'Black castles and brings a rook toward the center.',
        'Both kings are now behind pawn cover. With no immediate attack to settle, White can improve the queenside pieces and prepare a well-supported d4 break.',
        'Black’s kingside pieces are developed; the king can castle.',
      ),
    ],
  ),
  variation(
    'italian-two-knights-polerio',
    'Two Knights: Polerio Defense',
    'Meet ...Na5 and learn how activity can compensate for an extra pawn.',
    [
      ...twoKnights,
      pressureF7,
      counterD5,
      takeD5,
      step(
        'Na5',
        'Black attacks your bishop',
        'The c6 knight jumps to a5 and attacks the bishop on c4.',
        'Black delays recapturing the d5 pawn to gain time against the bishop. This move avoids the exposed-king tactics of ...Nxd5, accepting a pawn deficit for active play.',
        'Black’s queenside knight moves to the edge to attack your bishop.',
      ),
      step(
        'Bb5+',
        'Retreat with a forcing check',
        'Your bishop moves out of attack and checks the king.',
        'A retreat that gives check makes Black spend a move on the king’s safety. Black can block with ...c6, challenging your bishop again and opening lines for development.',
        'Move the attacked bishop to b5, using the diagonal toward e8.',
      ),
      step(
        'c6',
        'Black blocks and gains a tempo',
        'The c-pawn interposes on c6 and attacks your bishop.',
        'This pawn blocks b5–c6–d7–e8 and attacks the bishop on b5. Black offers another pawn to open lines and accelerate development.',
        'Black blocks the bishop check with the c-pawn.',
      ),
      step(
        'dxc6',
        'Take the pawn that blocks your line',
        'Your pawn on d5 captures on c6.',
        'The capture removes the pawn attacking your bishop, but Black’s b-pawn can recapture and attack that bishop again. White remains ahead in material while Black gains open lines and tempi.',
        'Your advanced d5 pawn can capture the pawn on c6.',
      ),
      step(
        'bxc6',
        'Black opens a file for activity',
        'The b-pawn recaptures on c6 and attacks your bishop.',
        'Black restores a pawn on c6 and opens the b-file. The bishop on b5 is attacked again, showing why White’s material gain comes with a demand for accurate development.',
        'Black recaptures toward the center with the b-pawn.',
      ),
    ],
  ),
  variation(
    'italian-fried-liver',
    'Fried Liver Attack',
    'Recognize the tactical punishment of Black’s risky ...Nxd5 recapture.',
    [
      ...twoKnights,
      pressureF7,
      counterD5,
      takeD5,
      step(
        'Nxd5',
        'A risky recapture changes the tactics',
        'Black recaptures with the f6 knight, leaving f7 exposed.',
        'This is the inferior move that permits the Fried Liver attack, not a safe recommendation for Black. The knight leaves f6 and White can force Black’s king into the open.',
        'Black recaptures the d5 pawn with the knight from f6.',
      ),
      step(
        'Nxf7',
        'Force the king to make a decision',
        'Your knight captures f7, forking Black’s queen and rook.',
        'Black’s knight on d5 blocks the bishop’s diagonal, so the king can capture on f7. White then has Qf3+, attacking the exposed king and the knight on d5 at once. This sacrifice relies on calculation.',
        'Use the knight on g5 to capture the vulnerable pawn on f7.',
      ),
      step(
        'Kxf7',
        'Black accepts the tactical challenge',
        'Black’s king captures the knight and loses castling rights.',
        'The king on f7 is exposed, and Black must defend precisely after White’s forcing checks. White has sacrificed material for development and king exposure, not an immediate forced mate.',
        'Black captures the sacrificed knight with the king.',
      ),
      step(
        'Qf3+',
        'Attack two targets with check',
        'Your queen checks the king and also attacks the knight on d5.',
        'From f3 the queen attacks f7 vertically and d5 diagonally. Black must answer the check while keeping the knight defended, which forces an awkward king move.',
        'Bring the queen to f3, checking on the f-file and attacking d5.',
      ),
      step(
        'Ke6',
        'Black defends the knight with the king',
        'The king steps to e6 and supports the knight on d5.',
        'This central king move answers the queen check and protects d5, but creates a lasting target. White should bring more pieces into play rather than assume the attack wins without calculation.',
        'Black steps the king toward the center to protect d5 and escape the check.',
      ),
    ],
  ),
  variation(
    'italian-blackburne-shilling',
    'Blackburne–Shilling: Safe Response',
    'Avoid the e5-pawn trap by trading the advanced knight and castling.',
    [
      ...italianFoundation.slice(0, 5),
      step(
        'Nd4',
        'Black sets a pawn-grab trap',
        'Black moves the same knight again to d4, attacking your f3 knight.',
        'The tempting Nxe5 can let Black play ...Qg5 and create threats against g2 and the knight. White can instead simplify on d4 and develop safely.',
        'Black’s c6 knight jumps forward to d4.',
      ),
      step(
        'Nxd4',
        'Remove the advanced knight',
        'Trade your f3 knight for Black’s knight on d4.',
        'This avoids the tempting e5 pawn and removes the attacker on f3. Black can recapture with the e-pawn, after which White should complete development and challenge the center.',
        'Capture the knight on d4 with your developed knight instead of grabbing e5.',
      ),
      step(
        'exd4',
        'Black recaptures with the e-pawn',
        'Black’s e-pawn replaces the knight on d4.',
        'The pawn gains space but no longer controls d4 from e5. White can castle and later challenge it with c3, while developing the queenside pieces.',
        'Black’s e5 pawn captures your knight on d4.',
      ),
      castleWhite,
      step(
        'Bc5',
        'Black develops the bishop',
        'The bishop comes to c5 and eyes the f2 pawn.',
        'Black returns to normal development after the early knight exchange. White’s king is already safe, so c3 and d3 can challenge Black’s central foothold without falling into the original trap.',
        'Black develops the kingside bishop to its active c5 diagonal.',
      ),
    ],
  ),
  variation(
    'italian-hungarian',
    'Hungarian Defense',
    'Claim central space against Black’s compact ...Be7 setup.',
    [
      ...italianFoundation.slice(0, 5),
      step(
        'Be7',
        'Black keeps the bishop sheltered',
        'The bishop develops quietly to e7 instead of c5.',
        'Black prepares castling without inviting a d4 attack on the bishop. The cost is less immediate pressure on White’s center, which makes an early d4 advance attractive.',
        'Black develops the f8 bishop only one square.',
      ),
      step(
        'd4',
        'Use your freedom in the center',
        'Your d-pawn advances to challenge Black’s e5 pawn.',
        'Black’s bishop is not attacking f2, so White can claim central space directly. The d4 pawn works with e4 and opens the queenside bishop’s diagonal.',
        'Advance your queen pawn two squares and challenge e5.',
      ),
      step(
        'd6',
        'Black supports the e5 pawn',
        'The d-pawn protects e5 and opens the other bishop’s diagonal.',
        'Black chooses a compact center instead of immediately exchanging on d4. White has more space, but should develop pieces and prepare central exchanges carefully.',
        'Black’s queen pawn moves one square to support e5.',
      ),
      step(
        'c3',
        'Reinforce your space advantage',
        'Your c-pawn supports d4 and secures the central pawn duo.',
        'The c3 pawn helps maintain d4 if Black exchanges in the center. It blocks the knight’s c3 square temporarily, so White can later develop that knight through d2.',
        'Support the d4 pawn with a one-square c-pawn move.',
      ),
      blackKnightDevelopment,
    ],
  ),
];
