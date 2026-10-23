# ChessMahal

A mobile-first chess opening trainer. Learn the idea behind a move, recall it on the board, and return to it through spaced practice.

## Play online

[Play ChessMahal in your browser](https://first-move-chess-01a1084d.edorukalganturk.chatgpt.site) — no installation or account required. Share this link to start playing on a phone, tablet, or computer. Progress is saved locally on each device.

## Run

Requires Node.js 20.19+ and pnpm (or npm).

```sh
pnpm install
pnpm dev
```

Open http://localhost:5173. To verify and serve the offline-capable production app:

```sh
pnpm test
pnpm build
pnpm preview
```

You can also use npm:

```sh
npm install
npm run dev
```

To test and build with npm, use `npm test`, `npm run build`, and `npm run preview`.

## Branding

The approved crowned chess-palace logo is preserved in `src/assets/chessmahal-logo-v4.png`. The sidebar displays the full logo; the mobile header and footer pair its emblem with the ChessMahal wordmark. Both light and dark appearances are supported.

The favicon and install icons use the logo's crowned king detail. Edit `public/icon.svg` and run `node scripts/branding/export-icons.mjs` to regenerate the PNG icons. Branding assets are included in the production offline cache. Existing progress and appearance storage keys remain compatible.

## Included

- Complete Italian Game → Giuoco Piano: `1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6`.
- Twenty openings with ten playable variations each: 200 lessons in total. The original Italian Game, Ruy Lopez, Scotch Game, Queen’s Gambit, Sicilian Defense, French Defense, Caro-Kann, and King’s Indian Defense are joined by English, Réti, London, Vienna, King’s Gambit, Four Knights, Scandinavian, Pirc, Alekhine, Dutch, Nimzo-Indian, and Grünfeld.
- Interactive lessons, move explanations, expandable strategic explanations, hidden-sequence recall, repertoire puzzles, and scheduled reviews.
- Mixed opening practice combines learned positions from White and Black repertoires into shuffled rounds of up to ten unique questions. Opening names stay hidden until the answer, and learned alternatives from the same position are accepted.
- Searchable twenty-opening library with difficulty and learner-side filters, progress, named variations, and move-by-move teaching for every line. Search also recognizes variation names and unaccented opening names.
- Accuracy, gradual mastery, weakest variations, local-date streaks, and a configurable daily goal.
- Touch and keyboard-friendly SVG chessboard, legal destinations, hints, rotation, and retry feedback.
- Light, dark, and system appearance, with a quick theme toggle and a saved device preference.
- Larger reading text, clearer contrast, touch-friendly controls, and opening filters for practice and progress.

## Code structure

| Area                                            | Location                                      |
| ----------------------------------------------- | --------------------------------------------- |
| Opening and variation schema                    | `src/domain/types.ts`                         |
| Opening catalog and lookup                      | `src/domain/openings.ts`                      |
| Annotated variation content by opening          | `src/domain/opening-data/`                    |
| chess.js move validation and puzzle generation  | `src/domain/chess.ts`                         |
| Learned position pool and balanced mixed rounds | `src/domain/mixed-practice.ts`                |
| Mastery, scheduling, and statistics             | `src/domain/progress.ts`                      |
| Versioned local storage and recovery            | `src/domain/storage.ts`                       |
| Board and SVG pieces                            | `src/components/`                             |
| Learning screens and navigation                 | `src/App.tsx`                                 |
| Responsive visual design                        | `src/styles.css`                              |
| Offline cache and install metadata              | `public/sw.js`, `public/manifest.webmanifest` |

To add an opening, add its metadata to `openings.ts` and annotated variations to `opening-data/`. Provide legal SAN moves with a title, explanation, strategic reason, and hint for each move, then set `available: true`. Shared foundation moves keep explanations consistent within an opening. Library, lessons, recall, puzzles, and progress consume this data. The learner’s side comes from the opening data. Recall, puzzle generation, player labels, and board orientation adapt to White or Black repertoires. Existing variation IDs remain stable so saved progress survives catalog updates.

Names and defining move orders were checked against the primary [Lichess opening dataset](https://github.com/lichess-org/chess-openings). Strategic explanations are authored for these short lessons. Some branches transpose into related openings; gambit lessons explain material and development tradeoffs without claiming a forced win. Every line and generated learner decision is replayed and validated with chess.js in the catalog tests.

## Learning and progress

Learned variations move from New to Learning. First-try, unassisted recall controls mastery; hints and retries support learning without inflating the review score. Successful due reviews progress through Familiar, Good, and Mastered, with review intervals of 1, 3, 7, and then 14 days. Challenging variations return immediately. Practicing early does not award another mastery level.

Practice activity counts submitted legal moves, including wrong attempts. Overall move accuracy counts correct submissions divided by all submissions; the session summary separately reports first-try recall. Overall mastery averages started variations. Progress is versioned and stored in this browser on this device, with graceful handling of unavailable or damaged storage.

Mixed practice uses only completed lessons and omits each line’s initial starting move. Positions are grouped by board, turn, castling rights, and en-passant rights, so shared positions are not duplicated or incorrectly marked wrong when another learned branch supplies the played move. Each attempt is recorded against one relevant variation. Hints and retries remain assisted; individual mixed questions do not promote full-line mastery.

## Offline

The production build caches the application, bundled fonts, and resources after the first successful visit. Subsequent lessons, puzzles, and local progress work without a connection. The development server does not register the service worker. Deploy the production folder to an HTTPS host (localhost also supports service workers).

Puzzles ask for the learned repertoire move, rather than claiming there is only one objectively best legal move in the position. All positions and attempts are validated with chess.js.
